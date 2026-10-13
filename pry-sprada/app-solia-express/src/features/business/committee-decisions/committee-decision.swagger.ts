/**
 * Documentación OpenAPI del feature CommitteeDecision.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints protegidos con JWT + RBAC (requiere JWT + RBAC).
 */

import { bearerSecurity } from "../../../shared/http/swagger-security";
export const committeeDecisionSwagger = {
  tags: [
    {
      name: "CommitteeDecisions",
      description:
        "CRUD de decisiones del comité — **JWT + RBAC** (requiere JWT + RBAC)",
    },
  ],

  paths: {
    "/api/committee-decisions": {
      get: {
        tags: ["CommitteeDecisions"],
        summary: "Listar decisiones del comité activas",
        description: "JWT + RBAC — retorna decisiones con status=active",
        security: bearerSecurity,
        responses: {
          "200": {
            description: "Lista de decisiones del comité",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decisions: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CommitteeDecision",
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
        tags: ["CommitteeDecisions"],
        summary: "Crear decisión del comité",
        description: "JWT + RBAC",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CommitteeDecisionCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Decisión del comité creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decision: {
                      $ref: "#/components/schemas/CommitteeDecision",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/committee-decisions/{id}": {
      get: {
        tags: ["CommitteeDecisions"],
        summary: "Obtener decisión del comité por id",
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
            description: "Decisión encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decision: {
                      $ref: "#/components/schemas/CommitteeDecision",
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
        tags: ["CommitteeDecisions"],
        summary: "Actualizar decisión del comité (PUT — reemplazo)",
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
                $ref: "#/components/schemas/CommitteeDecisionUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      patch: {
        tags: ["CommitteeDecisions"],
        summary: "Actualizar decisión del comité (PATCH — parcial)",
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
                $ref: "#/components/schemas/CommitteeDecisionPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      delete: {
        tags: ["CommitteeDecisions"],
        summary: "Eliminar decisión del comité (físico)",
        description: "JWT + RBAC — elimina la fila",
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
            description: "Eliminada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },

    "/api/committee-decisions/{id}/deactivate": {
      patch: {
        tags: ["CommitteeDecisions"],
        summary: "Eliminar decisión del comité (lógico)",
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
          "200": {
            description: "Cancelada",
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
      CommitteeDecision: {
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
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
            example: "approved",
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
            example: "Solicitud aprobada por el comité.",
          },
          decided_by: {
            type: "integer",
            nullable: true,
            example: 1,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
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

      CommitteeDecisionCreate: {
        type: "object",
        required: ["credit_application_id"],
        properties: {
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
            default: "pending",
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            default: "active",
          },
        },
      },

      CommitteeDecisionUpdate: {
        type: "object",
        required: ["credit_application_id"],
        properties: {
          credit_application_id: {
            type: "integer",
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },

      CommitteeDecisionPatch: {
        type: "object",
        properties: {
          credit_application_id: {
            type: "integer",
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
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
