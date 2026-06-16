/**
 * Cliente HTTP para la API.
 * En desarrollo (vite) usa el proxy configurado en vite.config.ts (/api → localhost:3000).
 * En producción (Vercel) las rutas /api/* se resuelven automáticamente.
 */

const API_BASE = '/api';

export interface TheoryCard {
  id: number;
  title: string;
  content: string;
  icon?: string | null;
}

export interface Example {
  id: number;
  title: string;
  description?: string | null;
  code: string;
  result?: string | null;
}

export interface Section {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  icon?: string | null;
  gradient?: string | null;
  lessonLabel?: string | null;
  order: number;
  published: boolean;
  theory: TheoryCard[];
  examples: Example[];
}

export interface SectionInput {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  gradient?: string;
  lessonLabel?: string;
  slug?: string;
  order?: number;
  published?: boolean;
  theory?: { title: string; content: string; icon?: string }[];
  examples?: { title: string; description?: string; code: string; result?: string }[];
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string; role: string } }>(
      '/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  // Sections
  getSections: (includeUnpublished = false, token?: string | null) => {
    const q = includeUnpublished ? '?includeUnpublished=true' : '';
    return request<Section[]>(`/sections${q}`, {}, token);
  },
  getSection: (id: number) => request<Section>(`/sections/${id}`),
  createSection: (data: SectionInput, token: string) =>
    request<{ id: number; slug: string }>(`/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  updateSection: (id: number, data: Partial<SectionInput>, token: string) =>
    request<{ ok: true }>(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
  deleteSection: (id: number, token: string) =>
    request<{ ok: true }>(`/sections/${id}`, { method: 'DELETE' }, token),
};

export { ApiError };
