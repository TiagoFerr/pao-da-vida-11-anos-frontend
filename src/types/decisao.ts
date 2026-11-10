export type TipoDecisao = 'ACEITOU_JESUS' | 'RECONCILIACAO' | 'PEDIDO_ORACAO';

export type StatusDiscipulado = 'PENDENTE' | 'EM_CONTATO' | 'DISCIPULANDO' | 'CONCLUIDO';

export interface DecisaoCultoOrigem {
  id: string;
  numeroSequencial: number | null;
  setorNumero: number;
  setorNome: string;
  bairro: string;
  liderNome: string;
  anfitriaoNome: string;
}

export interface DecisaoItem {
  id: string;
  cultoId: string;
  culto: DecisaoCultoOrigem;
  presencaId: string | null;
  nomeDecidido: string;
  telefone: string | null;
  tipoDecisao: TipoDecisao;
  pedidoOracaoDetalhe: string | null;
  statusDiscipulado: StatusDiscipulado;
  registradoPorNome: string | null;
  createdAt: string;
}

export interface MetricasDecisoes {
  totalGeral: number;
  totalAceitouJesus: number;
  totalReconciliacao: number;
  totalPedidosOracao: number;
  totalPendente: number;
  totalEmContato: number;
  totalDiscipulando: number;
}

export interface RelatorioDecisoesConsolidado {
  metricas: MetricasDecisoes;
  dados: DecisaoItem[];
}

export interface FiltrarDecisoesParams {
  setorNumero?: number;
  tipoDecisao?: TipoDecisao;
  statusDiscipulado?: StatusDiscipulado;
  busca?: string;
}

export interface AtualizarDiscipuladoDto {
  statusDiscipulado: StatusDiscipulado;
  observacao?: string;
}
