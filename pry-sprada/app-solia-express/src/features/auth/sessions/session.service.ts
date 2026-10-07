import {
  LoginDto,
  LogoutSessionDto,
  ProfileDto,
  RefreshSessionDto,
  SessionTokensDto,
} from "./dto";
import { UsersRepository } from "../users/users.repository";
import { UsersService } from "../users/users.service";
import { RefreshTokensService } from "../refresh-tokens/refresh-tokens.service";
import { User } from "../users/user.model";
import { AppError } from "../../../shared/errors/app-error";
import { comparePassword } from "../../../shared/auth/password";
import { signAccessToken } from "../../../shared/auth/jwt";

/**
 * Capa Service del feature Session — ciclo de vida de la sesión.
 *
 * Las operaciones login, refresh y logout son OPEN porque utilizan
 * credenciales de sesión. Profile y permissions requieren JWT.
 */
export class SessionService {
  public constructor(
    private readonly usersRepository: UsersRepository =
      new UsersRepository(),

    private readonly usersService: UsersService =
      new UsersService(),

    private readonly refreshTokensService: RefreshTokensService =
      new RefreshTokensService()
  ) {}

  // ================== LOGIN (OPEN) ==================

  /**
   * Valida credenciales y abre una nueva sesión.
   *
   * La respuesta es la misma para usuario inexistente,
   * usuario inactivo o contraseña incorrecta.
   */
  public async login(
    body: LoginDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.identifier || !body.password) {
      throw new AppError(
        400,
        "identifier and password are required"
      );
    }

    const user =
      await this.usersRepository.findByIdentifierWithPassword(
        body.identifier
      );

    if (!user || user.status !== "active") {
      throw new AppError(
        401,
        "Invalid credentials"
      );
    }

    const matches = await comparePassword(
      body.password,
      user.password
    );

    if (!matches) {
      throw new AppError(
        401,
        "Invalid credentials"
      );
    }

    const session =
      await this.refreshTokensService.issue(
        user.id,
        deviceInfo
      );

    return this.buildTokens(
      user,
      session.rawToken,
      session.expiresAt
    );
  }

  // ================== REFRESH (OPEN) ==================

  /**
   * Rota el refresh token y genera un nuevo par de tokens.
   */
  public async refresh(
    body: RefreshSessionDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.refresh_token) {
      throw new AppError(
        400,
        "refresh_token is required"
      );
    }

    const outcome =
      await this.refreshTokensService.rotate(
        body.refresh_token,
        deviceInfo
      );

    if (outcome.kind === "invalid") {
      throw new AppError(
        401,
        "Invalid refresh token"
      );
    }

    if (outcome.kind === "expired") {
      throw new AppError(
        401,
        "Refresh token expired"
      );
    }

    if (outcome.kind === "reuse") {
      throw new AppError(
        401,
        "Refresh token reuse detected: session family revoked"
      );
    }

    // El usuario puede haber sido desactivado después
    // de emitir el refresh token.
    const user =
      await this.usersRepository.findById(
        outcome.userId
      );

    if (!user || user.status !== "active") {
      await this.refreshTokensService.revokeAllMine(
        outcome.userId
      );

      throw new AppError(
        401,
        "User is not active"
      );
    }

    return this.buildTokens(
      user,
      outcome.rawToken,
      outcome.expiresAt
    );
  }

  // ================== LOGOUT (OPEN) ==================

  /**
   * Revoca la sesión asociada al refresh token.
   *
   * Es una operación idempotente: si el token ya estaba
   * revocado, no genera un error.
   */
  public async logout(
    body: LogoutSessionDto
  ): Promise<void> {
    if (!body.refresh_token) {
      throw new AppError(
        400,
        "refresh_token is required"
      );
    }

    await this.refreshTokensService.revokeByToken(
      body.refresh_token
    );
  }

  // ================== PROFILE (JWT) ==================

  /**
   * Devuelve los datos públicos del usuario autenticado.
   */
  public async profile(
    userId: number
  ): Promise<ProfileDto> {
    const user =
      await this.usersRepository.findById(
        userId
      );

    if (!user || user.status !== "active") {
      throw new AppError(
        404,
        "User not found"
      );
    }

    return toProfile(user);
  }

  // ================== PERMISSIONS (JWT) ==================

  /**
   * Permisos efectivos del usuario autenticado.
   *
   * Reutiliza UsersService para mantener una única
   * implementación de la lógica de permisos.
   */
  public async myPermissions(
    userId: number
  ) {
    return this.usersService.getEffectivePermissions(
      userId
    );
  }

  // ================== HELPERS ==================

  /**
   * Construye el par access + refresh.
   */
  private buildTokens(
    user: User,
    refreshToken: string,
    refreshExpiresAt: Date
  ): SessionTokensDto {
    const access =
      signAccessToken({
        id: user.id,
        username: user.username,
      });

    return {
      access_token: access.token,
      token_type: "Bearer",
      expires_in: access.expiresIn,
      refresh_token: refreshToken,
      refresh_expires_in: Math.max(
        0,
        Math.floor(
          (refreshExpiresAt.getTime() -
            Date.now()) /
            1000
        )
      ),
    };
  }
}

/**
 * Proyección segura del usuario autenticado.
 *
 * Nunca incluye password.
 */
function toProfile(
  user: User
): ProfileDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? null,
    status: user.status,
  };
}
