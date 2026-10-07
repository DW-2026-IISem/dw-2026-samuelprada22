/**
 * Documentación OpenAPI del feature Members.
 *
 * Se agrega desde src/swagger (registry externo),
 * no se monta directamente desde este feature.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC
 * (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const membersSwagger = {
  tags: [
    {
      name: "Members",
      description: "CRUD de Members — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/members": {
      get: {
        tags: ["Members"],
        summary: "Listar Members activos",
        description:
          "JWT + RBAC — retorna únicamente Members con isActive=true.",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de Members",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    members: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Member",
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
        tags: ["Members"],
        summary: "Crear Member",
        description: "JWT + RBAC",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MemberCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Member creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: {
                      $ref: "#/components/schemas/Member",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/members/{id}": {
      get: {
        tags: ["Members"],
        summary: "Obtener Member por ID",
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
            description: "Member encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: {
                      $ref: "#/components/schemas/Member",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      put: {
        tags: ["Members"],
        summary: "Actualizar Member (PUT)",
        description: "JWT + RBAC — actualización completa",
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
                $ref: "#/components/schemas/MemberUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Member actualizado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      patch: {
        tags: ["Members"],
        summary: "Actualizar Member (PATCH)",
        description: "JWT + RBAC — actualización parcial",
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
                $ref: "#/components/schemas/MemberPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Member actualizado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      delete: {
        tags: ["Members"],
        summary: "Eliminar Member físicamente",
        description: "JWT + RBAC — elimina físicamente la fila de la base de datos.",
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
            description: "Member eliminado físicamente",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },
    },

    "/api/members/{id}/deactivate": {
      patch: {
        tags: ["Members"],
        summary: "Desactivar Member",
        description:
          "JWT + RBAC — eliminación lógica estableciendo isActive=false.",
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
            description: "Member desactivado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Member: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Ana Pérez",
          },
          description: {
            type: "string",
            example: "Member registrado para pruebas",
          },
          isActive: {
            type: "boolean",
            example: true,
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

      MemberCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez",
          },
          description: {
            type: "string",
            example: "Descripción del Member",
          },
          isActive: {
            type: "boolean",
            default: true,
            example: true,
          },
        },
      },

      MemberUpdate: {
        type: "object",
        required: ["name", "isActive"],
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción actualizada",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },

      MemberPatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez Actualizada",
          },
          description: {
            type: "string",
            example: "Cambio parcial",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },
    },
  },
};
