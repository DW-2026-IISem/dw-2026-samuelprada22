import { Role } from "./role.model";

/**
 * Seeder del catálogo de roles (`roles`).
 *
 * Crea los dos roles de referencia del sistema. Es determinista (no usa datos
 * aleatorios) e idempotente: `findOrCreate` por nombre y reactivación si ya
 * existía inactivo.
 *
 * Los roles nacen sin permisos: las concesiones las crea el seeder de
 * `resource_roles` (ADMIN recibe los 58 recursos, SELLER los 7 de operación).
 */
export const SEED_ROLES = [
  {
    name: "ADMIN",
    description:
      "Administración del sistema: gestiona usuarios, roles y permisos",
  },
  {
    name: "SELLER",
    description:
      "Operación de ventas: consulta catálogo y registra ventas",
  },
] as const;

export async function seedRoles(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLES) {
    const [role, wasCreated] =
      await Role.findOrCreate({
        where: {
          name: item.name,
        },
        defaults: {
          name: item.name,
          description: item.description,
          status: "active",
        },
      });

    if (wasCreated) {
      created++;
      continue;
    }

    if (role.status !== "active") {
      await role.update({
        status: "active",
      });
    }
  }

  console.log(
    `✅ roles: catálogo reconciliado ` +
      `(${SEED_ROLES.length} roles, ${created} nuevos)`
  );

  return created;
}
