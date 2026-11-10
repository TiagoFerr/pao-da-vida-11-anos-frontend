import { Role } from './api';

export type StatusConvite = 'PENDENTE' | 'UTILIZADO' | 'EXPIRADO';

export interface ConviteItem {
  id: string;
  tipoPapel: Role;
  setorNumero: number;
  nomeDestinatario: string | null;
  telefoneDestinatario: string | null;
  utilizado: boolean;
  expirado: boolean;
  expiraEm: string;
  createdAt: string;
}

export interface CriarConviteCoordenadorDto {
  setorNumero: number;
  nomeSugerido?: string;
  telefoneSugerido?: string;
  expiraEmDias?: number;
}

export interface CriarConviteMembroDto {
  setorNumero?: number;
  tipoPapel: 'LIDER' | 'ANFITRIAO';
  nomeSugerido?: string;
  telefoneSugerido?: string;
  expiraEmDias?: number;
}

export interface ConviteCriadoResponse {
  id: string;
  token: string;
  link: string;
  tipoPapel: Role;
  setorNumero: number;
  setorNome: string;
  expiraEm: string;
}

export interface ValidarConviteResponse {
  valido: boolean;
  tipoPapel: Role;
  setorNumero: number;
  setorNome: string;
  nomeDestinatario: string | null;
  telefoneDestinatario: string | null;
  expiraEm: string;
}
