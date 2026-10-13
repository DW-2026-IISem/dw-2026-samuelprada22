/**
 * Documentación OpenAPI del feature Account.
 *
 * Se agrega desde src/swagger (registry externo),
 * no se monta directamente desde este feature.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC
 * (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const accountSwagger = {
  tags: [
    {
      name: "Accounts",
      description:
        "CRUD de cuentas — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/accounts": {
      get: {
        tags: ["Accounts"],
        summary: "Listar cuentas activas",
        description:
          "JWT + RBAC — retorna únicamente cuentas con status=active.",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de cuentas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accounts: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Account",
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
        tags: ["Accounts"],
        summary: "Crear cuenta",
        description: "JWT + RBAC",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AccountCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cuenta creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    account: {
                      $ref: "#/components/schemas/Account",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/accounts/{id}": {
      get: {
        tags: ["Accounts"],
        summary: "Obtener cuenta por ID",
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
            description: "Cuenta encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    account: {
                      $ref: "#/components/schemas/Account",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      put: {
        tags: ["Accounts"],
        summary: "Actualizar cuenta (PUT — reemplazo)",
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
                $ref: "#/components/schemas/AccountUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuenta actualizada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      patch: {
        tags: ["Accounts"],
        summary: "Actualizar cuenta (PATCH — parcial)",
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
                $ref: "#/components/schemas/AccountPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuenta actualizada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      delete: {
        tags: ["Accounts"],
        summary: "Eliminar cuenta físicamente",
        description: "JWT + RBAC — elimina físicamente la fila.",
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
            description: "Cuenta eliminada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },
    },

    "/api/accounts/{id}/deactivate": {
      patch: {
        tags: ["Accounts"],
        summary: "Desactivar cuenta",
        description:
          "JWT + RBAC — eliminación lógica estableciendo status=inactive.",
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
            description: "Cuenta desactivada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Account: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Cuenta de Ahorros",
          },
          description: {
            type: "string",
            example: "Cuenta de ahorro para asociados",
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

      AccountCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Cuenta de Ahorros",
          },
          description: {
            type: "string",
            example: "Cuenta de ahorro para asociados",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },

      AccountUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Cuenta de Ahorros Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción actualizada",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },

      AccountPatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Cuenta Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción parcial",
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
