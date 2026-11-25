import {
  bearerSecurity,
  openSecurity,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Session.
 *
 * - login / refresh / logout: OPEN
 * - perfil / permisos: JWT
 */
export const sessionSwagger = {
  tags: [
    {
      name: "Session",
      description:
        "Login, token refresh, logout, and profile — OPEN + JWT",
    },
  ],

  paths: {
    "/api/sesion/login": {
      post: {
        tags: ["Session"],
        summary: "Log in (OPEN)",
        description:
          "Validates username/email and password and opens a session. " +
          "Issues a JWT access token and a refresh token stored as a hash. " +
          "The response is identical for a nonexistent user and an incorrect password.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Login",
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Par de tokens (access_token y refresh_token)",
          },
          "400": {
            description:
              "Faltan identifier o password",
          },
          "401": {
            description:
              "Credenciales inválidas o usuario inactivo",
          },
        },
      },
    },

    "/api/sesion/refresh": {
      post: {
        tags: ["Session"],
        summary:
          "Refresh access token (OPEN with session credentials)",
        description:
          "Rotates the provided refresh token. " +
          "If a rotated token is reused, the entire token family is revoked.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RefreshToken",
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Par de tokens nuevo",
          },
          "400": {
            description:
              "Falta refresh_token",
          },
          "401": {
            description:
              "Token inválido, expirado o reutilizado",
          },
        },
      },
    },

    "/api/sesion/logout": {
      post: {
        tags: ["Session"],
        summary:
          "Log out (OPEN with session credentials)",
        description:
          "Revokes the provided refresh token. " +
          "This operation is idempotent.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RefreshToken",
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Sesión cerrada",
          },
          "400": {
            description:
              "Falta refresh_token",
          },
        },
      },
    },

    "/api/sesion/perfil": {
      get: {
        tags: ["Session"],
        summary:
          "Get authenticated user profile (JWT)",
        description:
          "Validates the JWT and checks that the user is still active.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Perfil del usuario autenticado",
          },
          "401": unauthorizedResponse,
        },
      },
    },

    "/api/permisos": {
      get: {
        tags: ["Session"],
        summary:
          "Get my effective permissions (JWT)",
        description:
          "Returns the authenticated user's effective permissions " +
          "using the same query as the authorize middleware.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Get user's effective permissions",
          },
          "401": unauthorizedResponse,
        },
      },
    },
  },

  components: {
    schemas: {
      Login: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: {
            type: "string",
            example: "admin",
            description:
              "Username or email",
          },
          password: {
            type: "string",
            format: "password",
            example: "Admin123!",
          },
        },
      },

      RefreshToken: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: {
            type: "string",
            example: "9f2c... (opaco, no es un JWT)",
          },
        },
      },

      SessionTokens: {
        type: "object",
        properties: {
          access_token: {
            type: "string",
            description:
              "JWT signed with HS256",
          },
          token_type: {
            type: "string",
            example: "Bearer",
          },
          expires_in: {
            type: "integer",
            example: 900,
            description:
              "Access token lifetime in seconds",
          },
          refresh_token: {
            type: "string",
            description:
              "Opaque token",
          },
          refresh_expires_in: {
            type: "integer",
            example: 604800,
          },
        },
      },
    },
  },
};
