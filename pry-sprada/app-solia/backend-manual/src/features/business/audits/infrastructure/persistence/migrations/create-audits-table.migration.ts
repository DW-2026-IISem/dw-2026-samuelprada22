/**
 * Tabla: audits
 *
 * Campos:
 * - id
 * - actor_user_id
 * - accion
 * - entidad
 * - entidad_id
 * - datos
 * - created_at
 *
 * La tabla representa el registro histórico de las
 * acciones realizadas sobre las entidades del sistema.
 *
 * Las auditorías son inmutables:
 * no se actualizan ni se eliminan.
 *
 * La creación física de la tabla es gestionada por
 * sequelize.sync() en entornos no productivos.
 */
export const CREATE_AUDITS_TABLE = 'audits';
