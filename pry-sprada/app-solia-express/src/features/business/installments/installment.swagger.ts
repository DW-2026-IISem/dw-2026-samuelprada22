/**
 * Documentación OpenAPI del feature Installment.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const installmentSwagger = {
  tags: [
    {
      name: "Installments",
      description:
        "CRUD de cuotas de crédito — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/installments": {
      get: {
        tags: ["Installments"],
        summary: "Listar cuotas pendientes",
        description:
          "JWT + RBAC — retorna las cuotas con status=pending",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de cuotas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installments: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Installment",
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error al consultar las cuotas",
          },
        },
      },

      post: {
        tags: ["Installments"],
        summary: "Crear cuota",
        description:
          "JWT + RBAC — registra una nueva cuota asociada a un crédito",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cuota creada correctamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment: {
                      $ref: "#/components/schemas/Installment",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error al crear la cuota",
          },
        },
      },
    },

    "/api/installments/{id}": {
      get: {
        tags: ["Installments"],
        summary: "Obtener cuota por id",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment: {
                      $ref: "#/components/schemas/Installment",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      put: {
        tags: ["Installments"],
        summary: "Actualizar cuota (PUT — reemplazo)",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuota actualizada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      patch: {
        tags: ["Installments"],
        summary: "Actualizar cuota (PATCH — parcial)",
        description: "JWT + RBAC",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuota actualizada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      delete: {
        tags: ["Installments"],
        summary: "Eliminar cuota (físico)",
        description: "JWT + RBAC — elimina permanentemente la fila",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota eliminada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },
    },

    "/api/installments/{id}/deactivate": {
      patch: {
        tags: ["Installments"],
        summary: "Cancelar cuota (eliminación lógica)",
        description:
          "JWT + RBAC — cambia el estado de la cuota a cancelled",
        security: bearerSecurity,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota cancelada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Installment: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          credit_id: {
            type: "integer",
            example: 1,
            description: "Identificador del crédito asociado",
          },
          number: {
            type: "integer",
            example: 1,
            description: "Número de la cuota",
          },
          due_date: {
            type: "string",
            format: "date-time",
            example: "2026-11-30T00:00:00.000Z",
            description: "Fecha de vencimiento",
          },
          principal_amount: {
            type: "number",
            format: "double",
            example: 500000,
            description: "Valor del capital de la cuota",
          },
          interest_amount: {
            type: "number",
            format: "double",
            example: 7500,
            description: "Valor de los intereses",
          },
          total_amount: {
            type: "number",
            format: "double",
            example: 507500,
            description: "Valor total de la cuota",
          },
          paid_amount: {
            type: "number",
            format: "double",
            example: 0,
            description: "Valor pagado de la cuota",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
            example: "pending",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      InstallmentCreate: {
        type: "object",
        required: [
          "credit_id",
          "number",
          "due_date",
          "principal_amount",
          "interest_amount",
          "total_amount",
        ],
        properties: {
          credit_id: {
            type: "integer",
            example: 1,
          },
          number: {
            type: "integer",
            example: 1,
          },
          due_date: {
            type: "string",
            format: "date-time",
            example: "2026-11-30T00:00:00.000Z",
          },
          principal_amount: {
            type: "number",
            format: "double",
            example: 500000,
          },
          interest_amount: {
            type: "number",
            format: "double",
            example: 7500,
          },
          total_amount: {
            type: "number",
            format: "double",
            example: 507500,
          },
          paid_amount: {
            type: "number",
            format: "double",
            default: 0,
            example: 0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
            default: "pending",
          },
        },
      },

      InstallmentUpdate: {
        type: "object",
        required: [
          "credit_id",
          "number",
          "due_date",
          "principal_amount",
          "interest_amount",
          "total_amount",
        ],
        properties: {
          credit_id: {
            type: "integer",
          },
          number: {
            type: "integer",
          },
          due_date: {
            type: "string",
            format: "date-time",
          },
          principal_amount: {
            type: "number",
            format: "double",
          },
          interest_amount: {
            type: "number",
            format: "double",
          },
          total_amount: {
            type: "number",
            format: "double",
          },
          paid_amount: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
          },
        },
      },

      InstallmentPatch: {
        type: "object",
        properties: {
          credit_id: {
            type: "integer",
          },
          number: {
            type: "integer",
          },
          due_date: {
            type: "string",
            format: "date-time",
          },
          principal_amount: {
            type: "number",
            format: "double",
          },
          interest_amount: {
            type: "number",
            format: "double",
          },
          total_amount: {
            type: "number",
            format: "double",
          },
          paid_amount: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
          },
        },
      },
    },
  },
};
