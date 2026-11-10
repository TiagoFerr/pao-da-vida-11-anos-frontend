export interface PresencaItem {
  id: string;
  cultoId: string;
  pessoaId?: string | null;
  nomeParticipante: string;
  telefone?: string | null;
  eMembro: boolean;
  presente: boolean;
  checkinEm: string;
}

export interface ResumoPresencas {
  cultoId: string;
  numeroSequencial?: number | null;
  totalParticipantes: number;
  totalMembros: number;
  totalVisitantes: number;
  totalPresentes: number;
  participantes: PresencaItem[];
}

export interface CriarPresencaDto {
  nomeParticipante: string;
  telefone?: string;
  eMembro?: boolean;
  presente?: boolean;
  pessoaId?: string;
}

export interface AtualizarPresencaDto {
  nomeParticipante?: string;
  telefone?: string;
  eMembro?: boolean;
  presente?: boolean;
}
