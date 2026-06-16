/**
 * Página principal: muestra todas las secciones del curso cargadas desde la API.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, Book, Play, CheckCircle, Terminal, Coffee, Users, Sparkles,
  Heart, Copy, Check, Menu, X, FileCode, Cog, FunctionSquare,
  Database, Repeat, GitBranch, Calculator, Box, Package, ShieldAlert,
  Download, ListTree, Infinity, GitCompare, Hash, Lock, Zap, List,
  GitFork, Layers, FileText, type LucideIcon,
} from 'lucide-react';
import { api, type Section, ApiError } from '../lib/api';

const ICONS: Record<string, LucideIcon> = {
  Book, Sparkles, Download, FileCode, Calculator, GitCompare, Zap,
  GitBranch, ListTree, Repeat, Infinity, Cog, FunctionSquare, Database,
  List, Lock, Hash, Box, GitFork, Package, Layers, FileText, ShieldAlert,
  Code, Play, Users, Coffee, Heart,
};

const FloatingShapes = () => {
  const shapes = [
    { id: 1, x: 10, y: 20, size: 80, duration: 20, color: 'from-purple-400/20 to-pink-400/20' },
    { id: 2, x: 80, y: 30, size: 120, duration: 25, color: 'from-blue-400/15 to-cyan-400/15' },
    { id: 3, x: 50, y: 70, size: 60, duration: 18, color: 'from-green-400/15 to-emerald-400/15' },
    { id: 4, x: 20, y: 60, size: 100, duration: 22, color: 'from-yellow-400/15 to-amber-400/15' },
    { id: 5, x: 70, y: 80, size: 70, duration: 24, color: 'from-rose-400/15 to-red-400/15' },
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
          style={{
            left: `${shape.x}%`, top: `${shape.y}%`, width: shape.size, height: shape.size,
            animation: `float ${shape.duration}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-xs text-gray-400 uppercase">python</span>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

const TheoryCard = ({ title, content, iconName }: { title: string; content: string; iconName?: string | null }) => {
  const Icon = (iconName && ICONS[iconName]) || Book;
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
      </div>
      <p className="text-gray-400 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
};

const InteractiveExample = ({ title, description, code, result }: { title: string; description?: string | null; code: string; result?: string | null }) => {
  const [showResult, setShowResult] = useState(false);
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
      <div className="p-6">
        <CodeBlock code={code} />
        <button
          onClick={() => setShowResult(!showResult)}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          {showResult ? 'Ocultar resultado' : 'Ver resultado'}
        </button>
        {showResult && (
          <div className="mt-4 p-4 rounded-lg bg-black/50 border border-green-500/30">
            <p className="text-green-400 font-mono text-sm whitespace-pre-line">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionBlock = ({ section, compact = false }: { section: Section; compact?: boolean }) => {
  return (
    <section id={section.slug} className={compact ? 'relative p-5 md:p-8' : 'relative py-24 px-6'}>
      <div className={compact ? 'mx-auto' : 'max-w-7xl mx-auto'}>
        <div className={compact ? 'text-left mb-8' : 'text-center mb-16'}>
          {section.lessonLabel && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              {section.lessonLabel}
            </div>
          )}
          <h2 className={`${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold mb-6`}>
            <span className={`bg-gradient-to-r ${section.gradient || 'from-purple-400 to-pink-400'} bg-clip-text text-transparent`}>
              {section.title}
            </span>
          </h2>
          {section.subtitle && (
            <p className="text-gray-300 text-xl mb-2">{section.subtitle}</p>
          )}
          {section.description && (
            <p className={`text-gray-400 text-lg max-w-2xl ${compact ? '' : 'mx-auto'}`}>{section.description}</p>
          )}
        </div>

        {section.theory.length > 0 && (
          <div className={`grid ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-12`}>
            {section.theory.map((t, i) => (
              <TheoryCard key={t.id || i} title={t.title} content={t.content} iconName={t.icon} />
            ))}
          </div>
        )}

        {section.examples.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Ejemplos Prácticos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.examples.map((e, i) => (
                <InteractiveExample key={e.id || i} {...e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const CourseExplorer = ({
  sections,
  activeSlug,
  onSelect,
}: {
  sections: Section[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) => {
  const active = sections.find(s => s.slug === activeSlug) || sections[0];
  if (!active) return null;

  const select = (slug: string) => {
    onSelect(slug);
    document.getElementById('curso')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="curso" className="relative py-20 px-6 border-y border-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-2">Lecciones</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Ruta de aprendizaje</h2>
          </div>
          <p className="text-gray-400 max-w-xl">
            Elige una sección para ver su teoría y ejemplos. El contenido se mantiene enfocado en una lección a la vez.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          <aside className="lg:sticky lg:top-24 rounded-2xl border border-gray-800 bg-gray-950/80 p-3 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="space-y-2">
              {sections.map((section, index) => {
                const isActive = section.slug === active.slug;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => select(section.slug)}
                    className={`w-full text-left rounded-xl p-3 transition border ${
                      isActive
                        ? 'bg-purple-500/15 border-purple-500/50 text-white'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isActive ? 'bg-purple-500 text-white' : 'bg-gray-900 text-gray-500'
                      }`}>
                        {isActive ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{section.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {section.lessonLabel || `Lección ${index + 1}`} · {section.theory.length} teoría · {section.examples.length} ejemplos
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 rounded-2xl border border-gray-800 bg-black/40 overflow-hidden">
            <SectionBlock section={active} compact />
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getSections();
        if (!cancelled) {
          setSections(data);
          setActiveSlug(current =>
            current && data.some(section => section.slug === current)
              ? current
              : data[0]?.slug || null
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'No se pudo cargar el curso');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) rotate(0)} 33%{transform:translate(30px,-50px) rotate(120deg)} 66%{transform:translate(-20px,20px) rotate(240deg)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 8s ease infinite; }
      `}</style>

      <FloatingShapes />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#inicio" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Python Friends</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-gray-400 hover:text-white text-sm font-medium">Inicio</a>
              <a href="#curso" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Lecciones</a>
              <Link
                to="/admin/login"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90"
              >
                Admin
              </Link>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {isOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
              <a href="#inicio" className="block py-2 text-gray-400 hover:text-white">Inicio</a>
              <a href="#curso" onClick={() => setIsOpen(false)} className="block py-2 text-gray-400 hover:text-white">Lecciones</a>
              <Link to="/admin/login" className="block py-2 text-purple-400 hover:text-purple-300">Admin</Link>
            </div>
          )}
        </div>
      </nav>

      <section id="inicio" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="relative inline-block mb-8 animate-slideUp">
            <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                <Code className="w-16 h-16 text-purple-400" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient">
              Python Friends
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">School</h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 mt-4 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            Aprende Python de forma <span className="text-purple-400">divertida</span> y <span className="text-pink-400">efectiva</span>
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-12 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            <div className="text-center flex items-center gap-3">
              <Book className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-3xl font-bold text-white">{sections.length || '...'}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Lecciones</div>
              </div>
            </div>
            <div className="text-center flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Estudiantes</div>
              </div>
            </div>
            <div className="text-center flex items-center gap-3">
              <Coffee className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Acceso</div>
              </div>
            </div>
          </div>
          {sections.length > 0 && (
            <button
              onClick={() => scrollToSection('curso')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white overflow-hidden animate-slideUp"
              style={{ animationDelay: '0.8s' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Ver lecciones
              </span>
            </button>
          )}
        </div>
      </section>

      {loading && (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          <p className="text-gray-400 mt-4">Cargando curso...</p>
        </div>
      )}

      {error && (
        <div className="py-24 px-6 max-w-2xl mx-auto text-center">
          <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8">
            <p className="text-red-300 mb-2 text-xl">⚠️ Error al cargar el curso</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-4">
              Verifica que DATABASE_URL esté configurada y que hayas ejecutado <code>npm run init-db</code>.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="py-24 px-6 max-w-2xl mx-auto text-center">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
            <p className="text-gray-300 mb-2 text-xl">📚 Aún no hay contenido publicado</p>
            <p className="text-gray-500 text-sm">
              Ejecuta <code className="text-purple-400">npm run init-db</code> para sembrar el curso, o
              <Link to="/admin/login" className="text-purple-400 hover:text-purple-300 ml-1">entra al panel admin</Link>
              {' '}para crear secciones.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && sections.length > 0 && (
        <CourseExplorer sections={sections} activeSlug={activeSlug} onSelect={setActiveSlug} />
      )}

      <footer className="relative py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Python Friends School</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Python Friends School. Hecho con <Heart className="w-4 h-4 inline text-pink-500" /> para la comunidad Python.
          </p>
        </div>
      </footer>
    </div>
  );
}
