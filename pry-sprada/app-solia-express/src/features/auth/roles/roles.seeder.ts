import { Role } from "./role.model";

/**
 * Seeder del catálogo de roles (`roles`).
 *
 * Define los roles iniciales de FondoSolidario y conserva SELLER
 * por compatibilidad con instalaciones anteriores.
 *
 * La creación de roles y la asignación de concesiones son procesos separados.
 */
export const FONDSOLIDARIO_ROLES = [
  {
    name: "ADMIN",
    description:
      "Administración del sistema: gestiona usuarios, roles y permisos",
  },
  {
    name: "CAJERO",
    description:
      "Gestiona movimientos y pagos de cuotas",
  },
  {
    name: "ANALISTA_CREDITO",
    description:
      "Evalúa y registra solicitudes de crédito",
  },
  {
    name: "COMITE",
    description:
      "Consulta solicitudes y registra decisiones del comité",
  },
  {
    name: "AUDITOR",
    description:
      "Consulta información operativa y registros de auditoría",
  },
] as const;

// Se conserva SELLER para no romper instalaciones anteriores.
export const SEED_ROLES = [
  ...FONDSOLIDARIO_ROLES,
  {
    name: "SELLER",
    description:
      "Rol heredado conservado por compatibilidad",
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
