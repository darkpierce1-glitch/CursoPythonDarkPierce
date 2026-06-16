/**
 * Hook de autenticación: persiste el token en localStorage y
 * expone login / logout / estado actual.
 */
import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from './api';

const TOKEN_KEY = 'pfs:token';
const USER_KEY = 'pfs:user';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as AuthUser;
        setState({ token, user, loading: false, error: null });
        return;
      } catch {
        /* fall through */
      }
    }
    setState(s => ({ ...s, loading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ token, user, loading: false, error: null });
      return true;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Error de conexión';
      setState(s => ({ ...s, loading: false, error: msg }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, loading: false, error: null });
  }, []);

  return { ...state, login, logout };
}
