import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  ResumoPresencas,
  CriarPresencaDto,
  AtualizarPresencaDto,
  PresencaItem,
} from '../../types/presenca';

// Amostra inicial de presenças para teste e modo offline
export const SAMPLE_PRESENCAS_POR_CULTO: Record<string, PresencaItem[]> = {
  'culto-1': [
    {
      id: 'p-1',
      cultoId: 'culto-1',
      nomeParticipante: 'João Batista da Silva',
      telefone: '(84) 98822-1100',
      eMembro: true,
      presente: true,
      checkinEm: '2026-11-19T19:20:00.000Z',
    },
    {
      id: 'p-2',
      cultoId: 'culto-1',
      nomeParticipante: 'Maria das Graças Silva',
      telefone: '(84) 98822-1101',
      eMembro: true,
      presente: true,
      checkinEm: '2026-11-19T19:22:00.000Z',
    },
    {
      id: 'p-3',
      cultoId: 'culto-1',
      nomeParticipante: 'Lucas Gabriel Silveira (Vizinho)',
      telefone: '(84) 99455-8899',
      eMembro: false,
      presente: true,
      checkinEm: '2026-11-19T19:35:00.000Z',
    },
  ],
  'culto-2': [
    {
      id: 'p-4',
      cultoId: 'culto-2',
      nomeParticipante: 'Dona Francisca Bezerra',
      telefone: '(84) 99100-3322',
      eMembro: true,
      presente: true,
      checkinEm: '2026-11-19T19:25:00.000Z',
    },
    {
      id: 'p-5',
      cultoId: 'culto-2',
      nomeParticipante: 'Carlos Eduardo (Convidado)',
      telefone: '(84) 98711-4455',
      eMembro: false,
      presente: true,
      checkinEm: '2026-11-19T19:40:00.000Z',
    },
  ],
};

export function usePresencasCulto(cultoId?: string | null) {
  return useQuery<ResumoPresencas>({
    queryKey: ['presencas', cultoId],
    queryFn: async () => {
      if (!cultoId) {
        return {
          cultoId: '',
          totalParticipantes: 0,
          totalMembros: 0,
          totalVisitantes: 0,
          totalPresentes: 0,
          participantes: [],
        };
      }

      try {
        const res = await api.get<ResumoPresencas>(`/cultos/${cultoId}/presencas`);
        return res.data;
      } catch {
        // Fallback robusto offline
        const mockList = SAMPLE_PRESENCAS_POR_CULTO[cultoId] || [];
        const totalMembros = mockList.filter((p) => p.eMembro).length;
        const totalVisitantes = mockList.filter((p) => !p.eMembro).length;
        const totalPresentes = mockList.filter((p) => p.presente).length;

        return {
          cultoId,
          totalParticipantes: mockList.length,
          totalMembros,
          totalVisitantes,
          totalPresentes,
          participantes: mockList,
        };
      }
    },
    enabled: !!cultoId,
    staleTime: 1000 * 10, // 10s
  });
}

export function useAdicionarPresenca(cultoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CriarPresencaDto) => {
      try {
        const res = await api.post<PresencaItem>(`/cultos/${cultoId}/presencas`, dto);
        return res.data;
      } catch {
        // Fallback local se a API não estiver respondendo
        const novaPresenca: PresencaItem = {
          id: `local-presenca-${Date.now()}`,
          cultoId,
          nomeParticipante: dto.nomeParticipante,
          telefone: dto.telefone || null,
          eMembro: dto.eMembro ?? true,
          presente: dto.presente ?? true,
          checkinEm: new Date().toISOString(),
        };

        if (!SAMPLE_PRESENCAS_POR_CULTO[cultoId]) {
          SAMPLE_PRESENCAS_POR_CULTO[cultoId] = [];
        }
        SAMPLE_PRESENCAS_POR_CULTO[cultoId].unshift(novaPresenca);
        return novaPresenca;
      }
    },
    onSuccess: (novaPresenca) => {
      queryClient.setQueryData<ResumoPresencas>(['presencas', cultoId], (antigo) => {
        if (!antigo) {
          return {
            cultoId,
            totalParticipantes: 1,
            totalMembros: novaPresenca.eMembro ? 1 : 0,
            totalVisitantes: novaPresenca.eMembro ? 0 : 1,
            totalPresentes: novaPresenca.presente ? 1 : 0,
            participantes: [novaPresenca],
          };
        }

        const atualizados = [novaPresenca, ...antigo.participantes];
        return {
          ...antigo,
          totalParticipantes: atualizados.length,
          totalMembros: atualizados.filter((p) => p.eMembro).length,
          totalVisitantes: atualizados.filter((p) => !p.eMembro).length,
          totalPresentes: atualizados.filter((p) => p.presente).length,
          participantes: atualizados,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}

export function useAtualizarPresenca(cultoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      presencaId,
      dto,
    }: {
      presencaId: string;
      dto: AtualizarPresencaDto;
    }) => {
      try {
        const res = await api.patch<PresencaItem>(
          `/cultos/${cultoId}/presencas/${presencaId}`,
          dto
        );
        return res.data;
      } catch {
        // Fallback local
        const lista = SAMPLE_PRESENCAS_POR_CULTO[cultoId] || [];
        const item = lista.find((p) => p.id === presencaId);
        if (item) {
          if (dto.nomeParticipante !== undefined) item.nomeParticipante = dto.nomeParticipante;
          if (dto.telefone !== undefined) item.telefone = dto.telefone;
          if (dto.eMembro !== undefined) item.eMembro = dto.eMembro;
          if (dto.presente !== undefined) item.presente = dto.presente;
          return { ...item };
        }
        throw new Error('Presença não encontrada');
      }
    },
    onSuccess: (atualizado) => {
      queryClient.setQueryData<ResumoPresencas>(['presencas', cultoId], (antigo) => {
        if (!antigo) return antigo;
        const participantes = antigo.participantes.map((p) =>
          p.id === atualizado.id ? atualizado : p
        );
        return {
          ...antigo,
          totalPresentes: participantes.filter((p) => p.presente).length,
          totalMembros: participantes.filter((p) => p.eMembro).length,
          totalVisitantes: participantes.filter((p) => !p.eMembro).length,
          participantes,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}

export function useRemoverPresenca(cultoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presencaId: string) => {
      try {
        await api.delete(`/cultos/${cultoId}/presencas/${presencaId}`);
      } catch {
        // Fallback local
        if (SAMPLE_PRESENCAS_POR_CULTO[cultoId]) {
          SAMPLE_PRESENCAS_POR_CULTO[cultoId] = SAMPLE_PRESENCAS_POR_CULTO[cultoId].filter(
            (p) => p.id !== presencaId
          );
        }
      }
      return presencaId;
    },
    onSuccess: (removidoId) => {
      queryClient.setQueryData<ResumoPresencas>(['presencas', cultoId], (antigo) => {
        if (!antigo) return antigo;
        const filtrados = antigo.participantes.filter((p) => p.id !== removidoId);
        return {
          ...antigo,
          totalParticipantes: filtrados.length,
          totalMembros: filtrados.filter((p) => p.eMembro).length,
          totalVisitantes: filtrados.filter((p) => !p.eMembro).length,
          totalPresentes: filtrados.filter((p) => p.presente).length,
          participantes: filtrados,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}
