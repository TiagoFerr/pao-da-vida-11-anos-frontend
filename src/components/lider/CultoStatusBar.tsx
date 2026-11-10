import React from 'react';
import { StatusCulto } from '@/types/api';
import { useUpdateCultoStatus } from '@/hooks/queries/useCultos';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import { Play, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';

interface CultoStatusBarProps {
  cultoId: string;
  statusAtual?: StatusCulto;
  onStatusChanged?: (novoStatus: StatusCulto) => void;
}

const STATUS_CONFIG: Record<
  StatusCulto,
  {
    label: string;
    corFundo: string;
    corTexto: string;
    corBorda: string;
    icone: React.ComponentType<{ className?: string }>;
    descricao: string;
  }
> = {
  PLANEJADO: {
    label: 'Planejado',
    corFundo: 'bg-amber-50',
    corTexto: 'text-amber-800',
    corBorda: 'border-amber-200',
    icone: Clock,
    descricao: 'Aguardando o horário marcado para iniciar a reunião no lar.',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    corFundo: 'bg-emerald-50',
    corTexto: 'text-emerald-800',
    corBorda: 'border-emerald-200',
    icone: AlertCircle,
    descricao: 'Anfitrião e equipe prontos para abrir as portas do lar.',
  },
  EM_ANDAMENTO: {
    label: 'Culto em Andamento',
    corFundo: 'bg-[#1D4225]/10',
    corTexto: 'text-[#1D4225]',
    corBorda: 'border-[#1D4225]/30',
    icone: Sparkles,
    descricao: 'O Espírito Santo está agindo! Louvor, palavra e oração no lar.',
  },
  CONCLUIDO: {
    label: 'Concluído com Vitória',
    corFundo: 'bg-[#D2A34C]/15',
    corTexto: 'text-[#9A7428]',
    corBorda: 'border-[#D2A34C]/40',
    icone: CheckCircle2,
    descricao: 'Reunião finalizada com sucesso, comunhão e glória a Deus!',
  },
  CANCELADO: {
    label: 'Cancelado',
    corFundo: 'bg-rose-50',
    corTexto: 'text-rose-800',
    corBorda: 'border-rose-200',
    icone: AlertCircle,
    descricao: 'Culto desmarcado neste lar.',
  },
};

export const CultoStatusBar: React.FC<CultoStatusBarProps> = ({
  cultoId,
  statusAtual = 'CONFIRMADO',
  onStatusChanged,
}) => {
  const { showToast } = useUIStore();
  const updateStatusMutation = useUpdateCultoStatus();

  const config = STATUS_CONFIG[statusAtual] || STATUS_CONFIG.CONFIRMADO;
  const Icone = config.icone;

  const handleMudarStatus = async (novoStatus: StatusCulto) => {
    try {
      await updateStatusMutation.mutateAsync({ id: cultoId, status: novoStatus });
      onStatusChanged?.(novoStatus);

      if (novoStatus === 'EM_ANDAMENTO') {
        soundEffects.playJoinSound();
        showToast('🔥 Culto no Lar iniciado! O painel pastoral agora sabe que a reunião começou.', 'success');
      } else if (novoStatus === 'CONCLUIDO') {
        soundEffects.playCelebration();
        showToast('🎉 Aleluia! Reunião concluída e registrada nos 120 Lares.', 'success');
      } else {
        soundEffects.playClick();
        showToast(`Status atualizado para: ${novoStatus}`, 'info');
      }
    } catch {
      showToast('Não foi possível sincronizar o status com o servidor.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm transition-all">
      {/* Cabeçalho do Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Fase Atual da Reunião
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${config.corFundo} ${config.corTexto} ${config.corBorda}`}
            >
              {statusAtual === 'EM_ANDAMENTO' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              <Icone className="w-4 h-4" />
              {config.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 max-w-xs">{config.descricao}</p>
      </div>

      {/* Botões de Ação Direta Mobile (Grandes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {statusAtual !== 'EM_ANDAMENTO' && statusAtual !== 'CONCLUIDO' && (
          <button
            type="button"
            disabled={updateStatusMutation.isPending}
            onClick={() => handleMudarStatus('EM_ANDAMENTO')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#1D4225] hover:bg-[#15311b] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#1D4225]/20 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            Iniciar Culto Agora
          </button>
        )}

        {statusAtual === 'EM_ANDAMENTO' && (
          <button
            type="button"
            disabled={updateStatusMutation.isPending}
            onClick={() => handleMudarStatus('CONCLUIDO')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#D2A34C] to-[#b88c3a] hover:from-[#c29440] hover:to-[#a77e33] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#D2A34C]/25 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Concluir e Finalizar Culto
          </button>
        )}

        {statusAtual === 'CONCLUIDO' && (
          <button
            type="button"
            disabled={updateStatusMutation.isPending}
            onClick={() => handleMudarStatus('EM_ANDAMENTO')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            Reabrir Reunião (Ajustes)
          </button>
        )}
      </div>
    </div>
  );
};
