/**
 * Documentación OpenAPI del feature InstallmentPayment.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const installmentPaymentSwagger = {
  tags: [
    {
      name: "InstallmentPayments",
      description: "CRUD de pagos de cuota — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],
  paths: {
    "/api/installment-payments": {
      get: {
        tags: ["InstallmentPayments"],
        summary: "Listar pagos de cuota activos",
        description: "JWT + RBAC — retorna pagos con status=active",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de pagos de cuota",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payments: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/InstallmentPayment",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["InstallmentPayments"],
        summary: "Crear pago de cuota",
        description: "JWT + RBAC",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Pago de cuota creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payment: {
                      $ref: "#/components/schemas/InstallmentPayment",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/installment-payments/{id}": {
      get: {
        tags: ["InstallmentPayments"],
        summary: "Obtener pago de cuota por id",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Pago de cuota encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payment: {
                      $ref: "#/components/schemas/InstallmentPayment",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["InstallmentPayments"],
        summary: "Actualizar pago de cuota (PUT — reemplazo)",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentUpdate",
              },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["InstallmentPayments"],
        summary: "Actualizar pago de cuota (PATCH — parcial)",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentPatch",
              },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["InstallmentPayments"],
        summary: "Eliminar pago de cuota (físico)",
        description: "JWT + RBAC — borra la fila",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/installment-payments/{id}/deactivate": {
      patch: {
        tags: ["InstallmentPayments"],
        summary: "Eliminar pago de cuota (lógico)",
        description: "JWT + RBAC — status = cancelled",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Cancelado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      InstallmentPayment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          installment_id: { type: "integer", example: 1 },
          payment_date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:00:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          reference: {
            type: "string",
            example: "PAGO-CUOTA-001",
            nullable: true,
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
            example: "transfer",
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            example: "active",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      InstallmentPaymentCreate: {
        type: "object",
        required: ["installment_id", "amount", "method"],
        properties: {
          installment_id: {
            type: "integer",
            example: 1,
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
            example: "transfer",
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            default: "active",
          },
        },
      },
      InstallmentPaymentUpdate: {
        type: "object",
        required: ["installment_id", "amount", "method"],
        properties: {
          installment_id: {
            type: "integer",
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },
      InstallmentPaymentPatch: {
        type: "object",
        properties: {
          installment_id: {
            type: "integer",
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },
    },
  },
};
