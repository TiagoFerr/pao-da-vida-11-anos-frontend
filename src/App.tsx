import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useUIStore } from '@/stores/useUIStore';
import { useMapStore } from '@/stores/useMapStore';
import { MapSVG, CultoMarker } from '@/components/map/MapSVG';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { MapTooltip } from '@/components/map/MapTooltip';
import { MiniMap } from '@/components/map/MiniMap';
import { LoginModal } from '@/components/auth/LoginModal';
import { ConviteModal } from '@/components/auth/ConviteModal';
import { useSSE } from '@/hooks/useSSE';
import { setorBy, formatEndereco, gPin, gAddr, toLL } from '@/lib/geo';

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
    selectedSetor,
    selectedCultoId,
    selectCulto,
    picking,
    setPicking,
    setPendingPin,
  } = useMapStore();

  const [cultos] = useState<CultoMarker[]>(INITIAL_CULTOS);
  const [miniPin, setMiniPin] = useState<{ x: number; y: number } | null>({
    x: 524.2,
    y: 696.2,
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConviteOpen, setIsConviteOpen] = useState(false);

  // Ativa escuta de Server-Sent Events em tempo real
  useSSE();

  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const selectedSetorData = selectedSetor ? setorBy[selectedSetor] : null;
  const filteredCultos = selectedSetor
    ? cultos.filter((c) => c.setor === selectedSetor)
    : cultos;

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

        {/* Barra Lateral: Detalhes do Setor / Lista de Cultos / Ferramentas */}
        <aside
          className="flex flex-col gap-4 bg-panel border border-line rounded-2xl p-4 shadow-card max-h-[calc(min(74vh,800px)+120px)] overflow-y-auto"
          aria-label="Informações do setor e cultos cadastrados"
        >
          {/* Ações Rápidas */}
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <h2 className="font-serif font-semibold text-base text-ink">
                {selectedSetorData
                  ? `Setor ${selectedSetorData.setor}`
                  : 'Todos os Setores'}
              </h2>
              <p className="text-xs text-muted">
                {selectedSetorData
                  ? selectedSetorData.coord
                  : 'Mossoró dividida em 14 setores'}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPicking(true);
                showToast('Toque no mapa para marcar a localização do culto', 'info');
              }}
            >
              + Marcar no Mapa
            </Button>
          </div>

          {/* Card Resumo do Setor Selecionado */}
          {selectedSetorData && (
            <div
              className="p-3.5 rounded-xl border text-xs"
              style={{
                borderColor: `${selectedSetorData.cor}40`,
                backgroundColor: `${selectedSetorData.cor}10`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-ink">
                  Setor {selectedSetorData.setor} — Coordenador
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: selectedSetorData.cor }}
                >
                  {filteredCultos.length} cultos
                </span>
              </div>
              <div className="text-muted leading-relaxed">
                {selectedSetorData.coord}
              </div>
            </div>
          )}

          {/* Lista de Cultos no Setor */}
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">
              Cultos no Setor ({filteredCultos.length})
            </div>

            {filteredCultos.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted border border-dashed border-line rounded-xl">
                Nenhum culto cadastrado neste setor ainda.
              </div>
            ) : (
              filteredCultos.map((c) => {
                const [lat, lng] = toLL(c.x, c.y);
                const isSelected = selectedCultoId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectCulto(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-dourado bg-creme/40 shadow-sm'
                        : 'border-line hover:border-verde/40 bg-chip/40'
                    }`}
                  >
                    <div className="font-medium text-xs text-ink mb-0.5">
                      {formatEndereco(c) || 'Endereço a definir'}
                    </div>
                    <div className="text-[11px] text-muted mb-1.5">
                      {c.bairro} · Setor {c.setor}
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-muted mb-2">
                      {c.lider && <div>Líder: <b className="text-ink">{c.lider}</b></div>}
                      {c.anfitriao && <div>Anfitrião: <b className="text-ink">{c.anfitriao}</b></div>}
                      {c.pessoas && (
                        <div>Pessoas: <b className="text-ink">{c.pessoas.length}</b></div>
                      )}
                      {c.horario && <div>Horário: <b className="text-ink">{c.horario}</b></div>}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-line/60">
                      <a
                        href={gAddr(`${formatEndereco(c)}, ${c.bairro}, Mossoró - RN`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-verde hover:underline"
                      >
                        Google Maps
                      </a>
                      <span className="text-muted text-[10px]">·</span>
                      <a
                        href={gPin(lat, lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-verde hover:underline"
                      >
                        Ponto GPS
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Teste do MiniMap de Formulário */}
          <div className="border-t border-line pt-3 mt-2">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Mini-Mapa (Ajuste Fino de Endereço)
            </div>
            <MiniMap
              pin={miniPin}
              onPinChange={(loc) => {
                setMiniPin({ x: loc.x, y: loc.y });
                showToast(
                  `Mini-mapa ajustado: ${loc.rua || 'Rua próxima'} (${loc.bairro})`,
                  'info'
                );
              }}
            />
            {miniPin && (
              <div className="text-[11px] text-muted mt-1.5">
                Coordenadas SVG: ({miniPin.x}, {miniPin.y})
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Modais de Autenticação */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ConviteModal isOpen={isConviteOpen} onClose={() => setIsConviteOpen(false)} />

      <Toast message={toastMessage} visible={isToastVisible} type={toastType} />
    </div>
  );
}

export default App;
