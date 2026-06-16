/**
 * Página de login admin. Redirige a /admin si el login es exitoso.
 */
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Code, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Si ya está autenticado, redirigir
  if (token) {
    navigate('/admin', { replace: true });
  }

  const from = (location.state as any)?.from || '/admin';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl" style={{ animation: 'float 10s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slideUp">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Python Friends</span>
        </Link>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-400 text-sm">Accede para crear y gestionar el contenido del curso.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : <>Entrar <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p>
                ¿Primera vez? El usuario admin se crea automáticamente la primera vez que ejecutas
                <code className="text-purple-300 mx-1">npm run init-db</code>.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-white transition">← Volver al curso</Link>
        </p>
      </div>
    </div>
  );
}
