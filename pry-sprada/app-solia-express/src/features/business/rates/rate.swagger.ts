/**
 * Documentación OpenAPI del feature Rate.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const rateSwagger = {
  tags: [
    {
      name: "Rates",
      description: "CRUD de tasas — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],
  paths: {
    "/api/rates": {
      get: {
        tags: ["Rates"],
        summary: "Listar tasas activas",
        description: "JWT + RBAC — retorna tasas con status=active",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de tasas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rates: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Rate",
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
        tags: ["Rates"],
        summary: "Crear tasa",
        description: "JWT + RBAC",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RateCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Tasa creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rate: {
                      $ref: "#/components/schemas/Rate",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/rates/{id}": {
      get: {
        tags: ["Rates"],
        summary: "Obtener tasa por id",
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
            description: "Tasa encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rate: {
                      $ref: "#/components/schemas/Rate",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      put: {
        tags: ["Rates"],
        summary: "Actualizar tasa (PUT — reemplazo)",
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
                $ref: "#/components/schemas/RateUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tasa actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      patch: {
        tags: ["Rates"],
        summary: "Actualizar tasa (PATCH — parcial)",
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
                $ref: "#/components/schemas/RatePatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tasa actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      delete: {
        tags: ["Rates"],
        summary: "Eliminar tasa (físico)",
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
          "200": {
            description: "Tasa eliminada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },

    "/api/rates/{id}/deactivate": {
      patch: {
        tags: ["Rates"],
        summary: "Eliminar tasa (lógico)",
        description: "JWT + RBAC — status = inactive",
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
            description: "Tasa desactivada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Rate: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Tasa crédito ordinario",
          },
          percentage: {
            type: "number",
            format: "decimal",
            example: 1.5,
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
            example: "monthly",
          },
          description: {
            type: "string",
            example: "Tasa mensual para créditos ordinarios",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
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

      RateCreate: {
        type: "object",
        required: ["name", "percentage", "type"],
        properties: {
          name: {
            type: "string",
            example: "Tasa crédito ordinario",
          },
          percentage: {
            type: "number",
            format: "decimal",
            example: 1.5,
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
            example: "monthly",
          },
          description: {
            type: "string",
            example: "Tasa mensual para créditos ordinarios",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },

      RateUpdate: {
        type: "object",
        required: ["name", "percentage", "type"],
        properties: {
          name: {
            type: "string",
          },
          percentage: {
            type: "number",
            format: "decimal",
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
          },
          description: {
            type: "string",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },

      RatePatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          percentage: {
            type: "number",
            format: "decimal",
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
          },
          description: {
            type: "string",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },
    },
  },
};
