import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCultosList } from '@/hooks/queries/useCultos';
import { useRelatorioDecisoes } from '@/hooks/queries/useDecisoes';
import { useUIStore } from '@/stores/useUIStore';
import { exportCultosToCSV } from '@/lib/exportCsv';
import { CultoMarker } from '@/types/culto';
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard';
import { SetoresProgressGrid } from '@/components/dashboard/SetoresProgressGrid';
import { RealtimeEventFeed } from '@/components/dashboard/RealtimeEventFeed';
import { DecisoesEspirituaisTable } from '@/components/dashboard/DecisoesEspirituaisTable';
import { FotoTelaoCurator } from '@/components/dashboard/FotoTelaoCurator';
import { CultoFormModal } from '@/components/culto/CultoFormModal';
import { ConviteModal } from '@/components/auth/ConviteModal';
import { Button } from '@/components/ui/Button';
import {
  Map,
  PlusCircle,
  FileSpreadsheet,
  Tv,
  Share2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  cultosFallback: CultoMarker[];
  onCultoSaved?: (culto: CultoMarker) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cultosFallback,
  onCultoSaved,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showToast } = useUIStore();

  const [isCultoModalOpen, setIsCultoModalOpen] = useState(false);
  const [isConviteModalOpen, setIsConviteModalOpen] = useState(false);
  const [selectedSetorFilter, setSelectedSetorFilter] = useState<number | undefined>(undefined);

  // Consultas de dados
  const { data: apiCultos } = useCultosList();
  const { data: relatorioDecisoes, isLoading: isLoadingDecisoes } = useRelatorioDecisoes({
    setorNumero: selectedSetorFilter,
  });

  // Mapeia cultos
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

  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const decisoes = relatorioDecisoes?.dados || [];
  const totalDecisoes = relatorioDecisoes?.metricas.totalGeral || decisoes.length;

  const handleExportarCsv = () => {
    exportCultosToCSV(cultos);
    showToast('Planilha CSV dos cultos exportada com sucesso!', 'success');
  };

  const isPastorOuAdmin =
    !isAuthenticated || user?.role === 'ADMIN' || user?.role === 'PASTOR';

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-5 min-h-screen space-y-6">
      {/* Header do Dashboard Pastoral */}
      <header className="bg-panel border border-line rounded-2xl p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
              <span className="text-dourado font-bold font-mono">//</span> PAINEL EXECUTIVO PASTORAL
            </span>
            <span className="bg-verde/15 text-verde text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-verde/30">
              11 Anos
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-identidade text-primary mt-1">
            Gestão Estratégica dos 120 Cultos nos Lares
          </h1>

          <p className="text-xs text-body mt-0.5 font-serif italic text-body/80">
            "De quem todo o corpo, bem ajustado e ligado pelo auxílio de todas as juntas..." — Efésios 4:16
          </p>
        </div>

        {/* Barra de Ações Rápidas Executivas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5"
          >
            <Map className="w-4 h-4 text-verde" />
            <span>Ver no Mapa</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsCultoModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Culto</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/coordenador')}
            className="flex items-center gap-1.5"
          >
            <span>Coordenação</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/convites')}
            className="flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-dourado" />
            <span>Central Convites</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportarCsv}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-verde" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/telao')}
            className="flex items-center gap-1.5 bg-verde text-white"
          >
            <Tv className="w-4 h-4 text-dourado" />
            <span>Modo Telão</span>
          </Button>

          {isAuthenticated && (
            <button
              onClick={() => logout()}
              title="Sair da conta"
              className="p-2 text-body hover:text-rose-500 rounded-lg hover:bg-line/40 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Aviso caso não seja perfil admin/pastor */}
      {!isPastorOuAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>
            Atenção: Você está visualizando o Dashboard com privilégios limitados de {user?.role}. Algumas ações exigem perfil de Administrador ou Pastor.
          </span>
        </div>
      )}

      {/* Placar Executivo Consolidado dos 120 Lares */}
      <ExecutiveSummaryCard
        totalCultos={cultos.length}
        metaGlobal={120}
        totalPessoas={totalPessoas}
        totalDecisoes={totalDecisoes}
      />

      {/* Layout em Grid: Setores + Feed SSE em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Distribuição dos 14 Setores */}
          <SetoresProgressGrid
            cultos={cultos}
            decisoes={decisoes}
            onSelectSetor={(num) => {
              setSelectedSetorFilter((prev) => (prev === num ? undefined : num));
              showToast(
                selectedSetorFilter === num
                  ? 'Filtro de setor limpo'
                  : `Filtrando decisões do Setor ${num}`,
                'info'
              );
            }}
          />

          {/* Curadoria de Fotos para o Modo Telão */}
          <FotoTelaoCurator onOpenTelao={() => navigate('/telao')} />
        </div>

        {/* Coluna Lateral: Feed SSE em Tempo Real */}
        <div className="lg:col-span-1">
          <RealtimeEventFeed />
        </div>
      </div>

      {/* Tabela de Decisões Espirituais & Consolidação Pastoral */}
      <DecisoesEspirituaisTable
        decisoes={decisoes}
        isLoading={isLoadingDecisoes}
      />

      {/* Modais de Ação */}
      <CultoFormModal
        isOpen={isCultoModalOpen}
        onClose={() => setIsCultoModalOpen(false)}
        existingCultos={cultos}
        onSaved={(c) => {
          onCultoSaved?.(c);
          showToast('Culto salvo com sucesso!', 'success');
        }}
      />

      <ConviteModal
        isOpen={isConviteModalOpen}
        onClose={() => setIsConviteModalOpen(false)}
      />
    </div>
  );
};
