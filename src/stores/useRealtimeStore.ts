import { create } from 'zustand';
import { SsePayloadEnvelope, SseTipoEvento } from '../types/api';

export interface FeedEventItem {
  id: string;
  tipo: SseTipoEvento;
  titulo: string;
  descricao: string;
  setorNumero?: number | null;
  timestamp: string;
  rawPayload?: any;
}

interface RealtimeState {
  events: FeedEventItem[];
  latestDecisaoEvent: FeedEventItem | null;
  addEvent: (envelope: SsePayloadEnvelope) => void;
  clearLatestDecisao: () => void;
  clearEvents: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  events: [
    {
      id: 'init-evt-1',
      tipo: 'culto.cadastrado',
      titulo: 'Culto Registrado',
      descricao: 'Setor 11 (Centro) confirmou o lar da Irmã Cláudia.',
      setorNumero: 11,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'init-evt-2',
      tipo: 'vida.para.cristo',
      titulo: 'Nova Vida para Cristo!',
      descricao: 'Marcos Vinícius tomou sua decisão no Setor 1 (Aeroporto).',
      setorNumero: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 'init-evt-3',
      tipo: 'culto.status_alterado',
      titulo: 'Culto em Andamento',
      descricao: 'Setor 5 (Abolição) iniciou a ministração da Palavra.',
      setorNumero: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
  ],
  latestDecisaoEvent: null,

  addEvent: (envelope: SsePayloadEnvelope) => {
    let titulo = 'Atualização em Tempo Real';
    let descricao = 'Novo evento recebido.';

    switch (envelope.tipo) {
      case 'vida.para.cristo':
        titulo = 'Glória a Deus! Vida para Cristo!';
        descricao = envelope.payload?.nome
          ? `${envelope.payload.nome} entregou a vida a Jesus no Setor ${envelope.setorNumero || 'Geral'}.`
          : `Nova decisão registrada no Setor ${envelope.setorNumero || 'Geral'}.`;
        break;
      case 'culto.cadastrado':
        titulo = 'Novo Culto no Lar Confirmado';
        descricao = envelope.payload?.logradouro
          ? `Lar em ${envelope.payload.logradouro} (${envelope.payload.bairro}, Setor ${envelope.setorNumero}).`
          : `Novo lar confirmado no Setor ${envelope.setorNumero}.`;
        break;
      case 'culto.status_alterado':
        titulo = 'Status do Culto Atualizado';
        descricao = `O culto no Setor ${envelope.setorNumero} mudou para ${envelope.payload?.status || 'novo status'}.`;
        break;
      case 'comunicado.pastoral':
        titulo = envelope.payload?.titulo || 'Comunicado Pastoral';
        descricao = envelope.payload?.mensagem || 'Aviso da liderança geral aos lares.';
        break;
      case 'meta.progresso':
        titulo = 'Avanço da Meta dos 120 Lares';
        descricao = `Atingidos ${envelope.payload?.totalCultos || ''} lares em Mossoró.`;
        break;
      default:
        titulo = `Evento: ${envelope.tipo}`;
        descricao = JSON.stringify(envelope.payload || {});
    }

    const newEvent: FeedEventItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tipo: envelope.tipo,
      titulo,
      descricao,
      setorNumero: envelope.setorNumero,
      timestamp: envelope.timestamp || new Date().toISOString(),
      rawPayload: envelope.payload,
    };

    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 50),
      latestDecisaoEvent: envelope.tipo === 'vida.para.cristo' ? newEvent : state.latestDecisaoEvent,
    }));
  },

  clearLatestDecisao: () => set({ latestDecisaoEvent: null }),
  clearEvents: () => set({ events: [] }),
}));
