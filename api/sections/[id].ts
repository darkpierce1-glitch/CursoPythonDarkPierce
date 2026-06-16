/**
 * GET    /api/sections/[id]   → sección individual con su contenido
 * PUT    /api/sections/[id]   → actualizar (admin)
 * DELETE /api/sections/[id]   → eliminar (admin)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import '@neondatabase/serverless';
import { getSql } from '../_lib/db.js';
import { methods, readBody, json, error, requireAuth } from '../_lib/middleware.js';

export default methods(['GET', 'PUT', 'DELETE'], async (req: VercelRequest, res: VercelResponse) => {
  const sql = getSql();
  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!id || Number.isNaN(id)) {
    return error(res, 400, 'ID inválido');
  }

  if (req.method === 'GET') {
    const sResult = await sql(
      `SELECT id, slug, title, subtitle, description, icon, gradient,
              lesson_label, order_index, published
       FROM sections WHERE id = $1`,
      [id]
    );
    const sRows = Array.isArray(sResult) ? sResult : (sResult as any).rows;
    const s = sRows[0];
    if (!s) return error(res, 404, 'Sección no encontrada');

    const tResult = await sql(
      `SELECT id, title, content, icon FROM theory_cards
       WHERE section_id = $1 ORDER BY order_index`,
      [id]
    );
    const eResult = await sql(
      `SELECT id, title, description, code, result FROM examples
       WHERE section_id = $1 ORDER BY order_index`,
      [id]
    );

    const theory = Array.isArray(tResult) ? tResult : (tResult as any).rows;
    const examples = Array.isArray(eResult) ? eResult : (eResult as any).rows;

    return json(res, 200, {
      id: s.id,
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      icon: s.icon,
      gradient: s.gradient,
      lessonLabel: s.lesson_label,
      order: s.order_index,
      published: s.published,
      theory,
      examples,
    });
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const body = readBody<any>(req);

    // Actualizar campos simples
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    const map: Record<string, string> = {
      title: 'title',
      subtitle: 'subtitle',
      description: 'description',
      icon: 'icon',
      gradient: 'gradient',
      lessonLabel: 'lesson_label',
      order: 'order_index',
      published: 'published',
      slug: 'slug',
    };
    for (const [k, col] of Object.entries(map)) {
      if (body[k] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(body[k]);
      }
    }
    if (fields.length > 0) {
      fields.push(`updated_at = NOW()`);
      values.push(id);
      await sql(
        `UPDATE sections SET ${fields.join(', ')} WHERE id = $${i}`,
        values
      );
    }

    // Reemplazar teoría si viene
    if (body.theory !== undefined) {
      await sql('DELETE FROM theory_cards WHERE section_id = $1', [id]);
      if (Array.isArray(body.theory)) {
        for (let j = 0; j < body.theory.length; j++) {
          const t = body.theory[j];
          if (!t.title || !t.content) continue;
          await sql(
            `INSERT INTO theory_cards (section_id, title, content, icon, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, t.title, t.content, t.icon || 'Book', j]
          );
        }
      }
    }

    // Reemplazar ejemplos si viene
    if (body.examples !== undefined) {
      await sql('DELETE FROM examples WHERE section_id = $1', [id]);
      if (Array.isArray(body.examples)) {
        for (let j = 0; j < body.examples.length; j++) {
          const e = body.examples[j];
          if (!e.title || !e.code) continue;
          await sql(
            `INSERT INTO examples (section_id, title, description, code, result, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, e.title, e.description || '', e.code, e.result || '', j]
          );
        }
      }
    }

    return json(res, 200, { ok: true });
  }

  if (req.method === 'DELETE') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    await sql('DELETE FROM sections WHERE id = $1', [id]);
    return json(res, 200, { ok: true });
  }
});
