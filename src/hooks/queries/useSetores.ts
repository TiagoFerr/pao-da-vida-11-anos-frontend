import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SetorItem } from '../../types/api';

export function useSetoresList() {
  return useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      const res = await api.get<SetorItem[]>('/setores');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (metas e setores mudam com pouca frequência)
  });
}

export function useSetorDetails(numero: number | null) {
  return useQuery({
    queryKey: ['setores', numero],
    queryFn: async () => {
      if (numero === null) return null;
      const res = await api.get<SetorItem>(`/setores/${numero}`);
      return res.data;
    },
    enabled: numero !== null && numero >= 1 && numero <= 14,
  });
}
