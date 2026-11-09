import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CultoItem, CriarCultoDto, StatusCulto } from '../../types/api';

export function useCultosList(filters?: { setor?: number; status?: StatusCulto }) {
  return useQuery({
    queryKey: ['cultos', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.setor) params.set('setor', String(filters.setor));
      if (filters?.status) params.set('status', filters.status);
      const res = await api.get<CultoItem[]>('/cultos', { params });
      return res.data;
    },
    staleTime: 1000 * 30, // 30 segundos
  });
}

export function useCultoDetails(id: string | null) {
  return useQuery({
    queryKey: ['cultos', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get<CultoItem>(`/cultos/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCulto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CriarCultoDto) => {
      const res = await api.post<CultoItem>('/cultos', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultos'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}

export function useUpdateCultoStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusCulto }) => {
      const res = await api.patch<CultoItem>(`/cultos/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cultos'] });
      queryClient.invalidateQueries({ queryKey: ['cultos', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}

export function useDeleteCulto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cultos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultos'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}
