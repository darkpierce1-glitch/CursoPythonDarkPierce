/**
 * Helpers de autenticación: bcrypt + JWT.
 *
 * JWT_SECRET: cadena larga aleatoria para firmar tokens. Si no está
 * configurada, usamos una por defecto SOLO en desarrollo (en Vercel
 * siempre debe estar).
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// En producción JWT_SECRET es obligatorio. En dev usamos un fallback
// para que el dev server arranque sin tener que configurar .env.
const SECRET = process.env.JWT_SECRET || 'dev-secret-DO-NOT-USE-IN-PRODUCTION-change-me';
const TOKEN_TTL = '7d';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: { headers: Record<string, any> }): string | null {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
