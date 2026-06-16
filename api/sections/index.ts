/**
 * GET  /api/sections   → público: lista todas las secciones publicadas
 *                       con sus tarjetas de teoría y ejemplos.
 * POST /api/sections   → admin: crea una sección nueva.
 * PUT  /api/sections?id=123 → admin: actualiza una sección.
 * DELETE /api/sections?id=123 → admin: elimina una sección.
 *
 * Query params (GET):
 *   - includeUnpublished=true  → solo admin
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import '@neondatabase/serverless';
import { getSql } from '../_lib/db.js';
import { methods, readBody, json, error, requireAuth, slugify } from '../_lib/middleware.js';

interface Section {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  gradient: string | null;
  lesson_label: string | null;
  order_index: number;
  published: boolean;
}

export default methods(['GET', 'POST', 'PUT', 'DELETE'], async (req: VercelRequest, res: VercelResponse) => {
  const sql = getSql();

  if (req.method === 'GET') {
    const includeUnpublished = req.query.includeUnpublished === 'true';
    if (includeUnpublished) {
      const auth = await requireAuth(req, res);
      if (!auth) return;
    }

    const sectionsResult = await sql(
      `SELECT id, slug, title, subtitle, description, icon, gradient,
              lesson_label, order_index, published
       FROM sections
       WHERE published = TRUE ${includeUnpublished ? 'OR TRUE' : ''}
       ORDER BY order_index ASC, id ASC`
    );
    const sections = (Array.isArray(sectionsResult) ? sectionsResult : (sectionsResult as any).rows) as Section[];

    if (sections.length === 0) {
      return json(res, 200, []);
    }

    const ids = sections.map(s => s.id);
    const theoryResult = await sql(
      `SELECT id, section_id, title, content, icon, order_index
       FROM theory_cards
       WHERE section_id = ANY($1)
       ORDER BY section_id, order_index`,
      [ids]
    );
    const examplesResult = await sql(
      `SELECT id, section_id, title, description, code, result, order_index
       FROM examples
       WHERE section_id = ANY($1)
       ORDER BY section_id, order_index`,
      [ids]
    );

    const theory = (Array.isArray(theoryResult) ? theoryResult : (theoryResult as any).rows) as any[];
    const examples = (Array.isArray(examplesResult) ? examplesResult : (examplesResult as any).rows) as any[];

    const out = sections.map(s => ({
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
      theory: theory
        .filter(t => t.section_id === s.id)
        .map(t => ({ id: t.id, title: t.title, content: t.content, icon: t.icon })),
      examples: examples
        .filter(e => e.section_id === s.id)
        .map(e => ({
          id: e.id,
          title: e.title,
          description: e.description,
          code: e.code,
          result: e.result,
        })),
    }));

    return json(res, 200, out);
  }

  // POST: crear sección (admin)
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (req.method === 'DELETE') {
    if (!id || Number.isNaN(id)) {
      return error(res, 400, 'ID inválido');
    }

    await sql('DELETE FROM sections WHERE id = $1', [id]);
    return json(res, 200, { ok: true });
  }

  const body = readBody<Partial<{
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    gradient: string;
    lessonLabel: string;
    slug: string;
    order: number;
    published: boolean;
    theory: { title: string; content: string; icon?: string }[];
    examples: { title: string; description?: string; code: string; result?: string }[];
  }>>(req);

  if (req.method === 'PUT') {
    if (!id || Number.isNaN(id)) {
      return error(res, 400, 'ID inválido');
    }

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

    for (const [key, col] of Object.entries(map)) {
      if ((body as any)[key] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push((body as any)[key]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      values.push(id);
      await sql(`UPDATE sections SET ${fields.join(', ')} WHERE id = $${i}`, values);
    }

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

  if (!body.title) {
    return error(res, 400, 'El título es obligatorio');
  }

  const slug = (body.slug ? slugify(body.slug) : slugify(body.title)) || `seccion-${Date.now()}`;

  // Verificar que el slug no exista
  const existing = await sql('SELECT id FROM sections WHERE slug = $1', [slug]);
  const existingRows = Array.isArray(existing) ? existing : (existing as any).rows;
  if (existingRows.length > 0) {
    return error(res, 409, `Ya existe una sección con el slug "${slug}"`);
  }

  // Calcular order si no se proporciona
  let order = body.order;
  if (order === undefined || order === null) {
    const maxResult = await sql('SELECT COALESCE(MAX(order_index), -1) as max FROM sections');
    const maxRows = Array.isArray(maxResult) ? maxResult : (maxResult as any).rows;
    order = (maxRows[0]?.max ?? -1) + 1;
  }

  const insertResult = await sql(
    `INSERT INTO sections (slug, title, subtitle, description, icon, gradient, lesson_label, order_index, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      slug,
      body.title,
      body.subtitle || null,
      body.description || null,
      body.icon || 'Book',
      body.gradient || 'from-purple-400 to-pink-400',
      body.lessonLabel || `Lección ${order}`,
      order,
      body.published !== false,
    ]
  );
  const insertRows = Array.isArray(insertResult) ? insertResult : (insertResult as any).rows;
  const sectionId = insertRows[0].id;

  // Insertar teoría
  if (body.theory && Array.isArray(body.theory)) {
    for (let i = 0; i < body.theory.length; i++) {
      const t = body.theory[i];
      if (!t.title || !t.content) continue;
      await sql(
        `INSERT INTO theory_cards (section_id, title, content, icon, order_index)
         VALUES ($1, $2, $3, $4, $5)`,
        [sectionId, t.title, t.content, t.icon || 'Book', i]
      );
    }
  }

  // Insertar ejemplos
  if (body.examples && Array.isArray(body.examples)) {
    for (let i = 0; i < body.examples.length; i++) {
      const e = body.examples[i];
      if (!e.title || !e.code) continue;
      await sql(
        `INSERT INTO examples (section_id, title, description, code, result, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sectionId, e.title, e.description || '', e.code, e.result || '', i]
      );
    }
  }

  return json(res, 201, { id: sectionId, slug });
});
