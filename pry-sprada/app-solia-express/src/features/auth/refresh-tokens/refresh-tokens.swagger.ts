import {
  bearerSecurity,
  invalidIdResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature RefreshTokens.
 *
 * Modalidad JWT sin RBAC.
 *
 * Estas rutas administran exclusivamente las sesiones del usuario
 * autenticado y no forman parte del catálogo de recursos RBAC.
 */
export const refreshTokensSwagger = {
  tags: [
    {
      name: "Sesiones",
      description:
        "Sesiones persistidas del usuario autenticado (refresh tokens): listar, consultar y revocar — JWT",
    },
  ],

  paths: {
    "/api/sesiones": {
      get: {
        tags: ["Sesiones"],
        summary: "Listar mis sesiones activas",
        description:
          "JWT — devuelve las sesiones del usuario autenticado. `token_hash` nunca se expone.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Sesiones propias (`{ sessions: [...] }`)",
          },
          "401": unauthorizedResponse,
        },
      },

      delete: {
        tags: ["Sesiones"],
        summary: "Purgar mis sesiones revocadas/expiradas",
        description:
          "JWT — borrado físico de las sesiones propias que ya no son útiles.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Purga realizada (`{ message, purged }`)",
          },
          "401": unauthorizedResponse,
        },
      },
    },

    "/api/sesiones/deactivate-all": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar todas mis sesiones",
        description:
          "JWT — pone `inactive` todas las sesiones propias de todos los dispositivos.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Sesiones revocadas (`{ message, revoked }`)",
          },
          "401": unauthorizedResponse,
        },
      },
    },

    "/api/sesiones/{id}": {
      get: {
        tags: ["Sesiones"],
        summary: "Consultar una sesión propia",
        description:
          "JWT — devuelve `family_id`, `device_info`, `expires_at`, `status` e `is_expired`. Una sesión ajena responde 404.",
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
              "Sesión (`{ session }`)",
          },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": {
            description:
              "No encontrada o no pertenece al usuario autenticado",
          },
        },
      },
    },

    "/api/sesiones/{id}/deactivate": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar una sesión propia",
        description:
          "JWT — revocación lógica de una sesión concreta.",
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
              "Sesión revocada (`{ message, session }`)",
          },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": {
            description:
              "No encontrada o no pertenece al usuario autenticado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Session: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          user_id: {
            type: "integer",
            example: 2,
          },
          family_id: {
            type: "string",
            format: "uuid",
          },
          device_info: {
            type: "string",
            nullable: true,
            example: "Mozilla/5.0 ...",
          },
          expires_at: {
            type: "string",
            format: "date-time",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          is_expired: {
            type: "boolean",
            example: false,
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
    },
  },
};
