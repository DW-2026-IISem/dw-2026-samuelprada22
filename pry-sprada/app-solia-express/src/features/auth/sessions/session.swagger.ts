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
      name: "Sesión",
      description:
        "Login, renovación, cierre y perfil — OPEN + JWT",
    },
  ],

  paths: {
    "/api/sesion/login": {
      post: {
        tags: ["Sesión"],
        summary: "Iniciar sesión (OPEN)",
        description:
          "Valida usuario/correo + contraseña y abre una sesión. " +
          "Emite un access token JWT y un refresh token persistido como hash. " +
          "La respuesta es idéntica para usuario inexistente y contraseña incorrecta.",
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
        tags: ["Sesión"],
        summary:
          "Renovar el access token (OPEN con credencial de sesión)",
        description:
          "Rota el refresh token presentado. " +
          "Si se reutiliza un token ya rotado, se revoca toda la familia.",
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
        tags: ["Sesión"],
        summary:
          "Cerrar sesión (OPEN con credencial de sesión)",
        description:
          "Revoca el refresh token presentado. " +
          "La operación es idempotente.",
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
        tags: ["Sesión"],
        summary:
          "Perfil del usuario autenticado (JWT)",
        description:
          "Valida el JWT y comprueba que el usuario continúe activo.",
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
        tags: ["Sesión"],
        summary:
          "Mis permisos efectivos (JWT)",
        description:
          "Devuelve los permisos efectivos del usuario autenticado " +
          "usando la misma consulta que utiliza el middleware authorize.",
        security: bearerSecurity,
        responses: {
          "200": {
            description:
              "Permisos efectivos del usuario",
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
              "username o email",
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
              "JWT firmado con HS256",
          },
          token_type: {
            type: "string",
            example: "Bearer",
          },
          expires_in: {
            type: "integer",
            example: 900,
            description:
              "Segundos de vida del access token",
          },
          refresh_token: {
            type: "string",
            description:
              "Token opaco",
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
