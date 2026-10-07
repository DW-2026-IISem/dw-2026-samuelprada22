/**
 * Documentación OpenAPI del feature CreditApplication.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC
 * (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const creditApplicationSwagger = {
  tags: [
    {
      name: "CreditApplications",
      description:
        "CRUD de solicitudes de crédito — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/credit-applications": {
      get: {
        tags: ["CreditApplications"],
        summary: "Listar solicitudes de crédito",
        description:
          "JWT + RBAC — retorna las solicitudes de crédito registradas",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de solicitudes de crédito",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_applications: {
                      type: "array",
                      items: {
                        $ref:
                          "#/components/schemas/CreditApplication",
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
        tags: ["CreditApplications"],
        summary: "Crear solicitud de crédito",
        description:
          "JWT + RBAC — registra una nueva solicitud de crédito asociada a un socio",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/CreditApplicationCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Solicitud de crédito creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref:
                        "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Datos inválidos o campos obligatorios faltantes",
          },
        },
      },
    },

    "/api/credit-applications/{id}": {
      get: {
        tags: ["CreditApplications"],
        summary: "Obtener solicitud de crédito por id",
        description:
          "JWT + RBAC — retorna una solicitud de crédito específica",
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
            description: "Solicitud de crédito encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref:
                        "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      put: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PUT)",
        description:
          "JWT + RBAC — actualización completa de la solicitud de crédito",
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
                $ref:
                  "#/components/schemas/CreditApplicationUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      patch: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PATCH)",
        description:
          "JWT + RBAC — actualización parcial de la solicitud de crédito",
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
                $ref:
                  "#/components/schemas/CreditApplicationPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      delete: {
        tags: ["CreditApplications"],
        summary: "Eliminar solicitud de crédito (físico)",
        description:
          "JWT + RBAC — elimina físicamente la solicitud de crédito",
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
            description:
              "Solicitud de crédito eliminada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },
    },

    "/api/credit-applications/{id}/deactivate": {
      patch: {
        tags: ["CreditApplications"],
        summary: "Cancelar solicitud de crédito",
        description:
          "JWT + RBAC — cambia el estado de la solicitud a cancelled",
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
            description:
              "Solicitud de crédito cancelada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CreditApplication: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            example: 5000000,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            example: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Solicitud de crédito para libre inversión",
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

      CreditApplicationCreate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
            example: 5000000,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            default: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditApplicationUpdate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditApplicationPatch: {
        type: "object",
        properties: {
          member_id: {
            type: "integer",
          },
          reference_id: {
            type: "integer",
            nullable: true,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
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
