import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ConviteValidado, AtivarConviteDto, AuthResponse } from '../../types/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { ConviteItem } from '../../types/convite';

// Amostra de convites por setor para demonstração e resiliência offline
export const SAMPLE_CONVITES: ConviteItem[] = [
  {
    id: 'conv-1',
    tipoPapel: 'LIDER',
    setorNumero: 1,
    nomeDestinatario: 'Irmão Carlos Mendes',
    telefoneDestinatario: '(84) 98833-2211',
    utilizado: true,
    expirado: false,
    expiraEm: '2026-11-18T18:00:00.000Z',
    createdAt: '2026-11-08T10:00:00.000Z',
  },
  {
    id: 'conv-2',
    tipoPapel: 'ANFITRIAO',
    setorNumero: 1,
    nomeDestinatario: 'Dona Francisca e Família',
    telefoneDestinatario: '(84) 99122-3344',
    utilizado: false,
    expirado: false,
    expiraEm: '2026-11-20T23:59:59.000Z',
    createdAt: '2026-11-09T14:30:00.000Z',
  },
  {
    id: 'conv-3',
    tipoPapel: 'LIDER',
    setorNumero: 2,
    nomeDestinatario: 'Pb. Antônio Marcos',
    telefoneDestinatario: '(84) 98755-6677',
    utilizado: false,
    expirado: false,
    expiraEm: '2026-11-20T23:59:59.000Z',
    createdAt: '2026-11-09T16:00:00.000Z',
  },
  {
    id: 'conv-4',
    tipoPapel: 'COORDENADOR',
    setorNumero: 5,
    nomeDestinatario: 'Pb. Adriano Medeiros',
    telefoneDestinatario: '(84) 99655-4433',
    utilizado: true,
    expirado: false,
    expiraEm: '2026-11-15T12:00:00.000Z',
    createdAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'conv-5',
    tipoPapel: 'ANFITRIAO',
    setorNumero: 5,
    nomeDestinatario: 'Irmã Emanuela Larissa',
    telefoneDestinatario: '(84) 98877-6655',
    utilizado: true,
    expirado: false,
    expiraEm: '2026-11-15T12:00:00.000Z',
    createdAt: '2026-11-06T11:20:00.000Z',
  },
  {
    id: 'conv-6',
    tipoPapel: 'LIDER',
    setorNumero: 8,
    nomeDestinatario: 'Isaac Ramalho',
    telefoneDestinatario: '(84) 99188-7766',
    utilizado: false,
    expirado: true,
    expiraEm: '2026-11-07T12:00:00.000Z',
    createdAt: '2026-11-01T15:00:00.000Z',
  },
];

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

export function useConvitesSetor(setorNumero: number | null) {
  return useQuery<ConviteItem[]>({
    queryKey: ['convites', 'setor', setorNumero],
    queryFn: async () => {
      if (!setorNumero) return [];
      try {
        const res = await api.get<ConviteItem[]>(`/convites/setor/${setorNumero}`);
        return res.data;
      } catch {
        return SAMPLE_CONVITES.filter((c) => c.setorNumero === setorNumero);
      }
    },
    enabled: !!setorNumero,
    staleTime: 1000 * 30,
  });
}

export function useTodosConvites() {
  return useQuery<ConviteItem[]>({
    queryKey: ['convites', 'todos'],
    queryFn: async () => {
      try {
        const promises = Array.from({ length: 14 }, (_, i) => i + 1).map((s) =>
          api.get<ConviteItem[]>(`/convites/setor/${s}`).catch(() => ({ data: [] }))
        );
        const results = await Promise.all(promises);
        const flat = results.flatMap((r) => r.data);
        if (flat.length > 0) return flat;
        return SAMPLE_CONVITES;
      } catch {
        return SAMPLE_CONVITES;
      }
    },
    staleTime: 1000 * 30,
  });
}

export function useCriarConviteCoordenador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { setorNumero: number; nomeSugerido?: string; telefoneSugerido?: string; expiraEmDias?: number }) => {
      const res = await api.post<{ link: string; token: string }>('/convites/coordenador', dto);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      queryClient.invalidateQueries({ queryKey: ['convites', 'setor', variables.setorNumero] });
    },
  });
}

export function useCriarConviteMembro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      tipoPapel?: 'LIDER' | 'ANFITRIAO';
      role?: 'LIDER' | 'ANFITRIAO';
      setorNumero?: number;
      nomeSugerido?: string;
      telefoneSugerido?: string;
      expiraEmDias?: number;
    }) => {
      const payload = {
        tipoPapel: dto.tipoPapel || dto.role || 'LIDER',
        setorNumero: dto.setorNumero,
        nomeSugerido: dto.nomeSugerido,
        telefoneSugerido: dto.telefoneSugerido,
        expiraEmDias: dto.expiraEmDias,
      };
      const res = await api.post<{ link: string; token: string }>('/convites/membro', payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['convites'] });
      if (variables.setorNumero) {
        queryClient.invalidateQueries({ queryKey: ['convites', 'setor', variables.setorNumero] });
      }
    },
  });
}
