import { Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Traduce cualquier error a una respuesta HTTP.
 *
 * Regla:
 * - AppError -> utiliza su statusCode.
 * - Cualquier otro error -> 500.
 */
export function sendError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    detail: String(error),
  });
}
