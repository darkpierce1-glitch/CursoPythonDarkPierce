/**
 * Helpers compartidos para endpoints serverless de Vercel.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyToken, type JwtPayload } from './auth';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function error(res: VercelResponse, status: number, message: string) {
  res.status(status).json({ error: message });
}

/**
 * Wrap un handler para que solo acepte ciertos métodos HTTP.
 */
export function methods(allowed: string[], handler: Handler): Handler {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', allowed.join(', '));
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).end();
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (!allowed.includes(req.method || '')) {
      error(res, 405, `Método ${req.method} no permitido`);
      return;
    }
    try {
      await handler(req, res);
    } catch (e: any) {
      console.error('Handler error:', e);
      error(res, 500, e?.message || 'Error interno del servidor');
    }
  };
}

/**
 * Parsea el body de un request serverless de Vercel.
 * Vercel ya parsea JSON si Content-Type es application/json, pero a veces
 * llega como string. Esta función maneja ambos casos.
 */
export function readBody<T = any>(req: VercelRequest): T {
  if (!req.body) return {} as T;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return {} as T;
    }
  }
  return req.body as T;
}

/**
 * Exige un JWT válido en el header Authorization. Devuelve el payload
 * o termina la request con 401.
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): JwtPayload | null {
  const token = extractToken(req);
  if (!token) {
    error(res, 401, 'Falta token de autenticación');
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    error(res, 401, 'Token inválido o expirado');
    return null;
  }
  return payload;
}

/**
 * Convierte un string a slug URL-friendly.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}
