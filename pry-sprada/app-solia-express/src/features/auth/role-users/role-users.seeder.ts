import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { RoleUser } from "./role-user.model";

/**
 * Asignaciones canónicas de usuarios a roles.
 *
 * admin  -> ADMIN
 * seller -> SELLER
 *
 * El proceso es idempotente por la restricción única
 * (user_id, role_id).
 */
export const SEED_ROLE_USERS = [
  {
    username: "admin",
    roleName: "ADMIN",
  },
  {
    username: "seller",
    roleName: "SELLER",
  },
] as const;

export async function seedRoleUsers(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLE_USERS) {
    const user = await User.findOne({
      where: {
        username: item.username,
      },
    });

    if (!user) {
      console.warn(
        `⚠️ role_users: no se encontró el usuario "${item.username}"`
      );
      continue;
    }

    const role = await Role.findOne({
      where: {
        name: item.roleName,
      },
    });

    if (!role) {
      console.warn(
        `⚠️ role_users: no se encontró el rol "${item.roleName}"`
      );
      continue;
    }

    const [roleUser, wasCreated] = await RoleUser.findOrCreate({
      where: {
        user_id: user.id,
        role_id: role.id,
      },
      defaults: {
        user_id: user.id,
        role_id: role.id,
        status: "active",
      },
    });

    if (wasCreated) {
      created++;
      continue;
    }

    if (roleUser.status !== "active") {
      await roleUser.update({
        status: "active",
      });
    }
  }

  console.log(
    `✅ role_users: asignaciones reconciliadas ` +
      `(${SEED_ROLE_USERS.length} asignaciones, ${created} nuevas)`
  );

  return created;
}
