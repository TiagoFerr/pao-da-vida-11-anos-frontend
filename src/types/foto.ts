export interface FotoCultoResumo {
  numeroSequencial: number | null;
  setorNumero: number;
  bairro: string;
  liderNome: string;
}

export interface FotoTelaoItem {
  id: string;
  cultoId: string;
  culto?: FotoCultoResumo;
  s3Key: string;
  urlPublica: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  legenda: string | null;
  aprovadoParaTelao: boolean;
  enviadoPorNome: string | null;
  createdAt: string;
}

export interface FotosTelaoResponse {
  dados: FotoTelaoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltrarFotosTelaoParams {
  setorNumero?: number;
  somenteAprovadas?: boolean;
  page?: number;
  limit?: number;
}

export interface SolicitarPresignedUrlDto {
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes?: number;
}

export interface PresignedUploadResponseDto {
  uploadUrl: string;
  s3Key: string;
  urlPublica: string;
  expiraEmSegundos: number;
}

export interface ConfirmarFotoDto {
  s3Key: string;
  urlPublica: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  legenda?: string;
}
