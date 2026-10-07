import { bearerSecurity } from "../../../shared/http/swagger-security";

export const movementSwagger = {
  tags: [
    {
      name: "Movements",
      description:
        "CRUD de movimientos de cuentas — JWT + RBAC",
    },
  ],

  paths: {
    "/api/movements": {
      get: {
        tags: ["Movements"],
        summary: "Listar movimientos activos",
        description:
          "JWT + RBAC — retorna movimientos con status=active",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Lista de movimientos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    movements: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Movement",
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Error al obtener los movimientos",
          },
        },
      },

      post: {
        tags: ["Movements"],
        summary: "Crear movimiento",
        description: "Crear un nuevo movimiento de cuenta.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementCreate",
              },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          201: {
            description: "Movimiento creado correctamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Movement",
                },
              },
            },
          },
          400: {
            description: "Datos del movimiento inválidos",
          },
          500: {
            description: "Error al crear el movimiento",
          },
        },
      },
    },

    "/api/movements/{id}": {
      get: {
        tags: ["Movements"],
        summary: "Obtener movimiento por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID del movimiento",
          },
        ],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Movimiento encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Movement",
                },
              },
            },
          },
          404: {
            description: "Movimiento no encontrado",
          },
          500: {
            description: "Error al obtener el movimiento",
          },
        },
      },

      put: {
        tags: ["Movements"],
        summary: "Actualizar movimiento (PUT — reemplazo)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID del movimiento",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementUpdate",
              },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          200: {
            description: "Movimiento actualizado correctamente",
          },
          404: {
            description: "Movimiento no encontrado",
          },
          400: {
            description: "Datos del movimiento inválidos",
          },
          500: {
            description: "Error al actualizar el movimiento",
          },
        },
      },

      patch: {
        tags: ["Movements"],
        summary: "Actualizar movimiento (PATCH — parcial)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID del movimiento",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementPatch",
              },
            },
          },
        },
        security: bearerSecurity,
        responses: {
          200: {
            description: "Movimiento actualizado correctamente",
          },
          404: {
            description: "Movimiento no encontrado",
          },
          400: {
            description: "Datos del movimiento inválidos",
          },
          500: {
            description: "Error al actualizar el movimiento",
          },
        },
      },

      delete: {
        tags: ["Movements"],
        summary: "Eliminar movimiento físicamente",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID del movimiento",
          },
        ],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Movimiento eliminado correctamente",
          },
          404: {
            description: "Movimiento no encontrado",
          },
          500: {
            description: "Error al eliminar el movimiento",
          },
        },
      },
    },

    "/api/movements/{id}/deactivate": {
      patch: {
        tags: ["Movements"],
        summary: "Desactivar movimiento",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID del movimiento",
          },
        ],
        security: bearerSecurity,
        responses: {
          200: {
            description: "Movimiento desactivado correctamente",
          },
          404: {
            description: "Movimiento no encontrado",
          },
          500: {
            description: "Error al desactivar el movimiento",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Movement: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.0,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte mensual",
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

      MovementCreate: {
        type: "object",
        required: [
          "account_id",
          "type",
          "date",
          "amount",
          "status",
        ],
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.0,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte mensual",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
        },
      },

      MovementUpdate: {
        type: "object",
        required: [
          "account_id",
          "type",
          "date",
          "amount",
          "status",
        ],
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "debit",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 100000.0,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Retiro de la cuenta",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
        },
      },

      MovementPatch: {
        type: "object",
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 500000.0,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte actualizado",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
        },
      },
    },
  },
};
