export interface ResourceCatalogItem {
  method: string;
  path: string;
  description: string;
}

export const RESOURCE_CATALOG: ResourceCatalogItem[] = [
  // =========================
  // MEMBERS
  // =========================
  {
    method: "GET",
    path: "/api/members",
    description: "Listar todos los socios",
  },
  {
    method: "GET",
    path: "/api/members/:id",
    description: "Consultar un socio por id",
  },
  {
    method: "POST",
    path: "/api/members",
    description: "Crear un socio",
  },
  {
    method: "PUT",
    path: "/api/members/:id",
    description: "Actualizar completamente un socio",
  },
  {
    method: "PATCH",
    path: "/api/members/:id",
    description: "Actualizar parcialmente un socio",
  },
  {
    method: "DELETE",
    path: "/api/members/:id",
    description: "Eliminar físicamente un socio",
  },
  {
    method: "PATCH",
    path: "/api/members/:id/deactivate",
    description: "Desactivar lógicamente un socio",
  },

  // =========================
  // ACCOUNTS
  // =========================
  {
    method: "GET",
    path: "/api/accounts",
    description: "Listar todas las cuentas",
  },
  {
    method: "GET",
    path: "/api/accounts/:id",
    description: "Consultar una cuenta por id",
  },
  {
    method: "POST",
    path: "/api/accounts",
    description: "Crear una cuenta",
  },
  {
    method: "PUT",
    path: "/api/accounts/:id",
    description: "Actualizar completamente una cuenta",
  },
  {
    method: "PATCH",
    path: "/api/accounts/:id",
    description: "Actualizar parcialmente una cuenta",
  },
  {
    method: "DELETE",
    path: "/api/accounts/:id",
    description: "Eliminar físicamente una cuenta",
  },
  {
    method: "PATCH",
    path: "/api/accounts/:id/deactivate",
    description: "Desactivar lógicamente una cuenta",
  },

  // =========================
  // MOVEMENTS
  // =========================
  {
    method: "GET",
    path: "/api/movements",
    description: "Listar todos los movimientos",
  },
  {
    method: "GET",
    path: "/api/movements/:id",
    description: "Consultar un movimiento por id",
  },
  {
    method: "POST",
    path: "/api/movements",
    description: "Crear un movimiento",
  },
  {
    method: "PUT",
    path: "/api/movements/:id",
    description: "Actualizar completamente un movimiento",
  },
  {
    method: "PATCH",
    path: "/api/movements/:id",
    description: "Actualizar parcialmente un movimiento",
  },
  {
    method: "DELETE",
    path: "/api/movements/:id",
    description: "Eliminar físicamente un movimiento",
  },
  {
    method: "PATCH",
    path: "/api/movements/:id/deactivate",
    description: "Desactivar lógicamente un movimiento",
  },

  // =========================
  // CREDIT APPLICATIONS
  // =========================
  {
    method: "GET",
    path: "/api/credit-applications",
    description: "Listar todas las solicitudes de crédito",
  },
  {
    method: "GET",
    path: "/api/credit-applications/:id",
    description: "Consultar una solicitud de crédito por id",
  },
  {
    method: "POST",
    path: "/api/credit-applications",
    description: "Crear una solicitud de crédito",
  },
  {
    method: "PUT",
    path: "/api/credit-applications/:id",
    description: "Actualizar completamente una solicitud de crédito",
  },
  {
    method: "PATCH",
    path: "/api/credit-applications/:id",
    description: "Actualizar parcialmente una solicitud de crédito",
  },
  {
    method: "DELETE",
    path: "/api/credit-applications/:id",
    description: "Eliminar físicamente una solicitud de crédito",
  },
  {
    method: "PATCH",
    path: "/api/credit-applications/:id/deactivate",
    description: "Desactivar lógicamente una solicitud de crédito",
  },

  // =========================
  // CREDITS
  // =========================
  {
    method: "GET",
    path: "/api/credits",
    description: "Listar todos los créditos",
  },
  {
    method: "GET",
    path: "/api/credits/:id",
    description: "Consultar un crédito por id",
  },
  {
    method: "POST",
    path: "/api/credits",
    description: "Crear un crédito",
  },
  {
    method: "PUT",
    path: "/api/credits/:id",
    description: "Actualizar completamente un crédito",
  },
  {
    method: "PATCH",
    path: "/api/credits/:id",
    description: "Actualizar parcialmente un crédito",
  },
  {
    method: "DELETE",
    path: "/api/credits/:id",
    description: "Eliminar físicamente un crédito",
  },
  {
    method: "PATCH",
    path: "/api/credits/:id/deactivate",
    description: "Desactivar lógicamente un crédito",
  },

  // =========================
  // RATES
  // =========================
  {
    method: "GET",
    path: "/api/rates",
    description: "Listar todas las tasas",
  },
  {
    method: "GET",
    path: "/api/rates/:id",
    description: "Consultar una tasa por id",
  },
  {
    method: "POST",
    path: "/api/rates",
    description: "Crear una tasa",
  },
  {
    method: "PUT",
    path: "/api/rates/:id",
    description: "Actualizar completamente una tasa",
  },
  {
    method: "PATCH",
    path: "/api/rates/:id",
    description: "Actualizar parcialmente una tasa",
  },
  {
    method: "DELETE",
    path: "/api/rates/:id",
    description: "Eliminar físicamente una tasa",
  },
  {
    method: "PATCH",
    path: "/api/rates/:id/deactivate",
    description: "Desactivar lógicamente una tasa",
  },

  // =========================
  // INSTALLMENTS
  // =========================
  {
    method: "GET",
    path: "/api/installments",
    description: "Listar todas las cuotas",
  },
  {
    method: "GET",
    path: "/api/installments/:id",
    description: "Consultar una cuota por id",
  },
  {
    method: "POST",
    path: "/api/installments",
    description: "Crear una cuota",
  },
  {
    method: "PUT",
    path: "/api/installments/:id",
    description: "Actualizar completamente una cuota",
  },
  {
    method: "PATCH",
    path: "/api/installments/:id",
    description: "Actualizar parcialmente una cuota",
  },
  {
    method: "DELETE",
    path: "/api/installments/:id",
    description: "Eliminar físicamente una cuota",
  },
  {
    method: "PATCH",
    path: "/api/installments/:id/deactivate",
    description: "Desactivar lógicamente una cuota",
  },

  // =========================
  // INSTALLMENT PAYMENTS
  // =========================
  {
    method: "GET",
    path: "/api/installment-payments",
    description: "Listar todos los pagos de cuotas",
  },
  {
    method: "GET",
    path: "/api/installment-payments/:id",
    description: "Consultar un pago de cuota por id",
  },
  {
    method: "POST",
    path: "/api/installment-payments",
    description: "Crear un pago de cuota",
  },
  {
    method: "PUT",
    path: "/api/installment-payments/:id",
    description: "Actualizar completamente un pago de cuota",
  },
  {
    method: "PATCH",
    path: "/api/installment-payments/:id",
    description: "Actualizar parcialmente un pago de cuota",
  },
  {
    method: "DELETE",
    path: "/api/installment-payments/:id",
    description: "Eliminar físicamente un pago de cuota",
  },
  {
    method: "PATCH",
    path: "/api/installment-payments/:id/deactivate",
    description: "Desactivar lógicamente un pago de cuota",
  },

  // =========================
  // COMMITTEE DECISIONS
  // =========================
  {
    method: "GET",
    path: "/api/committee-decisions",
    description: "Listar todas las decisiones del comité",
  },
  {
    method: "GET",
    path: "/api/committee-decisions/:id",
    description: "Consultar una decisión del comité por id",
  },
  {
    method: "POST",
    path: "/api/committee-decisions",
    description: "Registrar una decisión del comité",
  },
  {
    method: "PUT",
    path: "/api/committee-decisions/:id",
    description: "Actualizar completamente una decisión del comité",
  },
  {
    method: "PATCH",
    path: "/api/committee-decisions/:id",
    description: "Actualizar parcialmente una decisión del comité",
  },
  {
    method: "DELETE",
    path: "/api/committee-decisions/:id",
    description: "Eliminar físicamente una decisión del comité",
  },
  {
    method: "PATCH",
    path: "/api/committee-decisions/:id/deactivate",
    description: "Desactivar lógicamente una decisión del comité",
  },

  // =========================
  // AUDITS
  // =========================
  {
    method: "GET",
    path: "/api/audits",
    description: "Listar los registros de auditoría",
  },
  {
    method: "GET",
    path: "/api/audits/:id",
    description: "Consultar un registro de auditoría por id",
  },
  {
    method: "POST",
    path: "/api/audits",
    description: "Crear un registro de auditoría",
  },
];

/**
 * Recursos operativos permitidos para el rol SELLER.
 *
 * SELLER puede consultar información operativa de FondoSolidario,
 * pero no puede crear, actualizar, eliminar ni administrar permisos.
 */
export const SELLER_RESOURCES: ResourceCatalogItem[] = [
  {
    method: "GET",
    path: "/api/members",
    description: "Listar todos los socios",
  },
  {
    method: "GET",
    path: "/api/members/:id",
    description: "Consultar un socio por id",
  },
  {
    method: "GET",
    path: "/api/movements",
    description: "Listar todos los movimientos",
  },
  {
    method: "GET",
    path: "/api/credits",
    description: "Listar todos los créditos",
  },
  {
    method: "GET",
    path: "/api/installments",
    description: "Listar todas las cuotas",
  },
  {
    method: "GET",
    path: "/api/installment-payments",
    description: "Listar todos los pagos de cuotas",
  },
];
