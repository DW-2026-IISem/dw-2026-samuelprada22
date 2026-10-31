import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduce los errores HTTP a mensajes legibles para el usuario.
 * Los errores 403 son opacos a propósito para no revelar detalles de RBAC.
 */
export function toApiMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as
      | { error?: string; detail?: string }
      | string
      | null;

    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que esté en http://localhost:4000.';
    }

    if (error.status === 403) {
      return 'Forbidden';
    }

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (body && typeof body === 'object' && body.error) {
      return body.detail
        ? `${body.error} — ${body.detail}`
        : body.error;
    }

    return error.message;
  }

  return error instanceof Error
    ? error.message
    : 'Error inesperado';
}
