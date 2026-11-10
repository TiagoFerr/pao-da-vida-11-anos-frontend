import React from 'react';
import { CultoMarker } from '@/types/culto';
import { usePresencasCulto } from '@/hooks/queries/usePresencas';
import { useDecisoesCulto } from '@/hooks/queries/useDecisoes';
import { useFotosCulto } from '@/hooks/queries/useFotos';
import {
  Heart,
  Users,
  Camera,
  Tv,
  Sparkles,
  Quote,
  ShieldCheck,
} from 'lucide-react';

interface MuralFrutosLarProps {
  culto: CultoMarker;
}

export const MuralFrutosLar: React.FC<MuralFrutosLarProps> = ({ culto }) => {
  const { data: resumoPresencas } = usePresencasCulto(culto.id);
  const { data: decisoes } = useDecisoesCulto(culto.id);
  const { data: fotos } = useFotosCulto(culto.id);

  const totalPresentes = resumoPresencas?.totalPresentes || 0;
  const totalMembros = resumoPresencas?.totalMembros || 0;
  const totalVisitantes = resumoPresencas?.totalVisitantes || 0;
  const vidasSalvas = (decisoes || []).filter(
    (d) => d.tipoDecisao === 'ACEITOU_JESUS' || d.tipoDecisao === 'RECONCILIACAO'
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#D2A34C]/15 text-[#D2A34C] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Frutos &amp; Memórias Deste Lar
            </h3>
            <p className="text-xs text-neutral-500">
              Registros da bênção de Deus derramada nesta casa.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Culto no Lar
        </span>
      </div>

      {/* Contadores dos Frutos */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-neutral-50 rounded-2xl p-3 sm:p-4 border border-neutral-200/80 text-center">
          <Users className="w-4 h-4 text-[#1D4225] mx-auto mb-1" />
          <span className="text-xl sm:text-2xl font-black text-neutral-900 block">
            {totalPresentes}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block truncate">
            {totalMembros} membros · {totalVisitantes} convidados
          </span>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-3 sm:p-4 border border-neutral-200/80 text-center">
          <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1 fill-current" />
          <span className="text-xl sm:text-2xl font-black text-rose-600 block">
            {vidasSalvas.length}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block truncate">
            Vidas Salvas
          </span>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-3 sm:p-4 border border-neutral-200/80 text-center">
          <Camera className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
          <span className="text-xl sm:text-2xl font-black text-neutral-900 block">
            {fotos?.length || 0}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block truncate">
            Fotos do Lar
          </span>
        </div>
      </div>

      {/* Vidas para Cristo neste Lar */}
      {vidasSalvas.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D2A34C]/10 via-[#D2A34C]/5 to-transparent border border-[#D2A34C]/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7428]">
            <Sparkles className="w-3.5 h-3.5 text-[#D2A34C]" />
            <span>Vidas Ganhas para Jesus Nesta Residência:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {vidasSalvas.map((v) => (
              <span
                key={v.id}
                className="px-3 py-1 rounded-full text-xs font-bold bg-white text-neutral-900 border border-[#D2A34C]/40 shadow-xs flex items-center gap-1.5"
              >
                <Heart className="w-3 h-3 text-rose-500 fill-current" />
                {v.nomeDecidido}
                <span className="text-[10px] text-[#9A7428] font-normal uppercase">
                  ({v.tipoDecisao === 'ACEITOU_JESUS' ? 'Nova Vida' : 'Reconciliação'})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Galeria de Fotos do Lar */}
      {fotos && fotos.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Fotos da Noite de Louvor &amp; Comunhão
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {fotos.map((f) => (
              <div
                key={f.id}
                className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 border border-neutral-200 group shadow-xs"
              >
                <img
                  src={f.urlPublica}
                  alt={f.legenda || 'Foto do lar'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {f.aprovadoParaTelao && (
                  <div className="absolute top-2 left-2 bg-[#D2A34C] text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Tv className="w-3 h-3" />
                    No Telão
                  </div>
                )}

                {f.legenda && (
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] font-medium line-clamp-1">
                    {f.legenda}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agradecimento Pastoral à Família Anfitriã */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1D4225] uppercase tracking-wider">
          <Quote className="w-4 h-4" />
          <span>Palavra Pastoral aos Anfitriões</span>
        </div>

        <p className="text-xs text-neutral-600 italic leading-relaxed">
          "A igreja de Cristo se alegra imensamente com a generosidade de sua família
          em consagrar este lar. Assim como na igreja primitiva que se reunia pelas casas
          (Atos 2:46), o nome do Senhor foi glorificado e vidas foram tocadas pelo amor de Deus."
        </p>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Liderança Pastoral • Igreja Pão da Vida Mossoró</span>
        </div>
      </div>
    </div>
  );
};
