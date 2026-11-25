import "dotenv/config";

import { sequelize, testConnection } from "../db";

import "../../features/auth/rbac.associations";

import { Role } from "../../features/auth/roles/role.model";
import { Resource } from "../../features/auth/resources/resource.model";
import { ResourceRole } from "../../features/auth/resource-roles/resource-role.model";
import { ResourceRolesService } from "../../features/auth/resource-roles/resource-roles.service";

const METHOD = "PUT";
const PATH = "/api/concesiones-rol/roles/:id";
const DESCRIPTION = "Reconciliar los permisos de un rol";

async function syncRolePermission(): Promise<void> {
  const connected = await testConnection();

  if (!connected) {
    throw new Error("No fue posible conectar con la base de datos.");
  }

  const role = await Role.findOne({
    where: {
      name: "ADMIN",
      status: "active",
    },
  });

  if (!role) {
    throw new Error("No se encontró el rol ADMIN activo.");
  }

  const [resource, created] = await Resource.findOrCreate({
    where: {
      method: METHOD,
      path: PATH,
    },
    defaults: {
      method: METHOD,
      path: PATH,
      description: DESCRIPTION,
      status: "active",
    },
  });

  if (resource.status !== "active") {
    await resource.update({
      status: "active",
      description: DESCRIPTION,
    });
  }

  const existingGrant = await ResourceRole.findOne({
    where: {
      role_id: role.id,
      resource_id: resource.id,
    },
  });

  if (existingGrant?.status === "active") {
    console.log("ℹ️ ADMIN ya tiene concedido este permiso.");
  } else {
    await new ResourceRolesService().grant({
      role_id: role.id,
      resource_id: resource.id,
    });

    console.log("✅ Permiso concedido al rol ADMIN.");
  }

  console.log({
    role: role.name,
    method: resource.method,
    path: resource.path,
    resource_id: resource.id,
    resource_created: created,
    grant_status: "active",
  });
}

(async () => {
  try {
    await syncRolePermission();
  } catch (error) {
    console.error("❌ Error sincronizando el permiso:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
