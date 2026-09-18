import { Participant, BlockedMatricula, BannerSettings } from '../types';

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_BLOCKED: BlockedMatricula[] = [];

export const SAMPLE_IMAGE_LINKS = [
  {
    label: 'Banner Oficial Mina do Salobo (Mão Inglesa)',
    url: '/assets/banner_mao_inglesa.jpg',
    description: 'Campanha de trânsito em mão inglesa com caminhões fora de estrada',
  },
  {
    label: 'Operação de Mina & Equipamentos Pesados',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1600&auto=format&fit=crop',
    description: 'Estrutura técnica e instrução de segurança',
  },
  {
    label: 'Pista de Tráfego e Logística Industrial',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=1600&auto=format&fit=crop',
    description: 'Sinalização e tráfego de vias operacionais',
  },
];
