import { Transaction } from "sequelize";
import { randomUUID } from "node:crypto";
import {
  RefreshTokenResponseDto,
  toRefreshTokenResponse,
} from "./dto";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { RefreshToken } from "./refresh-token.model";
import { AppError } from "../../../shared/errors/app-error";
import {
  generateOpaqueToken,
  sha256Hex,
} from "../../../shared/auth/password";
import { withTransaction } from "../../../shared/database/with-transaction";

/** Vida útil de un refresh token en días. */
const REFRESH_TTL_DAYS = Number(
  process.env.JWT_REFRESH_TTL_DAYS ?? 7
);

/** Resultado de emitir una sesión nueva. */
export interface IssuedSession {
  rawToken: string;
  familyId: string;
  expiresAt: Date;
}

/**
 * Resultado de la rotación de un refresh token.
 *
 * Se utiliza una unión discriminada para permitir que la transacción
 * confirme una revocación por reutilización antes de responder con error.
 */
export type RotationOutcome =
  | {
      kind: "rotated";
      userId: number;
      rawToken: string;
      familyId: string;
      expiresAt: Date;
    }
  | {
      kind: "invalid";
    }
  | {
      kind: "expired";
    }
  | {
      kind: "reuse";
      familyId: string;
      revoked: number;
    };

/**
 * Capa Service del feature RefreshTokens.
 *
 * Responsabilidades:
 * - gestionar las sesiones propias del usuario;
 * - emitir refresh tokens;
 * - rotar refresh tokens;
 * - detectar reutilización;
 * - revocar sesiones y familias.
 */
export class RefreshTokensService {
  public constructor(
    private readonly repository: RefreshTokensRepository =
      new RefreshTokensRepository()
  ) {}

  // ================== GESTIÓN DE SESIONES PROPIAS ==================

  /**
   * Lista las sesiones activas del usuario autenticado.
   */
  public async getAllMine(
    userId: number
  ): Promise<RefreshTokenResponseDto[]> {
    const tokens = await this.repository.findAllByUser(userId);

    return tokens.map((token) =>
      toRefreshTokenResponse(token)
    );
  }

  /**
   * Obtiene una sesión concreta del usuario autenticado.
   */
  public async getMine(
    userId: number,
    id: number
  ): Promise<RefreshTokenResponseDto> {
    return toRefreshTokenResponse(
      await this.findMineOrFail(userId, id)
    );
  }

  /**
   * Revoca una sesión propia concreta.
   */
  public async revokeMine(
    userId: number,
    id: number
  ): Promise<RefreshTokenResponseDto> {
    const token = await this.findMineOrFail(userId, id);

    await this.repository.update(token, {
      status: "inactive",
    });

    return toRefreshTokenResponse(token);
  }

  /**
   * Revoca todas las sesiones activas del usuario.
   */
  public async revokeAllMine(userId: number): Promise<number> {
    return this.repository.revokeAllByUser(userId);
  }

  /**
   * Elimina sesiones propias inactivas o expiradas.
   */
  public async purgeMine(userId: number): Promise<number> {
    return this.repository.purgeInactiveByUser(userId);
  }

  /**
   * Cuenta las sesiones activas del usuario.
   */
  public async countActiveMine(userId: number): Promise<number> {
    return this.repository.countActiveByUser(userId);
  }

  // ================== CICLO DE VIDA ==================

  /**
   * Emite una nueva sesión.
   *
   * El refresh token se genera en claro, pero únicamente su SHA-256
   * queda persistido en la base de datos.
   */
  public async issue(
    userId: number,
    deviceInfo: string | null,
    transaction?: Transaction
  ): Promise<IssuedSession> {
    const rawToken = generateOpaqueToken();
    const familyId = randomUUID();
    const expiresAt = expiryFromNow();

    await this.repository.create(
      {
        user_id: userId,
        token_hash: sha256Hex(rawToken),
        family_id: familyId,
        device_info: deviceInfo,
        expires_at: expiresAt,
        status: "active",
      },
      transaction
    );

    return {
      rawToken,
      familyId,
      expiresAt,
    };
  }

  /**
   * Rota un refresh token.
   *
   * La operación completa se ejecuta dentro de una transacción.
   * La fila actual se bloquea mediante FOR UPDATE para impedir que
   * dos solicitudes concurrentes roten el mismo token.
   */
  public async rotate(
    rawToken: string,
    deviceInfo: string | null
  ): Promise<RotationOutcome> {
    const hash = sha256Hex(rawToken);

    const outcome = await withTransaction<RotationOutcome>(
      async (transaction) => {
        const current =
          await this.repository.findByTokenHash(
            hash,
            transaction,
            true
          );

        // El hash no existe.
        if (!current) {
          return {
            kind: "invalid",
          };
        }

        /**
         * REUSE DETECTION
         *
         * Si el token ya está inactivo, significa que anteriormente
         * fue consumido o revocado. Se considera una posible reutilización
         * y se revoca toda la familia.
         */
        if (current.status !== "active") {
          const revoked =
            await this.repository.revokeFamily(
              current.family_id,
              transaction
            );

          return {
            kind: "reuse",
            familyId: current.family_id,
            revoked,
          };
        }

        /**
         * Token encontrado pero expirado.
         *
         * Se marca como inactivo antes de finalizar la transacción.
         */
        if (
          new Date(current.expires_at).getTime() <=
          Date.now()
        ) {
          await this.repository.update(
            current,
            {
              status: "inactive",
            },
            transaction
          );

          return {
            kind: "expired",
          };
        }

        /**
         * ROTACIÓN
         *
         * El refresh token utilizado deja de estar activo.
         */
        await this.repository.update(
          current,
          {
            status: "inactive",
          },
          transaction
        );

        /**
         * Se genera un nuevo token dentro de la misma familia.
         */
        const rawNext = generateOpaqueToken();
        const expiresAt = expiryFromNow();

        await this.repository.create(
          {
            user_id: current.user_id,
            token_hash: sha256Hex(rawNext),
            family_id: current.family_id,
            device_info:
              deviceInfo ?? current.device_info,
            expires_at: expiresAt,
            status: "active",
          },
          transaction
        );

        return {
          kind: "rotated",
          userId: current.user_id,
          rawToken: rawNext,
          familyId: current.family_id,
          expiresAt,
        };
      }
    );

    return outcome;
  }

  /**
   * Revoca una sesión utilizando el refresh token en claro.
   *
   * La búsqueda se realiza mediante SHA-256.
   *
   * Es una operación idempotente:
   * - token inexistente → false;
   * - token ya inactivo → true;
   * - token activo → se revoca y devuelve true.
   */
  public async revokeByToken(
    rawToken: string
  ): Promise<boolean> {
    const token =
      await this.repository.findByTokenHash(
        sha256Hex(rawToken)
      );

    if (!token) {
      return false;
    }

    if (token.status !== "active") {
      return true;
    }

    await this.repository.update(token, {
      status: "inactive",
    });

    return true;
  }

  // ================== HELPERS ==================

  /**
   * Busca una sesión perteneciente al usuario autenticado.
   *
   * El filtro por user_id constituye la frontera de seguridad:
   * un usuario nunca puede consultar ni revocar la sesión de otro.
   *
   * Si el ID pertenece a otro usuario se responde 404 para no
   * revelar la existencia de una sesión ajena.
   */
  private async findMineOrFail(
    userId: number,
    id: number
  ): Promise<RefreshToken> {
    const token =
      await this.repository.findById(id);

    if (
      !token ||
      token.user_id !== userId
    ) {
      throw new AppError(
        404,
        "Session not found"
      );
    }

    return token;
  }
}

/**
 * Calcula la fecha de expiración del refresh token.
 *
 * Cada rotación genera una nueva ventana de vida.
 */
function expiryFromNow(): Date {
  return new Date(
    Date.now() +
      REFRESH_TTL_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}
