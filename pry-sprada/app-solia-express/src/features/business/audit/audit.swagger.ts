/**
 * Documentación OpenAPI del feature Audit.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const auditSwagger = {
  tags: [
    {
      name: "Audit",
      description: "Registro de auditoría — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],
  paths: {
    "/api/audits": {
      get: {
        tags: ["Audit"],
        summary: "Listar registros de auditoría",
        description: "JWT + RBAC — retorna los registros de auditoría ordenados por fecha descendente",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de registros de auditoría",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audits: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Audit",
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
        tags: ["Audit"],
        summary: "Crear registro de auditoría",
        description: "JWT + RBAC — registra una operación realizada sobre una entidad",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuditCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Registro de auditoría creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audit: {
                      $ref: "#/components/schemas/Audit",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/audits/{id}": {
      get: {
        tags: ["Audit"],
        summary: "Obtener registro de auditoría por id",
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
            description: "Registro de auditoría encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audit: {
                      $ref: "#/components/schemas/Audit",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Registro de auditoría no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Audit: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          actor_user_id: {
            type: "integer",
            example: 1,
          },
          action: {
            type: "string",
            example: "CREATE",
          },
          entity: {
            type: "string",
            example: "CreditApplication",
          },
          entity_id: {
            type: "integer",
            example: 1,
          },
          data: {
            type: "string",
            example: "{\"message\":\"Credit application created\"}",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      AuditCreate: {
        type: "object",
        required: [
          "actor_user_id",
          "action",
          "entity",
          "entity_id",
        ],
        properties: {
          actor_user_id: {
            type: "integer",
            example: 1,
          },
          action: {
            type: "string",
            example: "CREATE",
          },
          entity: {
            type: "string",
            example: "CreditApplication",
          },
          entity_id: {
            type: "integer",
            example: 1,
          },
          data: {
            type: "string",
            example: "{\"message\":\"Credit application created\"}",
            nullable: true,
          },
        },
      },
    },
  },
};
