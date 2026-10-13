import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import {
  extractBearerToken,
  verifyAccessToken,
} from "../../../shared/auth/jwt";
import { User } from "../users/user.model";
import "../../../shared/auth/auth-user";

/**
 * MODALIDAD 2 — JWT (identidad).
 *
 * Middleware de autenticación.
 *
 * 1. Lee Authorization: Bearer <token>.
 * 2. Verifica firma, algoritmo, issuer, audience y expiración.
 * 3. Verifica que el usuario exista y esté activo.
 * 4. Deja la identidad en req.auth.
 *
 * No consulta roles ni permisos.
 * La autorización corresponde al middleware authorize.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    const payload = verifyAccessToken(token);

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      throw new AppError(401, "Invalid or expired access token");
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "email",
        "status",
      ],
    });

    if (!user || user.status !== "active") {
      throw new AppError(401, "Invalid or inactive user");
    }

    req.auth = {
      id: user.id,
      username: user.username,
      email: user.email,
      tokenId: payload.jti,
    };

    next();
  } catch (error) {
    sendError(res, error);
  }
}
