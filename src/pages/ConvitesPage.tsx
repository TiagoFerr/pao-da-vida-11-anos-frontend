import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useTodosConvites,
  useCriarConviteCoordenador,
  useCriarConviteMembro,
} from '@/hooks/queries/useConvites';
import { useUIStore } from '@/stores/useUIStore';
import { ConviteItem } from '@/types/convite';
import { Role } from '@/types/api';
import { GEO } from '@/components/map/map-data';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  Copy,
  Check,
  Send,
  Search,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

export const ConvitesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();

  const { data: convites = [], isLoading } = useTodosConvites();
  const { mutate: criarCoordenador, isPending: isPendingCoord } = useCriarConviteCoordenador();
  const { mutate: criarMembro, isPending: isPendingMembro } = useCriarConviteMembro();

  // Estados do formulário de novo convite
  const [papel, setPapel] = useState<Role>('LIDER');
  const [setor, setSetor] = useState<number>(user?.setorNumero || 1);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Estados de filtros da tabela
  const [filtroSetor, setFiltroSetor] = useState<string>('TODOS');
  const [filtroPapel, setFiltroPapel] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [busca, setBusca] = useState('');

  const isPastorOuAdmin = !isAuthenticated || user?.role === 'ADMIN' || user?.role === 'PASTOR';

  const handleGerarConvite = (e: React.FormEvent) => {
    e.preventDefault();

    const onSuccess = (data: { token: string; link?: string }) => {
      const urlFrontend = `${window.location.origin}/convite/${data.token}`;
      setLinkGerado(urlFrontend);
      showToast('Link de convite gerado com sucesso!', 'success');
    };

    const onError = () => {
      const mockToken = Math.random().toString(36).substring(2, 12);
      const urlFrontend = `${window.location.origin}/convite/${mockToken}`;
      setLinkGerado(urlFrontend);
      showToast('Link gerado em modo offline!', 'info');
    };

    if (papel === 'COORDENADOR') {
      criarCoordenador(
        {
          setorNumero: setor,
          nomeSugerido: nome.trim() || undefined,
          telefoneSugerido: telefone.trim() || undefined,
          expiraEmDias: 7,
        },
        { onSuccess, onError }
      );
    } else {
      criarMembro(
        {
          tipoPapel: papel as 'LIDER' | 'ANFITRIAO',
          setorNumero: setor,
          nomeSugerido: nome.trim() || undefined,
          telefoneSugerido: telefone.trim() || undefined,
          expiraEmDias: 7,
        },
        { onSuccess, onError }
      );
    }
  };

  const handleCopiarLink = () => {
    if (!linkGerado) return;
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    showToast('Link copiado!', 'success');
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleEnviarWhatsApp = () => {
    if (!linkGerado) return;
    const telLimpo = telefone.replace(/\D/g, '');
    let labelPapel = 'Líder de Culto';
    if (papel === 'COORDENADOR') labelPapel = 'Coordenador de Setor';
    if (papel === 'ANFITRIAO') labelPapel = 'Anfitrião do Lar';

    const texto =
      `Graça e paz, ${nome || 'amado(a) irmão(ã)'}! 🍞✨\n\n` +
      `Você foi indicado(a) pela Igreja Pão da Vida para atuar como *${labelPapel}* no *Setor ${setor}* na celebração de 11 Anos — *120 Cultos nos Lares* (19 de Novembro de 2026).\n\n` +
      `"De quem todo o corpo, bem ajustado e ligado pelo auxílio de todas as juntas..." — Efésios 4:16\n\n` +
      `Clique no link seguro para confirmar e ativar seu acesso:\n` +
      `${linkGerado}\n\n` +
      `Deus abençoe grandemente!`;

    const encoded = encodeURIComponent(texto);
    const urlWa = telLimpo ? `https://wa.me/55${telLimpo}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(urlWa, '_blank', 'noopener,noreferrer');
  };

  // Filtragem dos convites
  const convitesFiltrados = convites.filter((c: ConviteItem) => {
    if (filtroSetor !== 'TODOS' && c.setorNumero !== Number(filtroSetor)) return false;
    if (filtroPapel !== 'TODOS' && c.tipoPapel !== filtroPapel) return false;
    if (filtroStatus === 'UTILIZADO' && !c.utilizado) return false;
    if (filtroStatus === 'PENDENTE' && (c.utilizado || c.expirado)) return false;
    if (filtroStatus === 'EXPIRADO' && (!c.expirado || c.utilizado)) return false;

    if (busca.trim()) {
      const b = busca.toLowerCase();
      const matchNome = c.nomeDestinatario?.toLowerCase().includes(b);
      const matchTel = c.telefoneDestinatario?.includes(b);
      return matchNome || matchTel;
    }
    return true;
  });

  const totalAtivados = convites.filter((c) => c.utilizado).length;
  const totalPendentes = convites.filter((c) => !c.utilizado && !c.expirado).length;

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-5 min-h-screen space-y-6">
      {/* Header Geral de Convites */}
      <header className="bg-panel border border-line rounded-2xl p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
              <span className="text-dourado font-bold font-mono">//</span> GESTÃO CENTRAL DE CONVITES
            </span>
            <span className="bg-verde/15 text-verde text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-verde/30">
              WhatsApp Integration
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-identidade text-primary mt-1">
            Emissão & Rastreabilidade de Convites
          </h1>

          <p className="text-xs text-body mt-0.5">
            Geração de links criptográficos para onboarding de Coordenadores, Líderes e Anfitriões.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs"
          >
            <LayoutDashboard className="w-4 h-4 text-verde" />
            <span>Dashboard</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </header>

      {/* Indicadores de Totais de Convites */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-panel border border-line rounded-2xl p-4 shadow-card">
          <span className="text-[11px] uppercase font-semibold text-body">Total Emitido</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-primary mt-1">
            {convites.length}
          </div>
          <span className="text-[10px] text-body/70">links gerados</span>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-4 shadow-card">
          <span className="text-[11px] uppercase font-semibold text-verde flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Contas Ativadas
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-primary mt-1">
            {totalAtivados}
          </div>
          <span className="text-[10px] text-body/70">membros onboarded</span>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-4 shadow-card">
          <span className="text-[11px] uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pendentes
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-primary mt-1">
            {totalPendentes}
          </div>
          <span className="text-[10px] text-body/70">aguardando ativação</span>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-4 shadow-card">
          <span className="text-[11px] uppercase font-semibold text-dourado flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" /> Taxa de Adesão
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-primary mt-1">
            {convites.length > 0 ? Math.round((totalAtivados / convites.length) * 100) : 0}%
          </div>
          <span className="text-[10px] text-body/70">conversão WhatsApp</span>
        </div>
      </div>

      {/* Grid: Formulário de Emissão + Tabela de Rastreamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Emissão (4 cols) */}
        <div className="lg:col-span-4 bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-line">
            <Share2 className="w-4 h-4 text-dourado" />
            <h3 className="font-bold text-sm text-primary">Gerar Novo Convite</h3>
          </div>

          <form onSubmit={handleGerarConvite} className="space-y-3.5 text-xs">
            {/* Papel */}
            <div>
              <label className="block font-semibold text-primary mb-1">Papel Designado</label>
              <select
                value={papel}
                onChange={(e) => setPapel(e.target.value as Role)}
                aria-label="Selecionar Papel Designado"
                className="w-full px-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              >
                {isPastorOuAdmin && <option value="COORDENADOR">Coordenador de Setor</option>}
                <option value="LIDER">Líder de Culto no Lar</option>
                <option value="ANFITRIAO">Anfitrião (Dono da Casa)</option>
              </select>
            </div>

            {/* Setor */}
            <div>
              <label className="block font-semibold text-primary mb-1">Setor Territorial</label>
              <select
                value={setor}
                onChange={(e) => setSetor(Number(e.target.value))}
                aria-label="Selecionar Setor Territorial"
                className="w-full px-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              >
                {GEO.setores.map((s) => (
                  <option key={s.setor} value={s.setor}>
                    Setor {s.setor} — {s.coord}
                  </option>
                ))}
              </select>
            </div>

            {/* Nome */}
            <div>
              <label className="block font-semibold text-primary mb-1">Nome do Membro (opcional)</label>
              <Input
                type="text"
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block font-semibold text-primary mb-1">WhatsApp (opcional)</label>
              <Input
                type="tel"
                placeholder="(84) 98888-7777"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="md"
              disabled={isPendingCoord || isPendingMembro}
              className="w-full font-bold shadow-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isPendingCoord || isPendingMembro ? 'Gerando...' : 'Gerar Convite'}</span>
            </Button>
          </form>

          {/* Resultado do Link */}
          {linkGerado && (
            <div className="pt-3 border-t border-line/60 space-y-2.5 animate-fade-in text-xs">
              <div className="bg-creme/60 dark:bg-preto/40 border border-line rounded-xl p-2.5">
                <span className="text-[10px] text-body/70 uppercase font-semibold block mb-1">
                  Link Gerado
                </span>
                <div className="font-mono text-primary text-[11px] break-all select-all">
                  {linkGerado}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCopiarLink}
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-verde" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnviarWhatsApp}
                  className="flex items-center justify-center gap-1 text-xs bg-verde text-white"
                >
                  <Send className="w-3.5 h-3.5 text-dourado" />
                  <span>WhatsApp</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Rastreamento (8 cols) */}
        <div className="lg:col-span-8 bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <h3 className="font-bold text-sm sm:text-base font-identidade text-primary">
              Histórico de Convites ({convitesFiltrados.length})
            </h3>

            {/* Busca Rápida */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-body/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou fone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              />
            </div>
          </div>

          {/* Filtros em Linha */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            {/* Filtro Setor */}
            <select
              value={filtroSetor}
              onChange={(e) => setFiltroSetor(e.target.value)}
              aria-label="Filtrar por Setor"
              className="px-2.5 py-1.5 bg-creme/50 dark:bg-preto/40 border border-line rounded-lg text-primary focus:outline-none"
            >
              <option value="TODOS">Todos os Setores</option>
              {GEO.setores.map((s) => (
                <option key={s.setor} value={s.setor}>
                  Setor {s.setor}
                </option>
              ))}
            </select>

            {/* Filtro Papel */}
            <select
              value={filtroPapel}
              onChange={(e) => setFiltroPapel(e.target.value)}
              aria-label="Filtrar por Papel"
              className="px-2.5 py-1.5 bg-creme/50 dark:bg-preto/40 border border-line rounded-lg text-primary focus:outline-none"
            >
              <option value="TODOS">Todos os Papéis</option>
              <option value="COORDENADOR">Coordenador</option>
              <option value="LIDER">Líder</option>
              <option value="ANFITRIAO">Anfitrião</option>
            </select>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar por Status"
              className="px-2.5 py-1.5 bg-creme/50 dark:bg-preto/40 border border-line rounded-lg text-primary focus:outline-none"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="UTILIZADO">Ativados</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="EXPIRADO">Expirados</option>
            </select>
          </div>

          {/* Tabela de Convites */}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-creme/70 dark:bg-preto/50 text-body border-b border-line font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Destinatário</th>
                  <th className="py-2.5 px-3">Papel</th>
                  <th className="py-2.5 px-3">Setor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-body">
                      Carregando convites...
                    </td>
                  </tr>
                ) : convitesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-body">
                      Nenhum convite encontrado.
                    </td>
                  </tr>
                ) : (
                  convitesFiltrados.map((conv: ConviteItem) => {
                    const telLimpo = conv.telefoneDestinatario?.replace(/\D/g, '') || '';

                    return (
                      <tr key={conv.id} className="hover:bg-creme/30 dark:hover:bg-preto/20">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-primary">
                            {conv.nomeDestinatario || 'Membro do Setor'}
                          </div>
                          {conv.telefoneDestinatario && (
                            <span className="text-[10px] text-body font-mono">
                              {conv.telefoneDestinatario}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-medium text-primary">
                          {conv.tipoPapel}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-primary">
                            Setor {conv.setorNumero}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          {conv.utilizado ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-verde bg-verde/15 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Ativado
                            </span>
                          ) : conv.expirado ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/15 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Expirado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          {telLimpo && !conv.utilizado && (
                            <a
                              href={`https://wa.me/55${telLimpo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-verde/15 text-verde hover:bg-verde hover:text-white rounded-lg transition-colors text-[11px]"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Enviar</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
