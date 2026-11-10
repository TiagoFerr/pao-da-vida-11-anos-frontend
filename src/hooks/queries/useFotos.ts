import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  FotosTelaoResponse,
  FiltrarFotosTelaoParams,
  FotoTelaoItem,
} from '../../types/foto';

export const SAMPLE_FOTOS_TELAO: FotoTelaoItem[] = [
  {
    id: 'foto-1',
    cultoId: 'culto-1',
    culto: {
      numeroSequencial: 1,
      setorNumero: 1,
      bairro: 'Aeroporto',
      liderNome: 'Pr. Rúbens Nunes',
    },
    s3Key: 'cultos/culto-1/foto-1.jpg',
    urlPublica: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    nomeOriginal: 'louvor_aeroporto.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 1845200,
    legenda: 'Lar cheio no Bairro Aeroporto! Louvor e comunhão no início do culto.',
    aprovadoParaTelao: true,
    enviadoPorNome: 'Pr. Rúbens Nunes',
    createdAt: '2026-11-19T19:40:00.000Z',
  },
  {
    id: 'foto-2',
    cultoId: 'culto-3',
    culto: {
      numeroSequencial: 3,
      setorNumero: 5,
      bairro: 'Abolição',
      liderNome: 'Pb. Adriano Medeiros',
    },
    s3Key: 'cultos/culto-3/foto-2.jpg',
    urlPublica: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    nomeOriginal: 'oracao_abolicao.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 2120400,
    legenda: 'Famílias reunidas em oração no Setor 5. Presença de Deus palpável!',
    aprovadoParaTelao: true,
    enviadoPorNome: 'Pb. Adriano Medeiros',
    createdAt: '2026-11-19T20:10:00.000Z',
  },
  {
    id: 'foto-3',
    cultoId: 'culto-5',
    culto: {
      numeroSequencial: 5,
      setorNumero: 11,
      bairro: 'Centro',
      liderNome: 'Pb. Diego',
    },
    s3Key: 'cultos/culto-5/foto-3.jpg',
    urlPublica: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    nomeOriginal: 'decisao_centro.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 1980300,
    legenda: 'Glória a Deus! Vida se entregando para Jesus no Centro de Mossoró.',
    aprovadoParaTelao: true,
    enviadoPorNome: 'Pb. Diego',
    createdAt: '2026-11-19T20:30:00.000Z',
  },
  {
    id: 'foto-4',
    cultoId: 'culto-2',
    culto: {
      numeroSequencial: 2,
      setorNumero: 2,
      bairro: 'Belo Horizonte',
      liderNome: 'Pra. Adriana Karina',
    },
    s3Key: 'cultos/culto-2/foto-4.jpg',
    urlPublica: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    nomeOriginal: 'comunhao_bh.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 1750000,
    legenda: 'Partir do pão e comunhão fraternal no lar da Dona Francisca.',
    aprovadoParaTelao: true,
    enviadoPorNome: 'Pra. Adriana Karina',
    createdAt: '2026-11-19T20:45:00.000Z',
  },
];

export function useFotosTelao(params?: FiltrarFotosTelaoParams) {
  return useQuery<FotosTelaoResponse>({
    queryKey: ['fotos', 'telao', params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.setorNumero) queryParams.set('setorNumero', String(params.setorNumero));
        if (params?.somenteAprovadas !== undefined) {
          queryParams.set('somenteAprovadas', String(params.somenteAprovadas));
        }
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));

        const res = await api.get<FotosTelaoResponse>('/telao/fotos', {
          params: queryParams,
        });
        return res.data;
      } catch {
        // Fallback para exibição fluida
        let filtradas = [...SAMPLE_FOTOS_TELAO];
        if (params?.setorNumero) {
          filtradas = filtradas.filter((f) => f.culto?.setorNumero === params.setorNumero);
        }
        if (params?.somenteAprovadas) {
          filtradas = filtradas.filter((f) => f.aprovadoParaTelao);
        }

        return {
          dados: filtradas,
          total: filtradas.length,
          page: 1,
          limit: 30,
          totalPages: 1,
        };
      }
    },
    staleTime: 1000 * 20, // 20s
  });
}

export function useAprovarFotoTelao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, aprovadoParaTelao }: { id: string; aprovadoParaTelao: boolean }) => {
      const res = await api.patch<FotoTelaoItem>(`/fotos/${id}/telao`, { aprovadoParaTelao });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fotos'] });
    },
  });
}
