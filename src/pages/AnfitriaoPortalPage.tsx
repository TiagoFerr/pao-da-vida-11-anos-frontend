import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCultosList } from '@/hooks/queries/useCultos';
import { AnfitriaoCard } from '@/components/anfitriao/AnfitriaoCard';
import { ConviteVizinhoWhatsApp } from '@/components/anfitriao/ConviteVizinhoWhatsApp';
import { ChecklistPreparacao } from '@/components/anfitriao/ChecklistPreparacao';
import { MuralFrutosLar } from '@/components/anfitriao/MuralFrutosLar';
import { CultoMarker } from '@/types/culto';
import {
  Home,
  MapPin,
  MessageCircle,
  ListChecks,
  Heart,
  ArrowLeft,
  ChevronDown,
  Tv,
} from 'lucide-react';

interface AnfitriaoPortalPageProps {
  cultosFallback?: CultoMarker[];
}

type TabType = 'lar' | 'convite' | 'checklist' | 'frutos';

export const AnfitriaoPortalPage: React.FC<AnfitriaoPortalPageProps> = ({
  cultosFallback = [],
}) => {
  const { cultoId: paramCultoId } = useParams<{ cultoId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: apiCultos } = useCultosList();

  // Lista normalizada de cultos
  const listaCultos = useMemo(() => {
    if (apiCultos && apiCultos.length > 0) {
      return apiCultos.map((item) => ({
        id: item.id,
        setor: item.setorNumero,
        x: item.svgX,
        y: item.svgY,
        rua: item.logradouro,
        numero: item.numero || undefined,
        bairro: item.bairro,
        referencia: item.pontoReferencia || undefined,
        lider: item.liderNome,
        liderTel: item.liderTelefone || undefined,
        anfitriao: item.anfitriaoNome,
        anfTel: item.anfitriaoTelefone || undefined,
        pessoas: item.presencas?.map((p) => p.nome) || [],
        horario: item.dataHora ? item.dataHora.slice(11, 16) : '19:30',
        obs: item.observacoes || undefined,
        status: item.status,
      }));
    }
    return cultosFallback;
  }, [apiCultos, cultosFallback]);

  // Identificação do lar do anfitrião
  const [selectedCultoId, setSelectedCultoId] = useState<string>(() => {
    if (paramCultoId) return paramCultoId;
    if (user?.nome) {
      const match = listaCultos.find(
        (c) => c.anfitriao?.toLowerCase().includes(user.nome?.toLowerCase() || '')
      );
      if (match) return match.id;
    }
    return listaCultos[0]?.id || 'culto-1';
  });

  const cultoAtivo = useMemo(() => {
    return listaCultos.find((c) => c.id === selectedCultoId) || listaCultos[0];
  }, [listaCultos, selectedCultoId]);

  const [activeTab, setActiveTab] = useState<TabType>('lar');

  const handleSelectCulto = (id: string) => {
    setSelectedCultoId(id);
    navigate(`/anfitriao/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F4EDE6]/50 pb-20 text-neutral-900 font-sans antialiased">
      {/* Topo Acolhedor com Identidade Visual */}
      <header className="sticky top-0 z-40 bg-[#1D4225] text-white shadow-md border-b border-[#D2A34C]/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Voltar ao Mapa Público"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D2A34C] block leading-none">
                Portal do Anfitrião
              </span>
              <h1 className="text-base sm:text-lg font-black leading-tight truncate">
                120 Cultos nos Lares
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/telao"
              target="_blank"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D2A34C] transition-colors"
              title="Ver Telão da Igreja"
            >
              <Tv className="w-4 h-4" />
            </Link>

            <Link
              to="/"
              className="px-2.5 py-1.5 rounded-xl bg-[#D2A34C] hover:bg-[#c49744] text-neutral-950 font-bold text-xs shadow-xs"
            >
              Mapa Geral
            </Link>
          </div>
        </div>

        {/* Barra de Identificação do Lar Selecionado */}
        <div className="bg-[#15311b] px-4 py-2 border-t border-white/10">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="w-4 h-4 text-[#D2A34C] shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] text-white/70 block truncate">
                  Setor {cultoAtivo?.setor} • {cultoAtivo?.bairro}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  Lar: {cultoAtivo?.anfitriao || 'Família'}
                </span>
              </div>
            </div>

            {/* Dropdown de Troca de Residência */}
            <div className="relative shrink-0">
              <select
                value={cultoAtivo?.id}
                onChange={(e) => handleSelectCulto(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Trocar Lar"
              >
                {listaCultos.map((c) => (
                  <option key={c.id} value={c.id}>
                    Setor {c.setor} - {c.anfitriao} ({c.bairro})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-semibold">
                <span>Trocar Residência</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D2A34C]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Abas Mobile-First */}
      <div className="sticky top-[95px] z-30 bg-white border-b border-neutral-200 shadow-xs">
        <div className="max-w-2xl mx-auto flex overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('lar')}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'lar'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Meu Lar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('convite')}
            className={`flex-1 min-w-[80px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'convite'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Convidar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 min-w-[80px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'checklist'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Preparação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frutos')}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'frutos'
                ? 'border-[#D2A34C] text-[#9A7428] bg-amber-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-500" />
            <span>Frutos</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {cultoAtivo ? (
          <>
            {activeTab === 'lar' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <AnfitriaoCard culto={cultoAtivo} />
                <ConviteVizinhoWhatsApp culto={cultoAtivo} />
              </div>
            )}

            {activeTab === 'convite' && (
              <div className="animate-in fade-in duration-150">
                <ConviteVizinhoWhatsApp culto={cultoAtivo} />
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="animate-in fade-in duration-150">
                <ChecklistPreparacao culto={cultoAtivo} />
              </div>
            )}

            {activeTab === 'frutos' && (
              <div className="animate-in fade-in duration-150">
                <MuralFrutosLar culto={cultoAtivo} />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center">
            <Home className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-600">
              Nenhuma residência selecionada.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
