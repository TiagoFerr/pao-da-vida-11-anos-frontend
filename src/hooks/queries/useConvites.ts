import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ConviteValidado, AtivarConviteDto, AuthResponse } from '../../types/api';
import { useAuthStore } from '../../stores/useAuthStore';

export function useValidarConvite(token: string | null) {
  return useQuery({
    queryKey: ['convites', 'validar', token],
    queryFn: async () => {
      if (!token) return null;
      const res = await api.get<ConviteValidado>('/convites/validar', {
        params: { token },
      });
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useAtivarConvite() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (dto: AtivarConviteDto) => {
      const res = await api.post<AuthResponse>('/convites/ativar', dto);
      setSession(res.data);
      return res.data;
    },
  });
}

export function useCriarConviteCoordenador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { setorNumero: number; nomeSugerido?: string; telefoneSugerido?: string }) => {
      const res = await api.post<{ link: string; token: string }>('/convites/coordenador', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
    },
  });
}

export function useCriarConviteMembro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      role: 'LIDER' | 'ANFITRIAO';
      setorNumero?: number;
      nomeSugerido?: string;
      telefoneSugerido?: string;
    }) => {
      const res = await api.post<{ link: string; token: string }>('/convites/membro', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
    },
  });
}
