import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCultosList } from '@/hooks/queries/useCultos';
import { useRelatorioDecisoes } from '@/hooks/queries/useDecisoes';
import { useConvitesSetor } from '@/hooks/queries/useConvites';
import { useUIStore } from '@/stores/useUIStore';
import { CultoMarker } from '@/types/culto';
import { SetorMetasCard } from '@/components/coordenador/SetorMetasCard';
import { PendenciasAlerta } from '@/components/coordenador/PendenciasAlerta';
import { SetorCultosList } from '@/components/coordenador/SetorCultosList';
import { GeradorConviteWhatsApp } from '@/components/coordenador/GeradorConviteWhatsApp';
import { ConvitesSetorTable } from '@/components/coordenador/ConvitesSetorTable';
import { CultoFormModal } from '@/components/culto/CultoFormModal';
import { GEO } from '@/components/map/map-data';
import { Button } from '@/components/ui/Button';
import {
  Map,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Smartphone,
} from 'lucide-react';

interface CoordenadorPanelProps {
  cultosFallback: CultoMarker[];
  onCultoSaved?: (culto: CultoMarker) => void;
}

export const CoordenadorPanel: React.FC<CoordenadorPanelProps> = ({
  cultosFallback,
  onCultoSaved,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showToast } = useUIStore();

  // Setor inicial: se o coordenador tem setorNumero, usa o dele. Se não (ou se for Pastor/Admin), padrão para Setor 1 ou o atribuído.
  const initialSetor = user?.setorNumero || 1;
  const [setorSelecionado, setSetorSelecionado] = useState<number>(initialSetor);

  const [isCultoModalOpen, setIsCultoModalOpen] = useState(false);
  const [cultoParaEditar, setCultoParaEditar] = useState<CultoMarker | null>(null);

  // Queries
  const { data: apiCultos } = useCultosList({ setor: setorSelecionado });
  const { data: relatorioDecisoes } = useRelatorioDecisoes({ setorNumero: setorSelecionado });
  const { data: convites, isLoading: isLoadingConvites } = useConvitesSetor(setorSelecionado);

  const cultos: CultoMarker[] = useMemo(() => {
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

  const decisoes = relatorioDecisoes?.dados || [];

  const handleEditCulto = (culto: CultoMarker) => {
    setCultoParaEditar(culto);
    setIsCultoModalOpen(true);
  };

  const handleOpenCreateCulto = () => {
    setCultoParaEditar(null);
    setIsCultoModalOpen(true);
  };

  const isPastorado = user?.role === 'ADMIN' || user?.role === 'PASTOR';

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-5 min-h-screen space-y-6">
      {/* Header do Painel do Coordenador */}
      <header className="bg-panel border border-line rounded-2xl p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
              <span className="text-dourado font-bold font-mono">//</span> COORDENAÇÃO REGIONAL DE SETOR
            </span>
            <span className="bg-verde/15 text-verde text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-verde/30">
              11 Anos
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-identidade text-primary mt-1">
            Painel Territorial do Setor {setorSelecionado}
          </h1>

          <p className="text-xs text-body mt-0.5">
            Supervisão eclesiástica dos lares, lideranças e convites de Mossoró.
          </p>
        </div>

        {/* Seletor de Setor (Habilitado para Pastores ou Admins) & Ações */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isPastorado && (
            <div className="relative">
              <select
                value={setorSelecionado}
                onChange={(e) => setSetorSelecionado(Number(e.target.value))}
                aria-label="Selecionar Setor Pastoral"
                className="appearance-none bg-creme dark:bg-preto/40 border border-line rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-dourado cursor-pointer"
              >
                {GEO.setores.map((s) => (
                  <option key={s.setor} value={s.setor}>
                    Setor {s.setor} — {s.coord}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-body absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5"
          >
            <Map className="w-4 h-4 text-verde" />
            <span>Mapa Geral</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/lider')}
            className="flex items-center gap-1.5 border-emerald-600/30 text-[#1D4225] font-bold"
          >
            <Smartphone className="w-4 h-4 text-[#1D4225]" />
            <span>App do Líder</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenCreateCulto}
            className="flex items-center gap-1.5 shadow-sm font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Culto no Setor</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-dourado" />
            <span>Dashboard Pastoral</span>
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

      {/* Cartão de Metas do Setor */}
      <SetorMetasCard
        setorNumero={setorSelecionado}
        cultos={cultos}
        decisoes={decisoes}
      />

      {/* Painel de Alerta de Pendências Operacionais */}
      <PendenciasAlerta
        cultos={cultos.filter((c) => c.setor === setorSelecionado)}
        onEditCulto={handleEditCulto}
        onOpenConvite={(papel) => {
          showToast(`Convite de ${papel} iniciado para o Setor ${setorSelecionado}`, 'info');
        }}
      />

      {/* Split Screen: Lista de Cultos do Setor + Gerador de Convites WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols): Cultos do Setor */}
        <div className="lg:col-span-7">
          <SetorCultosList
            cultos={cultos}
            setorNumero={setorSelecionado}
            onEditCulto={handleEditCulto}
            onViewOnMap={(c) => {
              navigate('/');
              showToast(`Localizando culto do setor no mapa: ${c.bairro}`, 'info');
            }}
          />
        </div>

        {/* Coluna Direita (5 cols): Gerador de Convites WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <GeradorConviteWhatsApp
            setorNumero={setorSelecionado}
            onConviteCriado={() => {
              showToast('Convite pronto para compartilhamento!', 'success');
            }}
          />
        </div>
      </div>

      {/* Tabela de Rastreamento de Convites do Setor */}
      <ConvitesSetorTable
        convites={convites || []}
        isLoading={isLoadingConvites}
      />

      {/* Modal de Formulário de Culto no Setor */}
      <CultoFormModal
        isOpen={isCultoModalOpen}
        onClose={() => setIsCultoModalOpen(false)}
        cultoParaEditar={cultoParaEditar}
        initialLocation={{ setor: setorSelecionado }}
        existingCultos={cultos}
        onSaved={(c) => {
          onCultoSaved?.(c);
          showToast('Culto salvo com sucesso no setor!', 'success');
        }}
      />
    </div>
  );
};
