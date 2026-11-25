import dotenv from "dotenv";
dotenv.config();

import { sequelize, testConnection } from "../db";

import { Role } from "../../features/auth/roles/role.model";
import { Resource } from "../../features/auth/resources/resource.model";
import { ResourceRole } from "../../features/auth/resource-roles/resource-role.model";
import "../../features/auth/rbac.associations";

import { FONDSOLIDARIO_ROLES } from "../../features/auth/roles/roles.seeder";
import { RESOURCE_CATALOG } from "../../features/auth/resources/resource-catalog";
import type { ResourceCatalogItem } from "../../features/auth/resources/resource-catalog";

type RoleName =
  | "ADMIN"
  | "CAJERO"
  | "ANALISTA_CREDITO"
  | "COMITE"
  | "AUDITOR";

const ROLE_NAMES: RoleName[] = [
  "ADMIN",
  "CAJERO",
  "ANALISTA_CREDITO",
  "COMITE",
  "AUDITOR",
];

const READ_PREFIXES: Record<
  Exclude<RoleName, "ADMIN" | "AUDITOR">,
  string[]
> = {
  CAJERO: [
    "/api/members",
    "/api/accounts",
    "/api/movements",
    "/api/installments",
    "/api/installment-payments",
  ],
  ANALISTA_CREDITO: [
    "/api/members",
    "/api/accounts",
    "/api/credit-applications",
    "/api/credits",
    "/api/rates",
  ],
  COMITE: [
    "/api/credit-applications",
    "/api/credits",
    "/api/committee-decisions",
  ],
};

const WRITE_RESOURCES: Record<
  Exclude<RoleName, "ADMIN" | "AUDITOR">,
  string[]
> = {
  CAJERO: [
    "POST /api/movements",
    "POST /api/installment-payments",
  ],
  ANALISTA_CREDITO: [
    "POST /api/credit-applications",
  ],
  COMITE: [
    "POST /api/committee-decisions",
  ],
};

const ADMIN_ONLY_PREFIXES = [
  "/api/recursos",
  "/api/usuarios",
  "/api/roles",
  "/api/asignaciones-rol",
  "/api/concesiones-rol",
];

function operationKey(
  item: Pick<ResourceCatalogItem, "method" | "path">
): string {
  return `${item.method.toUpperCase()} ${item.path}`;
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function isOperationalRead(item: ResourceCatalogItem): boolean {
  if (item.method.toUpperCase() !== "GET") {
    return false;
  }

  return !ADMIN_ONLY_PREFIXES.some((prefix) =>
    matchesPrefix(item.path, prefix)
  );
}

function resourcesForRole(roleName: RoleName): ResourceCatalogItem[] {
  if (roleName === "ADMIN") {
    return [...RESOURCE_CATALOG];
  }

  if (roleName === "AUDITOR") {
    return RESOURCE_CATALOG.filter(isOperationalRead);
  }

  const prefixes = READ_PREFIXES[roleName];
  const allowedWrites = new Set(WRITE_RESOURCES[roleName]);

  return RESOURCE_CATALOG.filter((item) => {
    if (
      item.method.toUpperCase() === "GET" &&
      prefixes.some((prefix) => matchesPrefix(item.path, prefix))
    ) {
      return true;
    }

    return allowedWrites.has(operationKey(item));
  });
}

async function runRbacSeeder(): Promise<void> {
  const connected = await testConnection();

  if (!connected) {
    throw new Error("No hay conexión a la base de datos");
  }

  await sequelize.transaction(async (transaction) => {
    const rolesByName = new Map<string, Role>();

    // Crear o reactivar solamente los cinco roles aprobados.
    for (const item of FONDSOLIDARIO_ROLES) {
      const [role] = await Role.findOrCreate({
        where: { name: item.name },
        defaults: {
          name: item.name,
          description: item.description,
          status: "active",
        },
        transaction,
      });

      if (role.status !== "active") {
        await role.update({ status: "active" }, { transaction });
      }

      rolesByName.set(item.name, role);
    }

    const resourcesByOperation = new Map<string, Resource>();

    // Crear recursos faltantes. No reactivar recursos existentes inactivos.
    for (const item of RESOURCE_CATALOG) {
      const [resource, created] = await Resource.findOrCreate({
        where: {
          method: item.method,
          path: item.path,
        },
        defaults: {
          method: item.method,
          path: item.path,
          description: item.description,
          status: "active",
        },
        transaction,
      });

      if (!created && resource.status !== "active") {
        throw new Error(
          `El recurso existe inactivo: ${operationKey(item)}. ` +
          "No se modificó su estado; revisa este recurso antes de continuar."
        );
      }

      resourcesByOperation.set(operationKey(item), resource);
    }

    // Conceder o reactivar únicamente las concesiones seleccionadas.
    // No se retiran permisos adicionales ni se toca SELLER.
    for (const roleName of ROLE_NAMES) {
      const role = rolesByName.get(roleName);

      if (!role) {
        throw new Error(`No se pudo preparar el rol ${roleName}`);
      }

      const selectedResources = resourcesForRole(roleName);

      for (const item of selectedResources) {
        const resource = resourcesByOperation.get(operationKey(item));

        if (!resource) {
          throw new Error(
            `Recurso no registrado: ${operationKey(item)}`
          );
        }

        const [grant, created] = await ResourceRole.findOrCreate({
          where: {
            role_id: role.id,
            resource_id: resource.id,
          },
          defaults: {
            role_id: role.id,
            resource_id: resource.id,
            status: "active",
          },
          transaction,
        });

        if (!created && grant.status !== "active") {
          await grant.update({ status: "active" }, { transaction });
        }
      }

      console.log(
        `✓ ${roleName}: ${selectedResources.length} recursos concedidos/reactivados`
      );
    }
  });

  // Resumen de concesiones activas después de confirmar la transacción.
  for (const roleName of ROLE_NAMES) {
    const role = await Role.findOne({ where: { name: roleName } });

    if (!role) {
      throw new Error(`No se encontró el rol ${roleName}`);
    }

    const activeGrants = await ResourceRole.count({
      where: {
        role_id: role.id,
        status: "active",
      },
    });

    console.log(`  ${roleName}: ${activeGrants} concesiones activas`);
  }

  console.log("RBAC FondoSolidario configurado correctamente.");
}

if (require.main === module) {
  runRbacSeeder()
    .then(async () => {
      await sequelize.close();
      process.exitCode = 0;
    })
    .catch(async (error) => {
      console.error("Error configurando RBAC:", error);

      await sequelize.close();
      process.exitCode = 1;
    });
}
