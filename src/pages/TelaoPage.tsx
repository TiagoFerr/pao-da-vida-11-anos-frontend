import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCultosList } from '@/hooks/queries/useCultos';
import { useRelatorioDecisoes } from '@/hooks/queries/useDecisoes';
import { useFotosTelao } from '@/hooks/queries/useFotos';
import { useRealtimeStore } from '@/stores/useRealtimeStore';
import { playGloriousChime } from '@/lib/sound';
import { CultoMarker } from '@/types/culto';
import {
  Maximize,
  Minimize,
  ArrowLeft,
  Sparkles,
  Home,
  Users,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TelaoPageProps {
  cultosFallback: CultoMarker[];
}

export const TelaoPage: React.FC<TelaoPageProps> = ({ cultosFallback }) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [somHabilitado, setSomHabilitado] = useState(true);
  const [currentFotoIndex, setCurrentFotoIndex] = useState(0);
  const [horaAtual, setHoraAtual] = useState('');
  const [alertaDecisaoAtivo, setAlertaDecisaoAtivo] = useState<{
    nome?: string;
    bairro?: string;
    setor?: number;
    timestamp: string;
  } | null>(null);

  // Queries
  const { data: apiCultos } = useCultosList();
  const { data: relatorioDecisoes } = useRelatorioDecisoes();
  const { data: fotosResponse } = useFotosTelao({ somenteAprovadas: true });
  const { latestDecisaoEvent, clearLatestDecisao } = useRealtimeStore();

  const cultos: CultoMarker[] = React.useMemo(() => {
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
        horario: item.dataHora ? item.dataHora.slice(11, 16) : undefined,
        obs: item.observacoes || undefined,
        status: item.status,
      }));
    }
    return cultosFallback;
  }, [apiCultos, cultosFallback]);

  const totalLares = cultos.length;
  const metaGlobal = 120;
  const percentualMeta = Math.min(100, Math.round((totalLares / metaGlobal) * 100));

  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const totalDecisoes =
    relatorioDecisoes?.metricas.totalGeral ||
    cultos.reduce((acc, c) => acc + (c.pessoas ? Math.floor(c.pessoas.length * 0.25) : 0), 5);

  const fotos = fotosResponse?.dados || [];

  // Rotação automática de fotos a cada 6 segundos
  useEffect(() => {
    if (fotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFotoIndex((prev) => (prev + 1) % fotos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [fotos.length]);

  // Relógio em tempo real da celebração
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setHoraAtual(
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Escuta novas vidas para Cristo via SSE e dispara alerta sonoro/visual
  useEffect(() => {
    if (!latestDecisaoEvent) return;

    if (somHabilitado) {
      playGloriousChime();
    }

    setAlertaDecisaoAtivo({
      nome: latestDecisaoEvent.rawPayload?.nome || 'Nova Vida',
      bairro: latestDecisaoEvent.rawPayload?.bairro || 'Mossoró',
      setor: latestDecisaoEvent.setorNumero || undefined,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    const timer = setTimeout(() => {
      setAlertaDecisaoAtivo(null);
      clearLatestDecisao();
    }, 8500);

    return () => clearTimeout(timer);
  }, [latestDecisaoEvent, somHabilitado, clearLatestDecisao]);

  // Fullscreen toggle nativo
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const fotoAtual = fotos[currentFotoIndex];

  return (
    <div className="fixed inset-0 bg-[#080706] text-[#FEFEFE] flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Luz ambiente de fundo: verde e dourado em fusão sutil */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#1D4225]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D2A34C]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* BANNER FLUTUANTE DE NOVA VIDA PARA CRISTO (ALERTA CELESTIAL) */}
      {alertaDecisaoAtivo && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-gradient-to-r from-[#D2A34C] via-[#F4EDE6] to-[#D2A34C] text-[#080706] p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white/80 animate-bounce flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1D4225] text-white flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="w-8 h-8 text-[#D2A34C] animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest bg-[#080706] text-[#D2A34C] px-2.5 py-0.5 rounded-full">
                GLÓRIA A DEUS! UMA VIDA PARA CRISTO
              </span>
              <span className="text-xs font-mono font-bold text-[#080706]">
                {alertaDecisaoAtivo.timestamp}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-identidade mt-1 text-[#080706]">
              {alertaDecisaoAtivo.nome} entregou a vida a Jesus!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#1D4225]">
              Culto no Lar {alertaDecisaoAtivo.setor ? `• Setor ${alertaDecisaoAtivo.setor}` : ''} •{' '}
              {alertaDecisaoAtivo.bairro}
            </p>
          </div>
        </div>
      )}

      {/* TOPO: Cabeçalho Editorial & Ações de Operação */}
      <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-xs">
        {/* Identidade Editorial */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D4225] to-[#080706] border border-[#D2A34C]/60 flex items-center justify-center shadow-lg">
            <span className="text-xl font-black font-identidade text-[#D2A34C]">11</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.25em] font-semibold text-[#D2A34C] font-mono">
                // IGREJA PÃO DA VIDA • 11 ANOS
              </span>
              <span className="text-[10px] font-bold bg-[#1D4225] text-[#F4EDE6] px-2 py-0.5 rounded-full border border-white/10">
                19 DE NOVEMBRO DE 2026
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black font-identidade tracking-wide text-white mt-0.5">
              CRESCER <span className="text-[#D2A34C] font-serif italic">&</span> EDIFICAR
            </h1>
          </div>
        </div>

        {/* Relógio & Controles de Exibição */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white">
            <Clock className="w-4 h-4 text-[#D2A34C]" />
            <span className="font-mono text-base font-bold tracking-wider">{horaAtual}</span>
          </div>

          <button
            onClick={() => setSomHabilitado(!somHabilitado)}
            title={somHabilitado ? 'Desativar som do telão' : 'Ativar som do telão'}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            {somHabilitado ? <Volume2 className="w-5 h-5 text-[#D2A34C]" /> : <VolumeX className="w-5 h-5 text-white/40" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia (F11)'}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            title="Voltar ao Dashboard"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL: Split Screen Telão (Placar Gigante + Fotos Dinâmicas) */}
      <main className="relative z-10 flex-1 px-6 sm:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden">
        {/* COLUNA ESQUERDA (5 cols): Placar Gigante dos 120 Lares */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Card Principal: Meta dos 120 Lares */}
          <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/15 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#D2A34C] font-mono">
                // CONVOCAÇÃO DOS 120 LARES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-identidade text-white mt-1">
                Lares Alcançados
              </h2>

              <div className="flex items-baseline gap-3 my-6">
                <span className="text-6xl sm:text-7xl font-black font-serif text-[#D2A34C] tracking-tight">
                  {totalLares}
                </span>
                <span className="text-2xl sm:text-3xl text-white/50 font-mono font-bold">
                  / {metaGlobal}
                </span>
              </div>
            </div>

            {/* Barra de Progresso Dourada Luminosa */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold text-[#D2A34C]">
                <span>PROGRESSO EM MOSSORÓ</span>
                <span>{percentualMeta}% CONCLUÍDO</span>
              </div>
              <div className="w-full h-4 bg-white/10 rounded-full p-0.5 overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-[#1D4225] via-[#D2A34C] to-[#F4EDE6] rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${percentualMeta}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dupla de Métricas Gigantes: Vidas para Cristo + Pessoas Reunidas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vidas para Cristo */}
            <div className="bg-gradient-to-br from-[#D2A34C]/25 to-black/60 border-2 border-[#D2A34C]/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-[#D2A34C]">
                <span className="text-xs uppercase tracking-wider font-bold">Vidas para Cristo</span>
                <Sparkles className="w-5 h-5 animate-pulse text-[#D2A34C]" />
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black font-serif text-white">
                  {totalDecisoes}
                </span>
              </div>
              <p className="text-[11px] text-[#F4EDE6]/80 font-medium">
                Salvação, reconciliação e batismo
              </p>
            </div>

            {/* Pessoas nos Lares */}
            <div className="bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between text-white/80">
                <span className="text-xs uppercase tracking-wider font-bold">Pessoas nos Lares</span>
                <Users className="w-5 h-5 text-[#1D4225]" />
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black font-serif text-white">
                  {totalPessoas}
                </span>
              </div>
              <p className="text-[11px] text-white/60 font-medium">
                Irmãos e convidados reunidos
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (7 cols): Galeria de Fotos dos Cultos em Fullscreen com Legenda */}
        <div className="lg:col-span-7 flex flex-col bg-white/[0.04] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative">
          {fotoAtual ? (
            <div className="relative w-full h-full flex flex-col">
              <div className="relative flex-1 w-full overflow-hidden bg-black/60 flex items-center justify-center">
                <img
                  src={fotoAtual.urlPublica}
                  alt={fotoAtual.legenda || 'Culto no lar'}
                  className="w-full h-full object-cover animate-fade-in transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                {/* Badge do Setor na foto */}
                {fotoAtual.culto?.setorNumero && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D2A34C]/40 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D2A34C] animate-ping" />
                    <span className="text-xs font-bold font-mono text-white">
                      SETOR {fotoAtual.culto.setorNumero} • {fotoAtual.culto.bairro}
                    </span>
                  </div>
                )}

                {/* Contador de slides */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-white/70">
                  {currentFotoIndex + 1} / {fotos.length}
                </div>
              </div>

              {/* Legenda de Rodapé da Foto */}
              <div className="p-5 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-white line-clamp-2">
                    "{fotoAtual.legenda || 'Reunião de comunhão e oração no lar.'}"
                  </p>
                  <p className="text-xs text-[#D2A34C] font-mono mt-1">
                    Líder: {fotoAtual.culto?.liderNome || 'Igreja Pão da Vida'}
                  </p>
                </div>

                {/* Indicadores de bolinhas */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {fotos.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentFotoIndex ? 'w-6 bg-[#D2A34C]' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/60 space-y-4">
              <Home className="w-16 h-16 text-[#D2A34C]/50 animate-pulse" />
              <h3 className="text-xl font-bold font-identidade text-white">
                120 Cultos nos Lares acontecendo em Mossoró
              </h3>
              <p className="text-xs max-w-md text-white/60">
                As fotos enviadas pelos líderes e anfitriões dos lares aparecerão automaticamente aqui após aprovação da curadoria pastoral.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* RODAPÉ MONUMENTAL: Versículo Bíblico de Efésios 4:16 */}
      <footer className="relative z-10 px-6 sm:px-10 py-4 border-t border-white/10 bg-black/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-xs sm:text-sm font-serif italic text-[#F4EDE6]/90 max-w-3xl">
          "De quem todo o corpo, bem ajustado e ligado pelo auxílio de todas as juntas, segundo a justa operação de cada parte, efetua o seu próprio aumento para a edificação de si mesmo em amor."
          <span className="text-[#D2A34C] font-sans font-bold not-italic ml-2">— Efésios 4:16</span>
        </p>

        <span className="text-[11px] font-mono tracking-widest text-[#D2A34C] uppercase font-bold">
          PAO DA VIDA • 11 ANOS
        </span>
      </footer>
    </div>
  );
};
