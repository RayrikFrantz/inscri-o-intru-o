export type Turno = 'Dia' | 'Noite';
export type Horario = '05h' | '08h' | '17h' | '20h' | '09h';

export interface Participant {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  funcao: string;
  tipoVeiculo?: string; // Tipo de veículo que opera ou dirige
  data: string; // YYYY-MM-DD
  turno: Turno;
  horario: Horario;
  codigoAutenticacao: string;
  dataCadastro: string;
  status: 'confirmado' | 'bloqueado' | 'cancelado';
}

export const TIPOS_VEICULOS_COMUNS = [
  'Caminhão Fora de Estrada (CAT 793 / 797 / etc.)',
  'Veículo Leve / Caminhonete 4x4 (Hilux / Ranger / etc.)',
  'Caminhão Traçado / Basculante / Caçamba',
  'Caminhão Pipa / Comboio / Apoio',
  'Pá Carregadeira / Escavadeira Hidráulica',
  'Trator de Esteira / Motoniveladora',
  'Van / Ônibus de Transporte de Pessoal',
  'Perfuratriz / Equipamento Auxiliar de Mina',
  'Outro (especificar)',
  'Não opera veículo (Pedestre / Gestão / Fiscalização)',
] as const;

export interface TurmaConfig {
  turno: Turno;
  horario: Horario;
  capacidade: number;
}

export interface BlockedMatricula {
  matricula: string;
  nome: string;
  motivo: string;
  dataBloqueio: string;
}

export interface BannerSettings {
  mode: 'default' | 'custom-url';
  customUrl: string;
  altText: string;
}
