import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  RelatorioDecisoesConsolidado,
  FiltrarDecisoesParams,
  AtualizarDiscipuladoDto,
  DecisaoItem,
} from '../../types/decisao';

// Amostra de decisões espirituais para fallback offline e demonstração executiva
export const SAMPLE_DECISOES: DecisaoItem[] = [
  {
    id: 'decisao-1',
    cultoId: 'culto-1',
    culto: {
      id: 'culto-1',
      numeroSequencial: 1,
      setorNumero: 1,
      setorNome: 'Setor 1 - Aeroporto',
      bairro: 'Aeroporto',
      liderNome: 'Pr. Rúbens Nunes',
      anfitriaoNome: 'Irmão João e Família',
    },
    presencaId: 'p-1',
    nomeDecidido: 'Marcos Vinícius da Silva',
    telefone: '(84) 98844-1234',
    tipoDecisao: 'ACEITOU_JESUS',
    pedidoOracaoDetalhe: 'Entrega pela primeira vez. Pede oração por libertação e nova direção profissional.',
    statusDiscipulado: 'EM_CONTATO',
    registradoPorNome: 'Pr. Rúbens Nunes',
    createdAt: '2026-11-19T19:50:00.000Z',
  },
  {
    id: 'decisao-2',
    cultoId: 'culto-2',
    culto: {
      id: 'culto-2',
      numeroSequencial: 2,
      setorNumero: 2,
      setorNome: 'Setor 2 - Boa Vista',
      bairro: 'Belo Horizonte',
      liderNome: 'Pra. Adriana Karina',
      anfitriaoNome: 'Dona Francisca',
    },
    presencaId: 'p-2',
    nomeDecidido: 'Luciana Ferreira de Oliveira',
    telefone: '(84) 99122-8765',
    tipoDecisao: 'RECONCILIACAO',
    pedidoOracaoDetalhe: 'Reconciliação com Cristo e retorno à comunhão da igreja.',
    statusDiscipulado: 'DISCIPULANDO',
    registradoPorNome: 'Pra. Adriana Karina',
    createdAt: '2026-11-19T20:05:00.000Z',
  },
  {
    id: 'decisao-3',
    cultoId: 'culto-3',
    culto: {
      id: 'culto-3',
      numeroSequencial: 3,
      setorNumero: 5,
      setorNome: 'Setor 5 - Santo Antônio',
      bairro: 'Abolição',
      liderNome: 'Pb. Adriano Medeiros',
      anfitriaoNome: 'Irmã Emanuela Larissa',
    },
    presencaId: 'p-3',
    nomeDecidido: 'Carlos Eduardo Nogueira',
    telefone: '(84) 99655-3344',
    tipoDecisao: 'ACEITOU_JESUS',
    pedidoOracaoDetalhe: 'Decidiu batizar e quer iniciar o discipulado de novos convertidos.',
    statusDiscipulado: 'PENDENTE',
    registradoPorNome: 'Pb. Adriano Medeiros',
    createdAt: '2026-11-19T20:25:00.000Z',
  },
  {
    id: 'decisao-4',
    cultoId: 'culto-4',
    culto: {
      id: 'culto-4',
      numeroSequencial: 4,
      setorNumero: 8,
      setorNome: 'Setor 8 - Alto de São Manoel',
      bairro: 'Alto de São Manoel',
      liderNome: 'Isaac Ramalho',
      anfitriaoNome: 'Irmão Marcos',
    },
    presencaId: 'p-4',
    nomeDecidido: 'Ana Beatriz Souza',
    telefone: '(84) 98711-5588',
    tipoDecisao: 'PEDIDO_ORACAO',
    pedidoOracaoDetalhe: 'Oração urgente pela saúde e cirurgia da mãe na próxima semana.',
    statusDiscipulado: 'EM_CONTATO',
    registradoPorNome: 'Isaac Ramalho',
    createdAt: '2026-11-19T20:40:00.000Z',
  },
  {
    id: 'decisao-5',
    cultoId: 'culto-5',
    culto: {
      id: 'culto-5',
      numeroSequencial: 5,
      setorNumero: 11,
      setorNome: 'Setor 11 - Centro',
      bairro: 'Centro',
      liderNome: 'Pb. Diego',
      anfitriaoNome: 'Irmã Cláudia',
    },
    presencaId: 'p-5',
    nomeDecidido: 'Gabriel Fernandes Moura',
    telefone: '(84) 99400-9922',
    tipoDecisao: 'ACEITOU_JESUS',
    pedidoOracaoDetalhe: 'Jovem estudante universitário, aceitou Jesus com lágrimas e gratidão.',
    statusDiscipulado: 'DISCIPULANDO',
    registradoPorNome: 'Pb. Diego',
    createdAt: '2026-11-19T20:55:00.000Z',
  },
];

export function useRelatorioDecisoes(params?: FiltrarDecisoesParams) {
  return useQuery<RelatorioDecisoesConsolidado>({
    queryKey: ['decisoes', 'relatorio', params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.setorNumero) queryParams.set('setorNumero', String(params.setorNumero));
        if (params?.tipoDecisao) queryParams.set('tipoDecisao', params.tipoDecisao);
        if (params?.statusDiscipulado) queryParams.set('statusDiscipulado', params.statusDiscipulado);
        if (params?.busca) queryParams.set('busca', params.busca);

        const res = await api.get<RelatorioDecisoesConsolidado>('/relatorios/decisoes', {
          params: queryParams,
        });
        return res.data;
      } catch {
        // Fallback robusto para demonstração ou modo offline
        let filtrados = [...SAMPLE_DECISOES];
        if (params?.setorNumero) {
          filtrados = filtrados.filter((d) => d.culto.setorNumero === params.setorNumero);
        }
        if (params?.tipoDecisao) {
          filtrados = filtrados.filter((d) => d.tipoDecisao === params.tipoDecisao);
        }
        if (params?.statusDiscipulado) {
          filtrados = filtrados.filter((d) => d.statusDiscipulado === params.statusDiscipulado);
        }
        if (params?.busca) {
          const b = params.busca.toLowerCase();
          filtrados = filtrados.filter(
            (d) =>
              d.nomeDecidido.toLowerCase().includes(b) ||
              d.culto.bairro.toLowerCase().includes(b) ||
              (d.pedidoOracaoDetalhe && d.pedidoOracaoDetalhe.toLowerCase().includes(b))
          );
        }

        const totalAceitou = filtrados.filter((d) => d.tipoDecisao === 'ACEITOU_JESUS').length;
        const totalReconciliacao = filtrados.filter((d) => d.tipoDecisao === 'RECONCILIACAO').length;
        const totalOracao = filtrados.filter((d) => d.tipoDecisao === 'PEDIDO_ORACAO').length;

        return {
          metricas: {
            totalGeral: filtrados.length,
            totalAceitouJesus: totalAceitou,
            totalReconciliacao: totalReconciliacao,
            totalPedidosOracao: totalOracao,
            totalPendente: filtrados.filter((d) => d.statusDiscipulado === 'PENDENTE').length,
            totalEmContato: filtrados.filter((d) => d.statusDiscipulado === 'EM_CONTATO').length,
            totalDiscipulando: filtrados.filter((d) => d.statusDiscipulado === 'DISCIPULANDO').length,
          },
          dados: filtrados,
        };
      }
    },
    staleTime: 1000 * 15, // 15s
  });
}

export function useAtualizarDiscipulado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: AtualizarDiscipuladoDto }) => {
      const res = await api.patch<DecisaoItem>(`/decisoes/${id}/discipulado`, dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisoes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
    },
  });
}
