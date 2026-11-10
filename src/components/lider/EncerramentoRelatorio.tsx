import React from 'react';
import { usePresencasCulto } from '@/hooks/queries/usePresencas';
import { useDecisoesCulto } from '@/hooks/queries/useDecisoes';
import { useFotosCulto } from '@/hooks/queries/useFotos';
import { useUpdateCultoStatus } from '@/hooks/queries/useCultos';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import { StatusCulto } from '@/types/api';
import {
  Trophy,
  Users,
  Heart,
  Camera,
  CheckCircle2,
  Share2,
  Sparkles,
} from 'lucide-react';

interface EncerramentoRelatorioProps {
  cultoId: string;
  statusAtual?: StatusCulto;
  onStatusChanged?: (novoStatus: StatusCulto) => void;
  liderNome?: string;
  anfitriaoNome?: string;
  bairro?: string;
  setorNumero?: number;
}

export const EncerramentoRelatorio: React.FC<EncerramentoRelatorioProps> = ({
  cultoId,
  statusAtual = 'EM_ANDAMENTO',
  onStatusChanged,
  liderNome,
  anfitriaoNome,
  bairro,
  setorNumero,
}) => {
  const { showToast } = useUIStore();
  const { data: resumoPresencas } = usePresencasCulto(cultoId);
  const { data: decisoes } = useDecisoesCulto(cultoId);
  const { data: fotos } = useFotosCulto(cultoId);
  const updateStatusMutation = useUpdateCultoStatus();

  const totalPresentes = resumoPresencas?.totalPresentes || 0;
  const totalMembros = resumoPresencas?.totalMembros || 0;
  const totalVisitantes = resumoPresencas?.totalVisitantes || 0;
  const totalVidas = (decisoes || []).filter(
    (d) => d.tipoDecisao === 'ACEITOU_JESUS' || d.tipoDecisao === 'RECONCILIACAO'
  ).length;
  const totalFotos = fotos?.length || 0;

  const handleConcluir = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id: cultoId, status: 'CONCLUIDO' });
      onStatusChanged?.('CONCLUIDO');
      soundEffects.playCelebration();
      showToast('🎉 Aleluia! Reunião concluída e relatório enviado!', 'success');
    } catch {
      showToast('Erro ao atualizar status do culto.', 'error');
    }
  };

  const handleCompartilharWhatsApp = () => {
    const texto = `🔥 *RELATÓRIO DO CULTO NO LAR - 120 LARES* 🔥
📍 *Setor ${setorNumero || 1}* • Bairro: ${bairro || 'Mossoró'}
👤 *Líder:* ${liderNome || 'Líder'}
🏠 *Anfitrião:* ${anfitriaoNome || 'Família'}

👥 *Total Presentes:* ${totalPresentes} (${totalMembros} membros | ${totalVisitantes} visitantes)
🕊️ *Vidas para Cristo:* ${totalVidas}
📸 *Fotos Registradas:* ${totalFotos}

_"Dele todo o corpo, ajustado e unido pelo auxílio de todas as juntas, cresce e edifica-se a si mesmo em amor." (Efésios 4:16)_
Igreja Pão da Vida • 11 Anos de História!`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Banner Triunfante */}
      <div className="bg-gradient-to-br from-[#1D4225] via-[#255630] to-[#142e1a] rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-[#D2A34C]/30 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-[#D2A34C]">
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-xs font-black uppercase tracking-widest">
              Fechamento da Reunião
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            Resumo do Culto no Lar
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-md">
            Confira os frutos desta noite de celebração antes de enviar o
            fechamento definitivo para a liderança pastoral.
          </p>
        </div>

        {/* Efeito decorativo sutil */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#D2A34C]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs text-center">
          <Users className="w-5 h-5 text-[#1D4225] mx-auto mb-1.5" />
          <span className="text-2xl font-black text-neutral-900 block">
            {totalPresentes}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Total Presentes
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs text-center">
          <Users className="w-5 h-5 text-[#D2A34C] mx-auto mb-1.5" />
          <span className="text-2xl font-black text-neutral-900 block">
            {totalVisitantes}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Visitantes
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs text-center">
          <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1.5 fill-current" />
          <span className="text-2xl font-black text-rose-600 block">
            {totalVidas}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Vidas Salvas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs text-center">
          <Camera className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
          <span className="text-2xl font-black text-neutral-900 block">
            {totalFotos}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
            Fotos Enviadas
          </span>
        </div>
      </div>

      {/* Ação de Conclusão ou Status Concluído */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
        {statusAtual === 'CONCLUIDO' ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-900">
              Culto Concluído com Sucesso!
            </h4>
            <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
              Glória a Deus pelo mover dEle neste lar! Os dados já foram consolidados no
              placar geral dos 120 Cultos nos Lares.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={updateStatusMutation.isPending}
            onClick={handleConcluir}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-[#D2A34C] via-[#c29440] to-[#b88c3a] hover:opacity-95 text-white font-black text-base rounded-2xl shadow-lg shadow-[#D2A34C]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {updateStatusMutation.isPending
              ? 'Concluindo...'
              : 'Concluir Culto e Enviar Relatório ao Pastor'}
          </button>
        )}

        {/* Botão de Compartilhar no WhatsApp */}
        <button
          type="button"
          onClick={handleCompartilharWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar Relatório no WhatsApp da Liderança
        </button>
      </div>
    </div>
  );
};
