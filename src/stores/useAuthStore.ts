import { create } from 'zustand';
import { api } from '../lib/api';
import { AuthResponse, UsuarioAuthInfo, UsuarioPerfil } from '../types/api';

interface AuthState {
  user: UsuarioAuthInfo | null;
  profile: UsuarioPerfil | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, senha: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setSession: (data: AuthResponse) => void;
  fetchMe: () => Promise<UsuarioPerfil | null>;
  initSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  accessToken: localStorage.getItem('ce_access_token'),
  refreshToken: localStorage.getItem('ce_refresh_token'),
  isAuthenticated: !!localStorage.getItem('ce_access_token'),
  isLoading: false,

  setSession: (data: AuthResponse) => {
    localStorage.setItem('ce_access_token', data.accessToken);
    localStorage.setItem('ce_refresh_token', data.refreshToken);
    localStorage.setItem('ce_user_info', JSON.stringify(data.usuario));

    set({
      user: data.usuario,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  login: async (email: string, senha: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        senha,
      });
      get().setSession(response.data);
      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('ce_access_token');
      localStorage.removeItem('ce_refresh_token');
      localStorage.removeItem('ce_user_info');
      set({
        user: null,
        profile: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  fetchMe: async () => {
    if (!get().accessToken) return null;
    try {
      const response = await api.get<UsuarioPerfil>('/auth/me');
      set({ profile: response.data });
      return response.data;
    } catch {
      return null;
    }
  },

  initSession: () => {
    const token = localStorage.getItem('ce_access_token');
    const userStr = localStorage.getItem('ce_user_info');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true });
        get().fetchMe();
      } catch {
        get().logout();
      }
    }
  },
}));

// Escuta evento global de expiração de sessão disparado pelo interceptor axios
if (typeof window !== 'undefined') {
  window.addEventListener('ce_session_expired', () => {
    useAuthStore.getState().logout();
  });
}
