import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature RoleUsers.
 *
 * Modalidad: JWT + RBAC.
 */
export const roleUsersSwagger = {
  tags: [
    {
      name: "User-Role Assignments",
      description:
        "Asignar, retirar y reactivar roles de usuarios (`role_users`) — JWT + RBAC",
    },
  ],

  paths: {
    "/api/asignaciones-rol": {
      get: {
        tags: ["User-Role Assignments"],
        summary: "List active assignments",
        description:
          "JWT + RBAC — lista las asignaciones activas usuario-rol.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Lista de asignaciones (`{ assignments: [...] }`)",
          },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },

      post: {
        tags: ["User-Role Assignments"],
        summary: "Assign role to user",
        description:
          "JWT + RBAC — asigna un rol a un usuario. " +
          "Si la asignación existía inactiva, se reactiva. " +
          "El usuario y el rol deben estar activos.",
        security: bearerSecurity,

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RoleUserCreate",
              },
            },
          },
        },

        responses: {
          "201": {
            description:
              "Asignación creada (`{ assignment }`)",
          },
          "400": {
            description:
              "user_id y role_id son obligatorios",
          },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": {
            description:
              "Usuario o rol inexistente o inactivo",
          },
          "409": {
            description:
              "El rol ya está asignado al usuario",
          },
        },
      },
    },

    "/api/asignaciones-rol/{id}": {
      get: {
        tags: ["User-Role Assignments"],
        summary: "Get assignment by ID",
        description:
          "JWT + RBAC — obtiene una asignación usuario-rol activa.",
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
              "Asignación (`{ assignment }`)",
          },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },

    "/api/asignaciones-rol/{id}/deactivate": {
      patch: {
        tags: ["User-Role Assignments"],
        summary: "Revoke user role",
        description:
          "JWT + RBAC — desactiva lógicamente la asignación. " +
          "El usuario deja de heredar los permisos del rol.",
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
              "Asignación desactivada (`{ message, assignment }`)",
          },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },

    "/api/asignaciones-rol/{id}/reactivate": {
      patch: {
        tags: ["User-Role Assignments"],
        summary: "Reactivate assignment",
        description:
          "JWT + RBAC — reactiva una asignación previamente desactivada.",
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
              "Asignación reactivada (`{ message, assignment }`)",
          },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": {
            description:
              "La asignación ya estaba activa",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      RoleUser: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          user_id: {
            type: "integer",
            example: 1,
          },
          role_id: {
            type: "integer",
            example: 1,
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
              username: {
                type: "string",
              },
              email: {
                type: "string",
                format: "email",
              },
            },
          },
          role: {
            type: "object",
            properties: {
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
            },
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

      RoleUserCreate: {
        type: "object",
        required: ["user_id", "role_id"],
        properties: {
          user_id: {
            type: "integer",
            example: 2,
          },
          role_id: {
            type: "integer",
            example: 2,
          },
        },
      },
    },
  },
};
