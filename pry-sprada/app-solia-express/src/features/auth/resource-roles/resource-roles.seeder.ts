import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { RESOURCE_CATALOG, SELLER_RESOURCES } from "../resources/resource-catalog";
import { ResourceRolesService } from "./resource-roles.service";
 
/**
 * Seeder de las concesiones rol ↔ recurso (`resource_roles`). **Es el que
 * construye la matriz de permisos.**
 *
 * Reparto de referencia (`docs/bd-storelab.md` §21):
 *  - `ADMIN`  -> los **58** recursos (administración total).
 *  - `SELLER` -> los **7** recursos de operación (consultar clientes y
 *    productos, consultar y registrar ventas).
 *
 * Como `reconcileRole` es determinista, reejecutar el seeder **reconcilia** el
 * catálogo: concede lo que falte, reactiva lo inactivo y retira lo que sobre.
 * Así el rol `SELLER` nunca acumula permisos por accidente.
 */
export async function seedResourceRoles(): Promise<number> {
  const service = new ResourceRolesService();
 
  const resources = await Resource.findAll({ where: { status: "active" } });
  const idByOperation = new Map(
    resources.map((resource) => [`${resource.method} ${resource.path}`, resource.id])
  );
 
  /** Traduce el catálogo en código a los `resource_id` reales de la base. */
  const idsFor = (catalog: ReadonlyArray<{ method: string; path: string }>): number[] =>
    catalog
      .map((item) => idByOperation.get(`${item.method} ${item.path}`))
      .filter((id): id is number => typeof id === "number");
 
  let total = 0;
 
  const admin = await Role.findOne({ where: { name: "ADMIN" } });
  if (admin) {
    const result = await service.reconcileRole(admin.id, idsFor(RESOURCE_CATALOG));
    console.log(
      `✅ resource_roles: ADMIN -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }
 
  const seller = await Role.findOne({ where: { name: "SELLER" } });
  if (seller) {
    const result = await service.reconcileRole(seller.id, idsFor(SELLER_RESOURCES));
    console.log(
      `✅ resource_roles: SELLER -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }
 
  return total;
}
