export type Role = 'ADMIN' | 'PASTOR' | 'COORDENADOR' | 'LIDER' | 'ANFITRIAO';

export type StatusCulto = 'PLANEJADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export type TipoVinculo = 'MEMBRO_ATIVO' | 'CONGREGADO' | 'VISITANTE';

export interface UsuarioAuthInfo {
  id: string;
  email: string;
  role: Role;
  setorNumero: number | null;
  nome: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioAuthInfo;
}

export interface PessoaPerfil {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  tipoVinculo: TipoVinculo;
  endereco: string | null;
  bairro: string | null;
}

export interface SetorPerfil {
  numero: number;
  nome: string;
  coordenadorNome: string | null;
  corHex: string | null;
}

export interface UsuarioPerfil {
  id: string;
  email: string;
  role: Role;
  setorNumero: number | null;
  ativo: boolean;
  createdAt: string;
  pessoa: PessoaPerfil | null;
  setor: SetorPerfil | null;
}

export interface SetorItem {
  id: string;
  numero: number;
  nome: string;
  coordenadorNome: string | null;
  coordenadorTelefone: string | null;
  corHex: string | null;
  metaCultos: number;
  totalCultos?: number;
  totalPessoas?: number;
  totalDecisoes?: number;
}

export interface CultoFoto {
  id: string;
  url: string;
  legenda?: string | null;
  aprovadaTelao: boolean;
  createdAt: string;
}

export interface CultoPresenca {
  id: string;
  nome: string;
  telefone?: string | null;
  tipoVinculo: TipoVinculo;
}

export interface CultoDecisao {
  id: string;
  nome: string;
  telefone?: string | null;
  tipoDecisao: 'ACEITOU_CRISTO' | 'RECONCILIACAO' | 'BATISMO';
}

export interface CultoItem {
  id: string;
  setorNumero: number;
  status: StatusCulto;
  dataHora: string;
  cep?: string | null;
  logradouro: string;
  numero?: string | null;
  complemento?: string | null;
  bairro: string;
  pontoReferencia?: string | null;
  latitude: number;
  longitude: number;
  svgX: number;
  svgY: number;
  liderNome: string;
  liderTelefone?: string | null;
  anfitriaoNome: string;
  anfitriaoTelefone?: string | null;
  observacoes?: string | null;
  criadoPorId?: string | null;
  presencas?: CultoPresenca[];
  decisoes?: CultoDecisao[];
  fotos?: CultoFoto[];
  createdAt: string;
  updatedAt: string;
}

export interface CriarCultoDto {
  setorNumero: number;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  pontoReferencia?: string;
  latitude: number;
  longitude: number;
  svgX: number;
  svgY: number;
  liderNome: string;
  liderTelefone?: string;
  anfitriaoNome: string;
  anfitriaoTelefone?: string;
  observacoes?: string;
  dataHora?: string;
}

export interface ConviteValidado {
  valido: boolean;
  role: Role;
  setorNumero: number;
  setorNome: string;
  nomeSugerido?: string | null;
  telefoneSugerido?: string | null;
}

export interface AtivarConviteDto {
  token: string;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface MetricasGerais {
  metaGlobal: number;
  totalCultosCadastrados: number;
  totalCultosConfirmados: number;
  totalPessoasPresentes: number;
  totalDecisoesParaCristo: number;
  percentualMeta: number;
  setores: {
    numero: number;
    nome: string;
    cor: string;
    totalCultos: number;
    meta: number;
    percentual: number;
  }[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export type SseTipoEvento =
  | 'vida.para.cristo'
  | 'culto.cadastrado'
  | 'culto.status_alterado'
  | 'meta.progresso'
  | 'comunicado.pastoral'
  | 'ping';

export interface SsePayloadEnvelope<T = any> {
  tipo: SseTipoEvento;
  setorNumero?: number | null;
  isBroadcast?: boolean;
  timestamp: string;
  payload: T;
}

