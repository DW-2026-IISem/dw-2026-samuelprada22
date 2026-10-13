import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import {
  isOperationGranted,
  normalizePath,
} from "../../../shared/auth/resource-match";
import { ResourceRolesRepository } from "../resource-roles/resource-roles.repository";

/**
 * MODALIDAD 3 — JWT + RBAC.
 *
 * Middleware de autorización.
 *
 * Debe ejecutarse después de authenticate.
 *
 * Responde a la pregunta:
 * ¿puede esta identidad ejecutar method + path?
 *
 * La decisión se obtiene consultando la cadena de autorización:
 *
 *   user
 *    → role_users
 *    → roles
 *    → resource_roles
 *    → resources
 *
 * Todos los eslabones deben estar activos.
 *
 * Deny by default:
 * si no existe una concesión activa que cubra la operación,
 * se responde con 403.
 *
 * La consulta se realiza en cada petición, por lo que una
 * revocación tiene efecto inmediato.
 */
const resourceRolesRepository = new ResourceRolesRepository();

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(401, "Authentication required");
    }

    const method = req.method.toUpperCase();
    const path = normalizePath(req.originalUrl);

    const granted =
      await resourceRolesRepository.findEffectiveForUser(
        req.auth.id
      );

    if (!isOperationGranted(granted, method, path)) {
      throw new AppError(
        403,
        `Forbidden: no grant for ${method} ${path}`
      );
    }

    next();
  } catch (error) {
    sendError(res, error);
  }
}
