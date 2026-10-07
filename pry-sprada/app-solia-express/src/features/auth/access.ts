import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import {
  extractBearerToken,
  verifyAccessToken,
} from "../../shared/auth/jwt";
import { isOperationGranted } from "../../shared/auth/resource-match";
import { ResourceRolesService } from "./resource-roles/resource-roles.service";
import { User } from "./users/user.model";
import { sendError } from "../../shared/http/error-response";
import "../../shared/auth/auth-user";

const resourceRolesService = new ResourceRolesService();

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(
      req.headers.authorization
    );

    if (!token) {
      throw new AppError(
        401,
        "Authentication required"
      );
    }

    const payload = verifyAccessToken(token);

    const userId = Number(payload.sub);

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "username",
        "email",
        "status",
      ],
    });

    if (!user || user.status !== "active") {
      throw new AppError(
        401,
        "Invalid or inactive user"
      );
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

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(
        401,
        "Authentication required"
      );
    }

    const permissions =
      await resourceRolesService.findEffectiveForUser(
        req.auth.id
      );

    const granted = isOperationGranted(
      permissions,
      req.method,
      req.path
    );

    if (!granted) {
      throw new AppError(
        403,
        "Forbidden: insufficient permissions"
      );
    }

    next();
  } catch (error) {
    sendError(res, error);
  }
}
