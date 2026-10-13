import { CreationAttributes, Op, Transaction } from "sequelize";
import { User } from "./user.model";

/**
 * Capa Repository del feature Users.
 *
 * Única que habla con Sequelize. No contiene reglas de negocio
 * ni conoce req/res.
 */
export class UsersRepository {
  /**
   * Proyección utilizada por las lecturas normales.
   * La contraseña nunca se devuelve en las respuestas normales.
   */
  private static readonly WITHOUT_PASSWORD = {
    exclude: ["password"],
  };

  /**
   * Todos los usuarios activos, sin password.
   */
  public async findAllActive(): Promise<User[]> {
    return User.findAll({
      where: {
        status: "active",
      },
      attributes: UsersRepository.WITHOUT_PASSWORD,
    });
  }

  /**
   * Usuario por ID, sin password.
   */
  public async findById(
    id: number,
    transaction?: Transaction
  ): Promise<User | null> {
    return User.findByPk(id, {
      attributes: UsersRepository.WITHOUT_PASSWORD,
      transaction,
    });
  }

  /**
   * Usuario por ID incluyendo el hash.
   *
   * Uso exclusivo para cambio de contraseña.
   */
  public async findByIdWithPassword(
    id: number
  ): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Busca por username o email incluyendo el hash.
   *
   * Uso exclusivo para autenticación.
   */
  public async findByIdentifierWithPassword(
    identifier: string
  ): Promise<User | null> {
    const value = identifier.trim().toLowerCase();

    return User.findOne({
      where: {
        [Op.or]: [
          { username: value },
          { email: value },
        ],
      },
    });
  }

  /**
   * Busca conflictos de username o email.
   *
   * No devuelve password.
   */
  public async findConflicts(
    username: string,
    email: string
  ): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { username: username.trim().toLowerCase() },
          { email: email.trim().toLowerCase() },
        ],
      },
      attributes: ["id", "username", "email"],
    });
  }

  /**
   * Inserta un usuario.
   *
   * El hook del modelo User se encarga del hash.
   */
  public async create(
    data: CreationAttributes<User>
  ): Promise<User> {
    return User.create(data);
  }

  /**
   * Persiste cambios sobre una instancia existente.
   */
  public async update(
    user: User,
    data: Partial<User>
  ): Promise<User> {
    return user.update(data);
  }

  /**
   * Eliminación física de una instancia.
   */
  public async delete(user: User): Promise<void> {
    await user.destroy();
  }
}
