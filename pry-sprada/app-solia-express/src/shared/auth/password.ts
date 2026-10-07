import { hash, compare } from "bcryptjs";

/**
 * Derivación y verificación de contraseñas (bcrypt).
 */
const SALT_ROUNDS = 12;

/** Devuelve el hash bcrypt de una contraseña en claro. */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

/** `true` si la contraseña en claro corresponde al hash almacenado. */
export async function comparePassword(
  plain: string,
  passwordHash: string
): Promise<boolean> {
  return compare(plain, passwordHash);
}

import { createHash, randomBytes } from "node:crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Genera un token opaco no adivinable (URL-safe, 64 bytes ≈ 86 caracteres). */
export function generateOpaqueToken(): string {
  return randomBytes(64).toString("base64url");
}
