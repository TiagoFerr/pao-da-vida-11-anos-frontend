import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCultosList } from '@/hooks/queries/useCultos';
import { useDecisoesCulto } from '@/hooks/queries/useDecisoes';
import { usePresencasCulto } from '@/hooks/queries/usePresencas';
import { useFotosCulto } from '@/hooks/queries/useFotos';
import { CultoStatusBar } from '@/components/lider/CultoStatusBar';
import { CheckInRapido } from '@/components/lider/CheckInRapido';
import { RegistroDecisaoModal } from '@/components/lider/RegistroDecisaoModal';
import { FotoUpload } from '@/components/lider/FotoUpload';
import { EncerramentoRelatorio } from '@/components/lider/EncerramentoRelatorio';
import { CultoMarker } from '@/types/culto';
import { StatusCulto } from '@/types/api';
import {
  Home,
  Users,
  Heart,
  Camera,
  ClipboardCheck,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Share2,
  Tv,
} from 'lucide-react';

interface LiderAppProps {
  cultosFallback?: CultoMarker[];
}

type TabMode = 'geral' | 'presencas' | 'decisoes' | 'fotos' | 'encerramento';

export const LiderApp: React.FC<LiderAppProps> = ({ cultosFallback = [] }) => {
  const { cultoId: paramCultoId } = useParams<{ cultoId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: apiCultos } = useCultosList();

  // Lista unificada de cultos
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

  // Identifica o culto ativo:
  // 1. Pelo ID na rota `/lider/:cultoId`
  // 2. Ou pelo líder com mesmo nome/email do usuário logado
  // 3. Ou o primeiro da lista
  const [selectedCultoId, setSelectedCultoId] = useState<string>(() => {
    if (paramCultoId) return paramCultoId;
    if (user?.nome) {
      const match = listaCultos.find(
        (c) => c.lider?.toLowerCase().includes(user.nome?.toLowerCase() || '')
      );
      if (match) return match.id;
    }
    return listaCultos[0]?.id || 'culto-1';
  });

  const cultoAtivo = useMemo(() => {
    return listaCultos.find((c) => c.id === selectedCultoId) || listaCultos[0];
  }, [listaCultos, selectedCultoId]);

  const [activeTab, setActiveTab] = useState<TabMode>('geral');
  const [isDecisaoModalOpen, setIsDecisaoModalOpen] = useState(false);
  const [decisaoPreFill, setDecisaoPreFill] = useState<{
    nome: string;
    telefone?: string;
    presencaId?: string;
  }>({ nome: '' });

  // Consultas de dados do culto ativo
  const { data: resumoPresencas } = usePresencasCulto(cultoAtivo?.id);
  const { data: decisoesCulto } = useDecisoesCulto(cultoAtivo?.id);
  const { data: fotosCulto } = useFotosCulto(cultoAtivo?.id);

  const handleSelectCulto = (id: string) => {
    setSelectedCultoId(id);
    navigate(`/lider/${id}`);
  };

  const handleOpenDecisaoModal = (nome?: string, telefone?: string, presencaId?: string) => {
    setDecisaoPreFill({
      nome: nome || '',
      telefone: telefone || '',
      presencaId,
    });
    setIsDecisaoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4EDE6]/50 pb-24 text-neutral-900 font-sans antialiased">
      {/* Barra Superior Mobile-First */}
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

            <img
              src="/logo-principal-transparente.png"
              alt="Logo Pão da Vida"
              className="h-8 sm:h-9 w-auto object-contain"
            />

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D2A34C] block leading-none">
                App do Líder de Culto
              </span>
              <h1 className="text-base sm:text-lg font-black leading-tight truncate">
                120 Cultos nos Lares
              </h1>
            </div>
          </div>

          {/* Atalhos Rápidos para Telão & Dashboard */}
          <div className="flex items-center gap-1.5">
            <Link
              to={cultoAtivo ? `/anfitriao/${cultoAtivo.id}` : '/anfitriao'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D2A34C] transition-colors"
              title="Portal do Anfitrião / Meu Lar"
            >
              <Home className="w-4 h-4" />
            </Link>
            <Link
              to="/telao"
              target="_blank"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D2A34C] transition-colors"
              title="Abrir Telão da Igreja"
            >
              <Tv className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-2.5 py-1.5 rounded-xl bg-[#D2A34C] hover:bg-[#c49744] text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <span className="hidden sm:inline">Painel</span>
              <span>Pastoral</span>
            </Link>
          </div>
        </div>

        {/* Seletor do Culto / Lar no Topo */}
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

            {/* Dropdown de Seleção de Culto */}
            <div className="relative shrink-0">
              <select
                value={cultoAtivo?.id}
                onChange={(e) => handleSelectCulto(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Mudar Culto no Lar"
              >
                {listaCultos.map((c) => (
                  <option key={c.id} value={c.id}>
                    Setor {c.setor} - {c.bairro} ({c.anfitriao})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-semibold">
                <span>Trocar Lar</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D2A34C]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Abas Táteis Mobile */}
      <div className="sticky top-[95px] z-30 bg-white border-b border-neutral-200 shadow-xs">
        <div className="max-w-2xl mx-auto flex overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'geral'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presencas')}
            className={`flex-1 min-w-[80px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 relative ${
              activeTab === 'presencas'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Presenças ({resumoPresencas?.totalPresentes || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('decisoes')}
            className={`flex-1 min-w-[80px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 relative ${
              activeTab === 'decisoes'
                ? 'border-[#D2A34C] text-[#9A7428] bg-amber-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-500" />
            <span>Vidas ({decisoesCulto?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'fotos'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Fotos ({fotosCulto?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('encerramento')}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer flex flex-col items-center gap-1 ${
              activeTab === 'encerramento'
                ? 'border-[#1D4225] text-[#1D4225] bg-emerald-50/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Fechamento</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* ABA 1: VISÃO GERAL & STATUS */}
        {activeTab === 'geral' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Barra de Status e Ação Rápida */}
            {cultoAtivo && (
              <CultoStatusBar
                cultoId={cultoAtivo.id}
                statusAtual={(cultoAtivo.status as StatusCulto) || 'CONFIRMADO'}
                onStatusChanged={(s) => {
                  cultoAtivo.status = s;
                }}
              />
            )}

            {/* Cartão de Detalhes do Lar */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  Dados do Culto no Lar
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#1D4225]/10 text-[#1D4225]">
                  Setor {cultoAtivo?.setor}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#1D4225] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800">
                      {cultoAtivo?.rua}
                      {cultoAtivo?.numero ? `, ${cultoAtivo.numero}` : ''}
                    </span>
                    <span className="text-xs text-neutral-500 block">
                      Bairro: {cultoAtivo?.bairro}
                    </span>
                    {cultoAtivo?.referencia && (
                      <span className="text-xs text-neutral-400 block mt-0.5">
                        Ref: {cultoAtivo.referencia}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#D2A34C] shrink-0" />
                  <span className="text-neutral-700">
                    Horário de Início:{' '}
                    <strong>{cultoAtivo?.horario || '19:30'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-neutral-700">
                    Líder Responsável:{' '}
                    <strong>{cultoAtivo?.lider || 'Não informado'}</strong>
                  </span>
                </div>

                {cultoAtivo?.anfTel && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a
                      href={`https://wa.me/55${cultoAtivo.anfTel.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      Falar com Anfitrião no WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Ações Rápidas em Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('presencas')}
                className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-[#1D4225]/40 text-left transition-all shadow-xs cursor-pointer group"
              >
                <Users className="w-5 h-5 text-[#1D4225] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Check-in
                </span>
                <span className="text-sm font-bold text-neutral-900 block mt-0.5">
                  Fazer Presença ({resumoPresencas?.totalPresentes || 0})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDecisaoModal()}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#D2A34C]/10 to-[#D2A34C]/25 border border-[#D2A34C]/40 text-left transition-all shadow-xs cursor-pointer group"
              >
                <Heart className="w-5 h-5 text-rose-500 fill-current mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7428] block">
                  Céus Abertos
                </span>
                <span className="text-sm font-black text-neutral-900 block mt-0.5">
                  + Nova Decisão / Vida
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fotos')}
                className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-[#1D4225]/40 text-left transition-all shadow-xs cursor-pointer group"
              >
                <Camera className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Mídia & Telão
                </span>
                <span className="text-sm font-bold text-neutral-900 block mt-0.5">
                  Tirar Foto ({fotosCulto?.length || 0})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('encerramento')}
                className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-[#1D4225]/40 text-left transition-all shadow-xs cursor-pointer group"
              >
                <ClipboardCheck className="w-5 h-5 text-[#1D4225] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Finalizar
                </span>
                <span className="text-sm font-bold text-neutral-900 block mt-0.5">
                  Relatório do Lar
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: CHECK-IN DE PRESENÇAS */}
        {activeTab === 'presencas' && cultoAtivo && (
          <div className="animate-in fade-in duration-150">
            <CheckInRapido
              cultoId={cultoAtivo.id}
              onRegistrarDecisao={(nome, tel, pId) =>
                handleOpenDecisaoModal(nome, tel, pId)
              }
            />
          </div>
        )}

        {/* ABA 3: VIDAS PARA CRISTO */}
        {activeTab === 'decisoes' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Decisões Espirituais do Lar
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Vidas salvas, reconciliações e clamores de oração
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDecisaoModal()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D2A34C] to-[#b88c3a] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#D2A34C]/25 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                + Nova Decisão
              </button>
            </div>

            {/* Lista de Decisões */}
            {!decisoesCulto || decisoesCulto.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center">
                <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-neutral-700">
                  Nenhuma decisão registrada ainda
                </h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Quando alguém aceitar Jesus, se reconciliar ou pedir oração no momento
                  da mensagem, registre aqui para o ministério pastoral acompanhar.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenDecisaoModal()}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-[#1D4225] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D2A34C]" />
                  Registrar Primeira Decisão
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {decisoesCulto.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900">
                          {item.nomeDecidido}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            item.tipoDecisao === 'ACEITOU_JESUS'
                              ? 'bg-[#D2A34C]/20 text-[#85611e]'
                              : item.tipoDecisao === 'RECONCILIACAO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {item.tipoDecisao.replace('_', ' ')}
                        </span>
                      </div>

                      {item.telefone && (
                        <span className="text-xs text-neutral-500 block">
                          WhatsApp: {item.telefone}
                        </span>
                      )}

                      {item.pedidoOracaoDetalhe && (
                        <p className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded-lg mt-1 italic">
                          "{item.pedidoOracaoDetalhe}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 4: UPLOAD DE FOTOS NO MINIO S3 */}
        {activeTab === 'fotos' && cultoAtivo && (
          <div className="animate-in fade-in duration-150">
            <FotoUpload cultoId={cultoAtivo.id} />
          </div>
        )}

        {/* ABA 5: FECHAMENTO & RELATÓRIO */}
        {activeTab === 'encerramento' && cultoAtivo && (
          <div className="animate-in fade-in duration-150">
            <EncerramentoRelatorio
              cultoId={cultoAtivo.id}
              statusAtual={(cultoAtivo.status as StatusCulto) || 'EM_ANDAMENTO'}
              liderNome={cultoAtivo.lider}
              anfitriaoNome={cultoAtivo.anfitriao}
              bairro={cultoAtivo.bairro}
              setorNumero={cultoAtivo.setor}
              onStatusChanged={(s) => {
                cultoAtivo.status = s;
              }}
            />
          </div>
        )}
      </main>

      {/* Modal de Registro de Decisão */}
      {cultoAtivo && (
        <RegistroDecisaoModal
          isOpen={isDecisaoModalOpen}
          onClose={() => setIsDecisaoModalOpen(false)}
          cultoId={cultoAtivo.id}
          initialNome={decisaoPreFill.nome}
          initialTelefone={decisaoPreFill.telefone}
          initialPresencaId={decisaoPreFill.presencaId}
        />
      )}
    </div>
  );
};
