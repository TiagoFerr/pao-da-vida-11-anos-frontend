import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useUIStore } from '@/stores/useUIStore';
import { useMapStore } from '@/stores/useMapStore';
import { MapSVG, CultoMarker } from '@/components/map/MapSVG';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { MapTooltip } from '@/components/map/MapTooltip';
import { PublicSidebar } from '@/components/public/PublicSidebar';
import { LoginModal } from '@/components/auth/LoginModal';
import { ConviteModal } from '@/components/auth/ConviteModal';
import { useSSE } from '@/hooks/useSSE';
import { useCultosList } from '@/hooks/queries/useCultos';
import { formatEndereco } from '@/lib/geo';

// Amostra inicial de cultos nos lares para validação interativa
const INITIAL_CULTOS: CultoMarker[] = [
  {
    id: 'culto-1',
    setor: 1,
    x: 322.3,
    y: 687.6,
    rua: 'Rua Sebastião Benígno de Moura',
    numero: '124',
    bairro: 'Aeroporto',
    lider: 'Pr. Rúbens Nunes',
    anfitriao: 'Irmão João e Família',
    pessoas: ['João', 'Maria', 'Lucas', 'Ana'],
    horario: '19:30',
    obs: 'Casa com portão verde',
  },
  {
    id: 'culto-2',
    setor: 2,
    x: 403.8,
    y: 840.2,
    rua: 'Avenida Alberto Maranhão',
    numero: '2450',
    bairro: 'Belo Horizonte',
    lider: 'Pra. Adriana Karina',
    anfitriao: 'Dona Francisca',
    pessoas: ['Francisca', 'Carlos', 'Beatriz'],
    horario: '19:30',
  },
  {
    id: 'culto-3',
    setor: 5,
    x: 322.4,
    y: 387.8,
    rua: 'Avenida Abolição',
    numero: '890',
    bairro: 'Abolição',
    lider: 'Pb. Adriano Medeiros',
    anfitriao: 'Irmã Emanuela Larissa',
    pessoas: ['Emanuela', 'Adriano', 'Pedro', 'Sofia', 'Davi'],
    horario: '20:00',
  },
  {
    id: 'culto-4',
    setor: 8,
    x: 592.0,
    y: 885.8,
    rua: 'Avenida Presidente Costa e Silva',
    numero: '512',
    bairro: 'Alto de São Manoel',
    lider: 'Isaac Ramalho',
    anfitriao: 'Irmão Marcos',
    pessoas: ['Marcos', 'Luciana'],
    horario: '19:30',
  },
  {
    id: 'culto-5',
    setor: 11,
    x: 524.2,
    y: 696.2,
    rua: 'Avenida Rio Branco',
    numero: '310',
    bairro: 'Centro',
    lider: 'Pb. Diego',
    anfitriao: 'Irmã Cláudia',
    pessoas: ['Cláudia', 'Roberto', 'Samuel'],
    horario: '19:30',
  },
];

export function App() {
  const { showToast, toastMessage, isToastVisible, toastType } = useUIStore();
  const {
    picking,
    setPicking,
    setPendingPin,
  } = useMapStore();

  const { data: apiCultos } = useCultosList();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConviteOpen, setIsConviteOpen] = useState(false);

  // Ativa escuta de Server-Sent Events em tempo real
  useSSE();

  // Mapeia cultos da API ou usa amostra inicial estática como fallback de segurança
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
    return INITIAL_CULTOS;
  }, [apiCultos]);

  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const handlePickLocation = (data: {
    x: number;
    y: number;
    setor: number;
    bairro: string;
    rua: string;
  }) => {
    setPendingPin({ x: data.x, y: data.y });
    setPicking(false);
    showToast(
      `Ponto marcado: ${data.rua || 'Rua próxima'} (${data.bairro}, Setor ${data.setor})`,
      'success'
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-5 min-h-screen">
      <Header
        totalCultos={cultos.length}
        totalPessoas={totalPessoas}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenConvite={() => setIsConviteOpen(true)}
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
        />
      </main>

      {/* Modais de Autenticação */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ConviteModal isOpen={isConviteOpen} onClose={() => setIsConviteOpen(false)} />

      <Toast message={toastMessage} visible={isToastVisible} type={toastType} />
    </div>
  );
}

export default App;
