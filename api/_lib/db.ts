/**
 * Cliente Neon HTTP (optimizado para Vercel Functions).
 * Usa fetch contra el endpoint HTTP de Neon, no TCP. Esto significa
 * cero latencia de conexión en arranque y funciona con Vercel
 * serverless sin ningún cambio de configuración.
 */
import { neon, neonConfig } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  DATABASE_URL no está definida. Las funciones fallarán hasta configurarla en Vercel.'
  );
}

// Cache del cliente para no re-instanciar entre invocaciones serverless
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada');
  }
  if (!_sql) {
    // En el serverless runtime de Vercel, esto es seguro
    neonConfig.fetchConnectionCache = true;
    _sql = neon(DATABASE_URL);
  }
  return _sql;
}
