import { User } from "./users/user.model";
import { Role } from "./roles/role.model";
import { Resource } from "./resources/resource.model";
import { RoleUser } from "./role-users/role-user.model";
import { ResourceRole } from "./resource-roles/resource-role.model";
import { RefreshToken } from "./refresh-tokens/refresh-token.model";

/**
 * Asociaciones de las seis entidades de seguridad.
 *
 * Se declaran en un solo archivo para mantener centralizado el grafo RBAC.
 */

// --- ResourceRole: concesión Role ↔ Resource ---
ResourceRole.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

ResourceRole.belongsTo(Resource, {
  foreignKey: "resource_id",
  as: "resource",
});

Role.hasMany(ResourceRole, {
  foreignKey: "role_id",
  as: "resource_roles",
});

Resource.hasMany(ResourceRole, {
  foreignKey: "resource_id",
  as: "resource_roles",
});

// --- RoleUser: asignación User ↔ Role ---
RoleUser.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

RoleUser.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

User.hasMany(RoleUser, {
  foreignKey: "user_id",
  as: "role_users",
});

Role.hasMany(RoleUser, {
  foreignKey: "role_id",
  as: "role_users",
});

// --- RefreshToken: sesiones pertenecientes a User ---
RefreshToken.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(RefreshToken, {
  foreignKey: "user_id",
  as: "refresh_tokens",
});
