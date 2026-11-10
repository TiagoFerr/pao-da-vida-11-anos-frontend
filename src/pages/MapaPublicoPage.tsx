import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/useUIStore';
import { useMapStore } from '@/stores/useMapStore';
import { MapSVG } from '@/components/map/MapSVG';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { MapTooltip } from '@/components/map/MapTooltip';
import { PublicSidebar } from '@/components/public/PublicSidebar';
import { CultoFormModal } from '@/components/culto/CultoFormModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { ConviteModal } from '@/components/auth/ConviteModal';
import { formatEndereco } from '@/lib/geo';
import { CultoMarker } from '@/types/culto';
import { useNavigate } from 'react-router-dom';

interface MapaPublicoPageProps {
  cultos: CultoMarker[];
  totalPessoas: number;
  onCultoSaved: (culto: CultoMarker) => void;
}

export const MapaPublicoPage: React.FC<MapaPublicoPageProps> = ({
  cultos,
  totalPessoas,
  onCultoSaved,
}) => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { picking, setPicking, setPendingPin } = useMapStore();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConviteOpen, setIsConviteOpen] = useState(false);
  const [isCultoFormOpen, setIsCultoFormOpen] = useState(false);
  const [cultoParaEditar, setCultoParaEditar] = useState<CultoMarker | null>(null);
  const [initialLocationForModal, setInitialLocationForModal] = useState<{
    x?: number;
    y?: number;
    setor?: number;
    bairro?: string;
    rua?: string;
  } | null>(null);

  const handlePickLocation = (data: {
    x: number;
    y: number;
    setor: number;
    bairro: string;
    rua: string;
  }) => {
    setPendingPin({ x: data.x, y: data.y });
    setPicking(false);
    setInitialLocationForModal(data);
    setCultoParaEditar(null);
    setIsCultoFormOpen(true);
    showToast(
      `Ponto selecionado (${data.bairro}, Setor ${data.setor}). Complete os dados do culto.`,
      'info'
    );
  };

  const handleOpenCreateCulto = (opts?: { setor?: number; bairro?: string; rua?: string }) => {
    setCultoParaEditar(null);
    setInitialLocationForModal(opts ? { setor: opts.setor, bairro: opts.bairro, rua: opts.rua } : null);
    setIsCultoFormOpen(true);
  };

  const handleEditCulto = (culto: CultoMarker) => {
    setCultoParaEditar(culto);
    setInitialLocationForModal(null);
    setIsCultoFormOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-5 min-h-screen">
      <Header
        totalCultos={cultos.length}
        totalPessoas={totalPessoas}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenConvite={() => setIsConviteOpen(true)}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenTelao={() => navigate('/telao')}
        onOpenCoordenador={() => navigate('/coordenador')}
        onOpenConvites={() => navigate('/convites')}
        onOpenLider={() => navigate('/lider')}
        onOpenAnfitriao={() => navigate('/anfitriao')}
      />

      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px] gap-5 items-start mt-4">
        {/* Painel do Mapa Principal */}
        <section
          className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden flex flex-col"
          aria-label="Mapa cartográfico dos cultos nos lares"
        >
          {/* Controles de Navegação e Busca */}
          <MapControls />

          {/* Banner de Modo de Marcação de Ponto */}
          {picking && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-dourado text-preto text-xs sm:text-sm font-medium animate-fade-in">
              <span>
                Toque no mapa onde fica a casa. A rua mais próxima e o setor serão identificados.
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setPicking(false)}
                className="bg-white text-preto border-transparent hover:bg-creme"
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Canvas SVG Interativo */}
          <div className="relative">
            <MapSVG
              cultos={cultos}
              onSelectCulto={(id) => {
                const c = cultos.find((k) => k.id === id);
                if (c) {
                  showToast(`Culto selecionado: ${formatEndereco(c)}`, 'info');
                }
              }}
              onPickLocation={handlePickLocation}
            />
            <MapTooltip />
          </div>

          {/* Legenda e Escala */}
          <MapLegend />
        </section>

        {/* Barra Lateral: Acordeão dos 14 Setores, Busca e Exportação CSV */}
        <PublicSidebar
          cultos={cultos}
          onStartPick={() => {
            setPicking(true);
            showToast('Toque no mapa para marcar a localização do culto', 'info');
          }}
          onOpenCreateCulto={handleOpenCreateCulto}
          onEditCulto={handleEditCulto}
        />
      </main>

      {/* Modal de Formulário de Culto no Lar com Snapping e Geolocalização */}
      <CultoFormModal
        isOpen={isCultoFormOpen}
        onClose={() => setIsCultoFormOpen(false)}
        cultoParaEditar={cultoParaEditar}
        initialLocation={initialLocationForModal}
        existingCultos={cultos}
        onSaved={onCultoSaved}
      />

      {/* Modais de Autenticação */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ConviteModal isOpen={isConviteOpen} onClose={() => setIsConviteOpen(false)} />
    </div>
  );
};
