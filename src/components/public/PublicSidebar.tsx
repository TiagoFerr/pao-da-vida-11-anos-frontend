import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GEO } from '../map/map-data';
import { CultoMarker } from '../../types/culto';
import { norm } from '../../lib/geo';
import { exportCultosToCSV } from '../../lib/exportCsv';
import { useMapStore } from '../../stores/useMapStore';
import { useUIStore } from '../../stores/useUIStore';
import { SetorAccordion } from './SetorAccordion';
import { Button } from '../ui/Button';

interface PublicSidebarProps {
  cultos: CultoMarker[];
  onStartPick?: () => void;
  onOpenCreateCulto?: (opts?: { setor?: number; bairro?: string; rua?: string }) => void;
  onEditCulto?: (culto: CultoMarker) => void;
}

export const PublicSidebar: React.FC<PublicSidebarProps> = ({
  cultos,
  onStartPick,
  onOpenCreateCulto,
  onEditCulto,
}) => {
  const {
    selectedSetor,
    selectedCultoId,
    selectSetor,
    selectCulto,
    focusCulto,
  } = useMapStore();

  const { showToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [openSetores, setOpenSetores] = useState<Set<number>>(() => new Set());
  const sidebarContainerRef = useRef<HTMLElement>(null);

  // Sincronização quando um setor é selecionado no mapa
  useEffect(() => {
    if (selectedSetor !== null) {
      setOpenSetores((prev) => new Set(prev).add(selectedSetor));

      // Scroll suave até o acordeão do setor
      const el = document.getElementById(`setor-accordion-${selectedSetor}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedSetor]);

  // Sincronização quando um culto específico é selecionado no mapa
  useEffect(() => {
    if (selectedCultoId) {
      const culto = cultos.find((c) => c.id === selectedCultoId);
      if (culto) {
        setOpenSetores((prev) => new Set(prev).add(culto.setor));

        // Aguarda renderização do acordeão aberto e rola até o card
        setTimeout(() => {
          const cardEl = document.getElementById(`culto-card-${culto.id}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
      }
    }
  }, [selectedCultoId, cultos]);

  // Normalização do termo de busca
  const normalizedQuery = useMemo(() => norm(searchQuery.trim()), [searchQuery]);

  // Filtra cultos por setor e critério de busca
  const { filteredCultosBySetor, totalResultados } = useMemo(() => {
    const map = new Map<number, CultoMarker[]>();
    let total = 0;

    GEO.setores.forEach((s) => {
      const bs = GEO.bairros.filter((b) => b.setor === s.setor);
      const bairrosNomes = bs.map((b) => b.nome).join(' ');
      const setorHaystack = norm(`${s.coord} ${bairrosNomes} setor ${s.setor}`);

      const setorCultos = cultos.filter((c) => c.setor === s.setor);

      if (!normalizedQuery) {
        map.set(s.setor, setorCultos);
        total += setorCultos.length;
        return;
      }

      // Se a busca der match no nome do setor/bairro, exibe todos do setor
      const matchesSetor = setorHaystack.includes(normalizedQuery);

      const matchingCultos = setorCultos.filter((c) => {
        if (matchesSetor) return true;

        const cultoHaystack = norm(
          [
            c.rua,
            c.numero,
            c.bairro,
            c.anfitriao,
            c.lider,
            c.referencia,
            c.obs,
            Array.isArray(c.pessoas) ? c.pessoas.join(' ') : '',
          ]
            .filter(Boolean)
            .join(' ')
        );

        return cultoHaystack.includes(normalizedQuery);
      });

      if (matchesSetor || matchingCultos.length > 0) {
        map.set(s.setor, matchingCultos);
        total += matchingCultos.length;
      } else {
        map.set(s.setor, []);
      }
    });

    return { filteredCultosBySetor: map, totalResultados: total };
  }, [cultos, normalizedQuery]);

  // Se houver busca com resultados, expande automaticamente os setores que têm resultados
  useEffect(() => {
    if (normalizedQuery) {
      const newOpen = new Set<number>();
      filteredCultosBySetor.forEach((list, setorNum) => {
        if (list.length > 0) {
          newOpen.add(setorNum);
        }
      });
      setOpenSetores(newOpen);
    }
  }, [normalizedQuery, filteredCultosBySetor]);

  const toggleSetor = (setorNum: number) => {
    setOpenSetores((prev) => {
      const next = new Set(prev);
      if (next.has(setorNum)) {
        next.delete(setorNum);
        if (selectedSetor === setorNum) {
          selectSetor(null);
        }
      } else {
        next.add(setorNum);
        selectSetor(setorNum);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    try {
      exportCultosToCSV(cultos);
      showToast('Planilha CSV gerada com sucesso!', 'success');
    } catch {
      showToast('Não foi possível baixar a planilha agora.', 'error');
    }
  };

  const handleFocusCulto = (culto: CultoMarker) => {
    focusCulto(culto);
    showToast(`Culto selecionado: ${culto.rua || 'Endereço a definir'}`, 'info');
  };

  const totalGeralPessoas = cultos.reduce(
    (acc, c) => acc + (Array.isArray(c.pessoas) ? c.pessoas.length : 0),
    0
  );

  return (
    <aside
      ref={sidebarContainerRef}
      className="flex flex-col gap-3.5 bg-panel border border-line rounded-2xl p-4 shadow-card max-h-[calc(min(74vh,800px)+120px)] overflow-y-auto"
      aria-label="Informações dos setores e cultos nos lares"
    >
      {/* Cabeçalho da Sidebar & Ações Principais */}
      <div className="flex flex-col gap-2.5 border-b border-line pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-semibold text-base text-ink">
              Cultos nos Setores
            </h2>
            <p className="text-xs text-muted">
              {cultos.length} {cultos.length === 1 ? 'lar cadastrado' : 'lares cadastrados'}
              {totalGeralPessoas > 0 ? ` · ${totalGeralPessoas} pessoas` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs h-8 px-2.5 border-line hover:border-gold"
              title="Baixar planilha CSV com todos os cultos"
            >
              CSV
            </Button>

            {onOpenCreateCulto && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onOpenCreateCulto()}
                className="text-xs h-8 px-2.5 font-medium"
                title="Cadastrar novo culto no lar"
              >
                + Culto
              </Button>
            )}

            {onStartPick && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onStartPick}
                className="text-xs h-8 px-2.5 border-line hover:border-accent"
                title="Marcar ponto diretamente no mapa"
              >
                Marcar
              </Button>
            )}
          </div>
        </div>

        {/* Campo de Busca Instantânea Multi-campo */}
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por rua, bairro, líder, anfitrião..."
            className="w-full h-9 pl-3.5 pr-8 text-xs rounded-xl bg-chip text-ink border border-line focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde"
            aria-label="Buscar nos cultos cadastrados"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs p-1"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Feedback de Busca Ativa */}
        {searchQuery && (
          <div className="flex items-center justify-between text-[11px] text-muted px-0.5">
            <span>
              {totalResultados === 0
                ? 'Nenhum culto encontrado'
                : `${totalResultados} ${totalResultados === 1 ? 'culto encontrado' : 'cultos encontrados'}`}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-verde hover:underline"
            >
              Limpar filtro
            </button>
          </div>
        )}

        {/* Filtro de Setor Ativo no Mapa */}
        {selectedSetor !== null && !searchQuery && (
          <div className="flex items-center justify-between bg-chip/70 border border-line rounded-lg px-2.5 py-1 text-xs">
            <span className="text-ink font-medium">
              Filtrado: <strong>Setor {selectedSetor}</strong>
            </span>
            <button
              type="button"
              onClick={() => selectSetor(null)}
              className="text-verde hover:underline text-[11px]"
            >
              Ver todos
            </button>
          </div>
        )}
      </div>

      {/* Lista do Acordeão dos 14 Setores */}
      <div className="flex flex-col">
        {totalResultados === 0 && searchQuery ? (
          <div className="text-center py-8 text-xs text-muted border border-dashed border-line rounded-xl p-4">
            <p className="font-medium text-ink mb-1">Nenhum culto encontrado</p>
            <p className="text-muted leading-relaxed">
              Tente buscar por outro bairro, líder ou logradouro, ou limpe a busca para ver todos os setores.
            </p>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs"
            >
              Limpar busca
            </Button>
          </div>
        ) : (
          GEO.setores.map((setor) => {
            const setorCultos = filteredCultosBySetor.get(setor.setor) || [];
            const bairrosDoSetor = GEO.bairros.filter((b) => b.setor === setor.setor);

            // Quando houver busca com query, esconde setores com 0 resultados
            if (normalizedQuery && setorCultos.length === 0) {
              return null;
            }

            const isOpen = openSetores.has(setor.setor);
            const isSelected = selectedSetor === setor.setor;

            return (
              <SetorAccordion
                key={setor.setor}
                setor={setor}
                bairros={bairrosDoSetor}
                cultos={setorCultos}
                isOpen={isOpen}
                isSelected={isSelected}
                selectedCultoId={selectedCultoId}
                onToggle={() => toggleSetor(setor.setor)}
                onSelectCulto={(c) => selectCulto(c.id)}
                onFocusCulto={handleFocusCulto}
                onEditCulto={onEditCulto}
                onAddCultoInSetor={(sNum) => onOpenCreateCulto?.({ setor: sNum })}
              />
            );
          })
        )}
      </div>
    </aside>
  );
};
