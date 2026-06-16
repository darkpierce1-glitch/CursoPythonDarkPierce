/**
 * Panel admin: CRUD de secciones y su contenido.
 * Protegido: requiere token JWT.
 */
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Code, Plus, Edit, Trash2, LogOut, Save, X, Eye, EyeOff,
  ArrowUp, ArrowDown, ChevronDown, ChevronRight, BookOpen, FileCode,
  PlayCircle, AlertCircle, CheckCircle2, RefreshCw, Layers, ArrowLeft,
} from 'lucide-react';
import { api, type Section, type SectionInput, ApiError } from '../lib/api';
import { useAuth } from '../lib/useAuth';

const ICON_OPTIONS = [
  'Book', 'Sparkles', 'Download', 'FileCode', 'Calculator', 'GitCompare',
  'Zap', 'GitBranch', 'ListTree', 'Repeat', 'Infinity', 'Cog', 'FunctionSquare',
  'Database', 'List', 'Lock', 'Hash', 'Box', 'GitFork', 'Package', 'Layers',
  'FileText', 'ShieldAlert',
];

const GRADIENT_OPTIONS = [
  'from-emerald-400 to-cyan-400',
  'from-purple-400 to-pink-400',
  'from-cyan-400 to-blue-400',
  'from-yellow-400 to-orange-400',
  'from-pink-400 to-rose-400',
  'from-orange-400 to-yellow-400',
  'from-violet-400 to-purple-400',
  'from-indigo-400 to-blue-400',
  'from-teal-400 to-green-400',
  'from-red-400 to-pink-400',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 60);
}

interface EditorState {
  open: boolean;
  editing: Section | null;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  lessonLabel: string;
  slug: string;
  published: boolean;
  theory: { title: string; content: string; icon: string }[];
  examples: { title: string; description: string; code: string; result: string }[];
}

const emptyEditor = (): EditorState => ({
  open: false,
  editing: null,
  title: '', subtitle: '', description: '',
  icon: 'Book', gradient: 'from-purple-400 to-pink-400',
  lessonLabel: '', slug: '', published: true,
  theory: [], examples: [],
});

export default function AdminPanel() {
  const navigate = useNavigate();
  const { token, user, logout, loading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(emptyEditor());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Redirigir si no hay token
  useEffect(() => {
    if (!authLoading && !token) {
      navigate('/admin/login', { state: { from: '/admin' } });
    }
  }, [token, authLoading, navigate]);

  // Cargar secciones
  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSections(true, token);
      setSections(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const openNew = () => {
    setEditor({
      ...emptyEditor(),
      open: true,
      lessonLabel: `Lección ${sections.length}`,
    });
  };

  const openEdit = (s: Section) => {
    setEditor({
      open: true,
      editing: s,
      title: s.title,
      subtitle: s.subtitle || '',
      description: s.description || '',
      icon: s.icon || 'Book',
      gradient: s.gradient || 'from-purple-400 to-pink-400',
      lessonLabel: s.lessonLabel || '',
      slug: s.slug,
      published: s.published,
      theory: s.theory.map(t => ({ title: t.title, content: t.content, icon: t.icon || 'Book' })),
      examples: s.examples.map(e => ({
        title: e.title, description: e.description || '',
        code: e.code, result: e.result || '',
      })),
    });
  };

  const closeEditor = () => setEditor(emptyEditor());

  const onSave = async () => {
    if (!token) return;
    if (!editor.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: SectionInput = {
        title: editor.title.trim(),
        subtitle: editor.subtitle.trim() || undefined,
        description: editor.description.trim() || undefined,
        icon: editor.icon,
        gradient: editor.gradient,
        lessonLabel: editor.lessonLabel.trim() || undefined,
        slug: editor.slug.trim() || slugify(editor.title),
        published: editor.published,
        theory: editor.theory.filter(t => t.title.trim() && t.content.trim()),
        examples: editor.examples.filter(e => e.title.trim() && e.code.trim()),
      };

      if (editor.editing) {
        await api.updateSection(editor.editing.id, payload, token);
        flash('Sección actualizada');
      } else {
        await api.createSection(payload, token);
        flash('Sección creada');
      }
      closeEditor();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (s: Section) => {
    if (!token) return;
    if (!confirm(`¿Eliminar la sección "${s.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteSection(s.id, token);
      flash('Sección eliminada');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al eliminar');
    }
  };

  const move = async (s: Section, dir: -1 | 1) => {
    if (!token) return;
    const newOrder = s.order + dir;
    try {
      await api.updateSection(s.id, { order: newOrder } as any, token);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al reordenar');
    }
  };

  const togglePublished = async (s: Section) => {
    if (!token) return;
    try {
      await api.updateSection(s.id, { published: !s.published } as any, token);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cambiar estado');
    }
  };

  // --- Editor helpers ---
  const addTheory = () =>
    setEditor(e => ({ ...e, theory: [...e.theory, { title: '', content: '', icon: 'Book' }] }));
  const updateTheory = (i: number, patch: Partial<EditorState['theory'][0]>) =>
    setEditor(e => ({ ...e, theory: e.theory.map((t, idx) => idx === i ? { ...t, ...patch } : t) }));
  const removeTheory = (i: number) =>
    setEditor(e => ({ ...e, theory: e.theory.filter((_, idx) => idx !== i) }));

  const addExample = () =>
    setEditor(e => ({ ...e, examples: [...e.examples, { title: '', description: '', code: '', result: '' }] }));
  const updateExample = (i: number, patch: Partial<EditorState['examples'][0]>) =>
    setEditor(e => ({ ...e, examples: e.examples.map((x, idx) => idx === i ? { ...x, ...patch } : x) }));
  const removeExample = (i: number) =>
    setEditor(e => ({ ...e, examples: e.examples.filter((_, idx) => idx !== i) }));

  if (authLoading || (!token && !authLoading)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Curso
            </Link>
            <span className="text-gray-600">/</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Panel Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden md:inline">{user?.email}</span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Secciones del curso</h1>
            <p className="text-gray-400 text-sm">
              {sections.length} {sections.length === 1 ? 'sección' : 'secciones'} ·
              {' '}{sections.filter(s => s.published).length} publicadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-semibold"
            >
              <Plus className="w-4 h-4" /> Nueva sección
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Cargando secciones...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-24 text-center bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl">
            <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 mb-2 text-lg">No hay secciones todavía</p>
            <p className="text-gray-500 text-sm mb-6">Crea la primera para empezar a llenar el curso.</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4" /> Crear primera sección
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map(s => (
              <div
                key={s.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition"
              >
                <div className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {expandedId === s.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.gradient || 'from-purple-400 to-pink-400'} flex items-center justify-center text-lg font-bold`}>
                    {s.order + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{s.title}</h3>
                      {!s.published && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">Borrador</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {s.lessonLabel && <span>{s.lessonLabel}</span>}
                      <span>·</span>
                      <span>{s.theory.length} teoría · {s.examples.length} ejemplos</span>
                      <span>·</span>
                      <code className="text-purple-300">/{s.slug}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(s, -1)}
                      disabled={s.order === 0}
                      className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30"
                      title="Subir"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(s, 1)}
                      className="p-1.5 rounded hover:bg-gray-800"
                      title="Bajar"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePublished(s)}
                      className="p-1.5 rounded hover:bg-gray-800"
                      title={s.published ? 'Despublicar' : 'Publicar'}
                    >
                      {s.published ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-yellow-400" />}
                    </button>
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded hover:bg-gray-800 text-blue-400"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="p-1.5 rounded hover:bg-gray-800 text-red-400"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedId === s.id && (
                  <div className="border-t border-gray-800 p-4 bg-black/30 space-y-3">
                    {s.description && (
                      <p className="text-sm text-gray-400">{s.description}</p>
                    )}
                    {s.theory.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Teoría ({s.theory.length})
                        </h4>
                        <ul className="space-y-1">
                          {s.theory.map(t => (
                            <li key={t.id} className="text-sm text-gray-300">• {t.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {s.examples.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" /> Ejemplos ({s.examples.length})
                        </h4>
                        <ul className="space-y-1">
                          {s.examples.map(e => (
                            <li key={e.id} className="text-sm text-gray-300">• {e.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editor.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl my-8 animate-slideUp">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl font-bold">
                {editor.editing ? 'Editar sección' : 'Nueva sección'}
              </h2>
              <button onClick={closeEditor} className="p-1 rounded hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Datos básicos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    value={editor.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditor(s => ({ ...s, title: v, slug: s.editing ? s.slug : slugify(v) }));
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                    placeholder="Ej: Variables y Tipos de Datos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtítulo</label>
                  <input
                    value={editor.subtitle}
                    onChange={(e) => setEditor(s => ({ ...s, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Etiqueta de lección</label>
                  <input
                    value={editor.lessonLabel}
                    onChange={(e) => setEditor(s => ({ ...s, lessonLabel: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                    placeholder="Lección 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                  <input
                    value={editor.slug}
                    onChange={(e) => setEditor(s => ({ ...s, slug: slugify(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
                    placeholder="mi-seccion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icono</label>
                  <select
                    value={editor.icon}
                    onChange={(e) => setEditor(s => ({ ...s, icon: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                  >
                    {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gradiente</label>
                  <select
                    value={editor.gradient}
                    onChange={(e) => setEditor(s => ({ ...s, gradient: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                  >
                    {GRADIENT_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pub"
                    checked={editor.published}
                    onChange={(e) => setEditor(s => ({ ...s, published: e.target.checked }))}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600"
                  />
                  <label htmlFor="pub" className="text-sm">Publicada (visible en el sitio público)</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={editor.description}
                    onChange={(e) => setEditor(s => ({ ...s, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none resize-y"
                    placeholder="Breve descripción que verán los estudiantes"
                  />
                </div>
              </div>

              {/* Teoría */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Tarjetas de teoría
                  </h3>
                  <button onClick={addTheory} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm">
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
                {editor.theory.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aún no hay tarjetas. Añade la primera.</p>
                )}
                <div className="space-y-3">
                  {editor.theory.map((t, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          value={t.title}
                          onChange={(e) => updateTheory(i, { title: e.target.value })}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 outline-none"
                          placeholder="Título de la tarjeta"
                        />
                        <button onClick={() => removeTheory(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={t.content}
                        onChange={(e) => updateTheory(i, { content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 outline-none resize-y text-sm"
                        placeholder="Contenido explicativo..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ejemplos */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-green-400" />
                    Ejemplos prácticos
                  </h3>
                  <button onClick={addExample} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm">
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
                {editor.examples.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aún no hay ejemplos. Añade el primero.</p>
                )}
                <div className="space-y-3">
                  {editor.examples.map((e, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          value={e.title}
                          onChange={(ev) => updateExample(i, { title: ev.target.value })}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 outline-none"
                          placeholder="Título del ejemplo"
                        />
                        <button onClick={() => removeExample(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        value={e.description}
                        onChange={(ev) => updateExample(i, { description: ev.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 outline-none text-sm"
                        placeholder="Descripción breve (opcional)"
                      />
                      <textarea
                        value={e.code}
                        onChange={(ev) => updateExample(i, { code: ev.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-green-500 outline-none resize-y text-sm font-mono"
                        placeholder="# código Python aquí"
                      />
                      <textarea
                        value={e.result}
                        onChange={(ev) => updateExample(i, { result: ev.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-yellow-500 outline-none resize-y text-sm font-mono"
                        placeholder="Salida esperada (opcional)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3 sticky bottom-0 bg-gray-900">
              <button
                onClick={closeEditor}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-semibold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
