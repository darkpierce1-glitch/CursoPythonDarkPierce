/**
 * POST /api/login
 *
 * Body: { email: string, password: string }
 * Respuesta: { token, user: { id, email, role } }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from './_lib/db';
import { verifyPassword, signToken } from './_lib/auth';
import { methods, readBody, json, error } from './_lib/middleware';

export default methods(['POST'], async (req: VercelRequest, res: VercelResponse) => {
  const { email, password } = readBody<{ email?: string; password?: string }>(req);

  if (!email || !password) {
    return error(res, 400, 'Email y contraseña son obligatorios');
  }

  const sql = getSql();
  const result = await sql(
    'SELECT id, email, password, role FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase().trim()]
  );

  const rows = Array.isArray(result) ? result : (result as any).rows;
  const user = rows[0];

  if (!user) {
    // Pequeño delay para mitigar timing attacks
    await new Promise(r => setTimeout(r, 200));
    return error(res, 401, 'Credenciales inválidas');
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return error(res, 401, 'Credenciales inválidas');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return json(res, 200, {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});
