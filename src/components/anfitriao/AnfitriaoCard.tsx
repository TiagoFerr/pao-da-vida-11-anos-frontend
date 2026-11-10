import React, { useState, useEffect } from 'react';
import { CultoMarker } from '@/types/culto';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import {
  Home,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2,
} from 'lucide-react';

interface AnfitriaoCardProps {
  culto: CultoMarker;
}

export const AnfitriaoCard: React.FC<AnfitriaoCardProps> = ({ culto }) => {
  const { showToast } = useUIStore();

  const storageKey = `ce_lar_pronto_${culto.id}`;
  const [larPronto, setLarPronto] = useState<boolean>(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  useEffect(() => {
    setLarPronto(localStorage.getItem(storageKey) === 'true');
  }, [culto.id, storageKey]);

  const handleTogglePronto = () => {
    const novoStatus = !larPronto;
    setLarPronto(novoStatus);
    localStorage.setItem(storageKey, String(novoStatus));

    if (novoStatus) {
      soundEffects.playCelebration();
      showToast('🎉 Aleluia! Seu lar está confirmado e pronto para receber o mover de Deus!', 'success');
    } else {
      soundEffects.playClick();
      showToast('Status do lar atualizado.', 'info');
    }
  };

  const formattedLiderTel = culto.liderTel?.replace(/\D/g, '') || '';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
      {/* Cabeçalho Acolhedor com Identidade Visual Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1D4225]/10 text-[#1D4225] flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D2A34C] block leading-none">
              Casa de Paz &amp; Salvação
            </span>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 mt-0.5">
              Lar de {culto.anfitriao || 'Família Anfitriã'}
            </h2>
          </div>
        </div>

        {/* Badge do Setor */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1D4225]/10 text-[#1D4225] border border-[#1D4225]/20">
            Setor {culto.setor} • Mossoró - RN
          </span>
        </div>
      </div>

      {/* Grid de Informações Chave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
        {/* Endereço Confirmado */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <MapPin className="w-3.5 h-3.5 text-[#1D4225]" />
            <span>Endereço da Residência</span>
          </div>
          <p className="font-bold text-neutral-900 leading-snug">
            {culto.rua}
            {culto.numero ? `, nº ${culto.numero}` : ''}
          </p>
          <p className="text-xs text-neutral-500">
            Bairro {culto.bairro}
            {culto.referencia ? ` (${culto.referencia})` : ''}
          </p>
        </div>

        {/* Data e Horário Oficial */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-[#D2A34C]" />
            <span>Data e Horário</span>
          </div>
          <p className="font-bold text-neutral-900 leading-snug">
            Quinta-feira, 19 de Novembro de 2026
          </p>
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            Início pontual às <strong>{culto.horario || '19:30'}</strong>
          </p>
        </div>

        {/* Líder Designado */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Líder de Culto Escalado</span>
            </div>
            {formattedLiderTel && (
              <a
                href={`https://wa.me/55${formattedLiderTel}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Conversar no WhatsApp
              </a>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
            <span className="font-bold text-neutral-900 text-sm sm:text-base">
              {culto.lider || 'Líder a confirmar'}
            </span>
            {culto.liderTel && (
              <span className="text-xs text-neutral-500 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-neutral-400" />
                {culto.liderTel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botão de Confirmação "Nosso Lar está Pronto!" */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTogglePronto}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
            larPronto
              ? 'bg-gradient-to-r from-[#1D4225] to-[#15311b] text-white shadow-[#1D4225]/20 ring-2 ring-emerald-500/30'
              : 'bg-white border-2 border-[#D2A34C] text-[#9A7428] hover:bg-[#D2A34C]/10'
          }`}
        >
          {larPronto ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Nosso Lar Está Confirmado e Pronto para o Culto!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#D2A34C]" />
              <span>Toque aqui para Confirmar que sua Casa está Pronta</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
