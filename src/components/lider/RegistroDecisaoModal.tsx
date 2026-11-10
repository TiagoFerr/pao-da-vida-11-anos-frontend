import React, { useState, useEffect } from 'react';
import { TipoDecisao } from '@/types/decisao';
import { useRegistrarDecisao } from '@/hooks/queries/useDecisoes';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import {
  X,
  Sparkles,
  Heart,
  RotateCcw,
  HandHeart,
  Send,
  UserCheck,
} from 'lucide-react';

interface RegistroDecisaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultoId: string;
  initialNome?: string;
  initialTelefone?: string;
  initialPresencaId?: string;
}

const TIPO_DECISAO_OPTIONS: {
  tipo: TipoDecisao;
  titulo: string;
  subtitulo: string;
  icone: React.ComponentType<{ className?: string }>;
  corFundo: string;
  corBorda: string;
  corTexto: string;
}[] = [
  {
    tipo: 'ACEITOU_JESUS',
    titulo: 'Aceitou a Jesus',
    subtitulo: 'Entregou a vida a Cristo pela 1ª vez neste lar!',
    icone: Sparkles,
    corFundo: 'bg-[#D2A34C]/10',
    corBorda: 'border-[#D2A34C]',
    corTexto: 'text-[#9A7428]',
  },
  {
    tipo: 'RECONCILIACAO',
    titulo: 'Reconciliação',
    subtitulo: 'Retornou aos caminhos do Senhor com alegria.',
    icone: RotateCcw,
    corFundo: 'bg-emerald-50',
    corBorda: 'border-emerald-500',
    corTexto: 'text-emerald-800',
  },
  {
    tipo: 'PEDIDO_ORACAO',
    titulo: 'Pedido de Oração',
    subtitulo: 'Necessidade específica para os pastores intercederem.',
    icone: HandHeart,
    corFundo: 'bg-indigo-50',
    corBorda: 'border-indigo-500',
    corTexto: 'text-indigo-800',
  },
];

export const RegistroDecisaoModal: React.FC<RegistroDecisaoModalProps> = ({
  isOpen,
  onClose,
  cultoId,
  initialNome = '',
  initialTelefone = '',
  initialPresencaId,
}) => {
  const { showToast } = useUIStore();
  const registrarDecisaoMutation = useRegistrarDecisao(cultoId);

  const [tipo, setTipo] = useState<TipoDecisao>('ACEITOU_JESUS');
  const [nome, setNome] = useState(initialNome);
  const [telefone, setTelefone] = useState(initialTelefone);
  const [detalhe, setDetalhe] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome(initialNome);
      setTelefone(initialTelefone);
      setDetalhe('');
      setTipo('ACEITOU_JESUS');
    }
  }, [isOpen, initialNome, initialTelefone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showToast('O nome da pessoa é obrigatório.', 'error');
      return;
    }

    try {
      await registrarDecisaoMutation.mutateAsync({
        nomeDecidido: nome.trim(),
        telefone: telefone.trim() || undefined,
        tipoDecisao: tipo,
        presencaId: initialPresencaId,
        pedidoOracaoDetalhe: detalhe.trim() || undefined,
      });

      if (tipo === 'ACEITOU_JESUS' || tipo === 'RECONCILIACAO') {
        soundEffects.playCelebration();
        showToast('🎉 Aleluia! Mais uma vida preciosa registrada para o Reino de Deus!', 'success');
      } else {
        soundEffects.playJoinSound();
        showToast('Pedido de oração encaminhado aos pastores com sucesso.', 'success');
      }

      onClose();
    } catch {
      showToast('Erro ao salvar decisão no servidor.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D2A34C]/30 flex flex-col max-h-[90vh]">
        {/* Cabeçalho Celestial com Gradiente Nobre */}
        <div className="bg-gradient-to-r from-[#1D4225] via-[#24532f] to-[#1D4225] p-5 sm:p-6 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D2A34C]/25 border border-[#D2A34C]/40 flex items-center justify-center text-[#D2A34C]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Vidas para Cristo & Oração
              </h2>
              <p className="text-xs text-white/70">
                120 Cultos nos Lares • Efésios 4:16
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Seletor do Tipo de Decisão */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Escolha a Decisão Espiritual
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TIPO_DECISAO_OPTIONS.map((opt) => {
                const Icone = opt.icone;
                const selecionado = tipo === opt.tipo;
                return (
                  <button
                    key={opt.tipo}
                    type="button"
                    onClick={() => {
                      setTipo(opt.tipo);
                      soundEffects.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selecionado
                        ? `${opt.corFundo} ${opt.corBorda} shadow-xs scale-[1.02]`
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icone
                        className={`w-5 h-5 ${
                          selecionado ? opt.corTexto : 'text-neutral-400'
                        }`}
                      />
                      {selecionado && (
                        <span className="w-2 h-2 rounded-full bg-[#1D4225]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block text-neutral-900 leading-tight">
                        {opt.titulo}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nome da Pessoa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Nome da Pessoa *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Carlos Oliveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp para Consolidação */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Telefone / WhatsApp (para acompanhamento)
            </label>
            <input
              type="tel"
              placeholder="(84) 98888-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900"
            />
          </div>

          {/* Detalhes / Motivo / Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {tipo === 'PEDIDO_ORACAO'
                ? 'Motivo do Pedido de Oração *'
                : 'Observações / Testemunho do Momento (opcional)'}
            </label>
            <textarea
              rows={3}
              placeholder={
                tipo === 'PEDIDO_ORACAO'
                  ? 'Ex: Oração pela cura do filho, restauração familiar...'
                  : 'Ex: Entregou a vida emocionado durante o apelo...'
              }
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900 resize-none"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={registrarDecisaoMutation.isPending || !nome.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D2A34C] to-[#b88c3a] hover:from-[#c29440] hover:to-[#a77e33] text-white font-bold text-sm shadow-md shadow-[#D2A34C]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {registrarDecisaoMutation.isPending
                ? 'Registrando no Céu...'
                : 'Salvar e Notificar Pastores'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
