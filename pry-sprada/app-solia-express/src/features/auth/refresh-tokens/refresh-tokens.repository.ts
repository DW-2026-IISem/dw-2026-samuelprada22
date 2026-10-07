import { CreationAttributes, Op, Transaction } from "sequelize";
import { RefreshToken } from "./refresh-token.model";

/**
 * Capa Repository del feature RefreshTokens (tabla `refresh_tokens`).
 *
 * Única capa que habla directamente con Sequelize.
 *
 * Las operaciones que participan en la rotación aceptan una transacción y,
 * cuando corresponde, aplican un bloqueo pesimista FOR UPDATE para impedir
 * que dos peticiones concurrentes consuman el mismo refresh token.
 */
export class RefreshTokensRepository {
  /**
   * Busca una sesión mediante el SHA-256 del refresh token.
   *
   * Cuando `lock` es true y existe una transacción, Sequelize aplica
   * un bloqueo pesimista sobre la fila.
   */
  public async findByTokenHash(
    tokenHash: string,
    transaction?: Transaction,
    lock = false
  ): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash },
      transaction,
      ...(lock && transaction
        ? { lock: transaction.LOCK.UPDATE }
        : {}),
    });
  }

  /**
   * Lista las sesiones de un usuario.
   *
   * Por defecto solamente devuelve sesiones activas.
   */
  public async findAllByUser(
    userId: number,
    onlyActive = true
  ): Promise<RefreshToken[]> {
    const where: Record<string, unknown> = {
      user_id: userId,
    };

    if (onlyActive) {
      where.status = "active";
    }

    return RefreshToken.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  }

  /** Busca una sesión mediante su identificador primario. */
  public async findById(id: number): Promise<RefreshToken | null> {
    return RefreshToken.findByPk(id);
  }

  /**
   * Crea una nueva sesión persistida.
   */
  public async create(
    data: CreationAttributes<RefreshToken>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(data, { transaction });
  }

  /**
   * Actualiza una sesión existente.
   */
  public async update(
    token: RefreshToken,
    data: Partial<CreationAttributes<RefreshToken>>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return token.update(data, { transaction });
  }

  /**
   * Revoca toda la familia de rotación.
   *
   * Se utiliza cuando se detecta reutilización de un refresh token que
   * ya había sido rotado. La familia completa queda inactiva.
   */
  public async revokeFamily(
    familyId: string,
    transaction?: Transaction
  ): Promise<number> {
    const [updated] = await RefreshToken.update(
      { status: "inactive" },
      {
        where: {
          family_id: familyId,
          status: "active",
        },
        transaction,
      }
    );

    return updated;
  }

  /**
   * Revoca todas las sesiones activas de un usuario.
   *
   * Se utiliza para cierre de sesión global.
   */
  public async revokeAllByUser(userId: number): Promise<number> {
    const [updated] = await RefreshToken.update({
      status: "inactive",
    }, {
      where: {
        user_id: userId,
        status: "active",
      },
    });

    return updated;
  }

  /**
   * Elimina físicamente las sesiones inactivas o expiradas de un usuario.
   */
  public async purgeInactiveByUser(userId: number): Promise<number> {
    return RefreshToken.destroy({
      where: {
        user_id: userId,
        [Op.or]: [
          { status: "inactive" },
          {
            expires_at: {
              [Op.lt]: new Date(),
            },
          },
        ],
      },
    });
  }

  /** Cuenta las sesiones activas de un usuario. */
  public async countActiveByUser(userId: number): Promise<number> {
    return RefreshToken.count({
      where: {
        user_id: userId,
        status: "active",
      },
    });
  }
}
