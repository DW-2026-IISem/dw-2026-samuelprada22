import dotenv from "dotenv";
dotenv.config();

import { sequelize, testConnection } from "../src/database/db";
import "../src/features/auth/roles/role.model";
import "../src/features/auth/resources/resource.model";
import "../src/features/auth/resource-roles/resource-role.model";
import "../src/features/auth/rbac.associations";

import { Role } from "../src/features/auth/roles/role.model";
import { Resource } from "../src/features/auth/resources/resource.model";
import { ResourceRole } from "../src/features/auth/resource-roles/resource-role.model";
import { RESOURCE_CATALOG } from "../src/features/auth/resources/resource-catalog";

async function main(): Promise<void> {
  const connected = await testConnection();

  if (!connected) {
    throw new Error("No hay conexión a la base de datos");
  }

  const admin = await Role.findOne({
    where: { name: "ADMIN", status: "active" },
  });

  if (!admin) {
    throw new Error("No existe un rol ADMIN activo");
  }

  let createdResources = 0;
  let activatedResources = 0;
  let createdGrants = 0;
  let activatedGrants = 0;

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
    });

    if (created) {
      createdResources++;
    } else if (resource.status !== "active") {
      await resource.update({ status: "active" });
      activatedResources++;
    }

    const [grant, grantCreated] = await ResourceRole.findOrCreate({
      where: {
        role_id: admin.id,
        resource_id: resource.id,
      },
      defaults: {
        role_id: admin.id,
        resource_id: resource.id,
        status: "active",
      },
    });

    if (grantCreated) {
      createdGrants++;
    } else if (grant.status !== "active") {
      await grant.update({ status: "active" });
      activatedGrants++;
    }
  }

  const totalResources = await Resource.count({
    where: { status: "active" },
  });

  const totalAdminGrants = await ResourceRole.count({
    where: { role_id: admin.id, status: "active" },
  });

  console.log("\n===== SINCRONIZACIÓN COMPLETADA =====");
  console.log("Operaciones declaradas:", RESOURCE_CATALOG.length);
  console.log("Recursos nuevos:", createdResources);
  console.log("Recursos reactivados:", activatedResources);
  console.log("Concesiones ADMIN nuevas:", createdGrants);
  console.log("Concesiones ADMIN reactivadas:", activatedGrants);
  console.log("Total recursos activos:", totalResources);
  console.log("Total concesiones ADMIN activas:", totalAdminGrants);
  console.log("Las concesiones de SELLER no fueron modificadas.");
}

main()
  .catch((error: unknown) => {
    console.error("Error sincronizando recursos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
