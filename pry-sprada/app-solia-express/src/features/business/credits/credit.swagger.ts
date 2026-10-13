/**
 * Documentación OpenAPI del feature Credit.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const creditSwagger = {
  tags: [
    {
      name: "Credits",
      description:
        "CRUD de créditos — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/credits": {
      get: {
        tags: ["Credits"],
        summary: "Listar créditos",
        description: "JWT + RBAC — retorna todos los créditos",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de créditos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credits: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Credit",
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
        tags: ["Credits"],
        summary: "Crear crédito",
        description:
          "JWT + RBAC — registra un nuevo crédito",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Crédito creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit: {
                      $ref: "#/components/schemas/Credit",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos inválidos",
          },
        },
      },
    },

    "/api/credits/{id}": {
      get: {
        tags: ["Credits"],
        summary: "Obtener crédito por id",
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
            description: "Crédito encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit: {
                      $ref: "#/components/schemas/Credit",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      put: {
        tags: ["Credits"],
        summary: "Actualizar crédito (PUT — reemplazo)",
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
                $ref: "#/components/schemas/CreditUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Crédito actualizado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      patch: {
        tags: ["Credits"],
        summary: "Actualizar crédito (PATCH — parcial)",
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
                $ref: "#/components/schemas/CreditPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Crédito actualizado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      delete: {
        tags: ["Credits"],
        summary: "Eliminar crédito (físico)",
        description: "JWT + RBAC — elimina la fila",
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
            description: "Crédito eliminado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },
    },

    "/api/credits/{id}/deactivate": {
      patch: {
        tags: ["Credits"],
        summary: "Cancelar crédito (lógico)",
        description:
          "JWT + RBAC — status = cancelled",
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
            description: "Crédito cancelado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Credit: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          rate_id: {
            type: "integer",
            example: 1,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
            example: 5000000,
          },
          term: {
            type: "integer",
            example: 24,
          },
          interest_rate: {
            type: "number",
            format: "double",
            example: 1.5,
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
            example: "active",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Crédito aprobado para el asociado",
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

      CreditCreate: {
        type: "object",
        required: [
          "credit_application_id",
          "rate_id",
          "approved_amount",
          "term",
          "interest_rate",
        ],
        properties: {
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          rate_id: {
            type: "integer",
            example: 1,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
            example: 5000000,
          },
          term: {
            type: "integer",
            example: 24,
          },
          interest_rate: {
            type: "number",
            format: "double",
            example: 1.5,
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
            default: "active",
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditUpdate: {
        type: "object",
        required: [
          "credit_application_id",
          "rate_id",
          "approved_amount",
          "term",
          "interest_rate",
        ],
        properties: {
          credit_application_id: {
            type: "integer",
          },
          rate_id: {
            type: "integer",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
          },
          term: {
            type: "integer",
          },
          interest_rate: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditPatch: {
        type: "object",
        properties: {
          credit_application_id: {
            type: "integer",
          },
          rate_id: {
            type: "integer",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
          },
          term: {
            type: "integer",
          },
          interest_rate: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
};
