import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { toApiMessage } from './api-error';

describe('toApiMessage', () => {
  it('should explain connection errors when status is 0', () => {
    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
    });

    expect(toApiMessage(error)).toBe(
      'No se pudo conectar con el backend. Verifica que esté en http://localhost:4000.',
    );
  });

  it('should translate Express validation errors with details', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        error: 'Validation error',
        detail: 'name must be a string',
      },
    });

    expect(toApiMessage(error)).toBe(
      'Validation error — name must be a string',
    );
  });

  it('should return only Forbidden for RBAC errors', () => {
    const error = new HttpErrorResponse({
      status: 403,
      error: {
        error: 'Forbidden',
        detail: 'Sensitive permission information',
      },
    });

    expect(toApiMessage(error)).toBe('Forbidden');
  });

  it('should return a plain-text response as-is', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: 'Invalid request',
    });

    expect(toApiMessage(error)).toBe('Invalid request');
  });

  it('should return the backend error when there is no detail', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { error: 'Validation error' },
    });

    expect(toApiMessage(error)).toBe('Validation error');
  });

  it('should fall back to the HTTP error message when the body is empty', () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(toApiMessage(error)).toBe(error.message);
  });

  it('should return the message from a regular Error', () => {
    expect(toApiMessage(new Error('Unexpected failure'))).toBe(
      'Unexpected failure',
    );
  });

  it('should return a generic message for unknown values', () => {
    expect(toApiMessage(null)).toBe('Error inesperado');
    expect(toApiMessage('failure')).toBe('Error inesperado');
  });
});
