import React from 'react';
import { SetorGeo, BairroGeo } from '../map/map-data';
import { CultoMarker } from '../../types/culto';
import { txtOn } from '../../lib/geo';
import { CultoCard } from './CultoCard';

interface SetorAccordionProps {
  setor: SetorGeo;
  bairros: BairroGeo[];
  cultos: CultoMarker[];
  isOpen: boolean;
  isSelected: boolean;
  selectedCultoId: string | null;
  onToggle: () => void;
  onSelectCulto: (culto: CultoMarker) => void;
  onFocusCulto: (culto: CultoMarker) => void;
}

export const SetorAccordion: React.FC<SetorAccordionProps> = ({
  setor,
  bairros,
  cultos,
  isOpen,
  isSelected,
  selectedCultoId,
  onToggle,
  onSelectCulto,
  onFocusCulto,
}) => {
  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (Array.isArray(c.pessoas) ? c.pessoas.length : 0),
    0
  );

  return (
    <div
      id={`setor-accordion-${setor.setor}`}
      className={`rounded-xl border transition-all mb-2 overflow-hidden ${
        isSelected
          ? 'border-accent/80 bg-chip/50 ring-1 ring-accent/30'
          : 'border-line/80 bg-panel hover:border-line'
      }`}
    >
      {/* Botão de Cabeçalho do Acordeão */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`setor-content-${setor.setor}`}
        className="w-full flex items-center gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors hover:bg-chip/40"
      >
        {/* Badge Numérico com a Cor Oficial do Setor */}
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-semibold shrink-0 shadow-sm"
          style={{
            backgroundColor: setor.cor,
            color: txtOn(setor.cor),
          }}
        >
          {setor.setor}
        </span>

        {/* Informações do Setor */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-ink truncate">
              Setor {setor.setor}
            </h3>
          </div>
          <p className="text-xs text-muted truncate">
            {setor.coord || 'Coordenação geral'}
          </p>
        </div>

        {/* Totalizadores de Cultos e Participantes */}
        <div className="text-right shrink-0">
          <div className="font-serif font-semibold text-sm text-ink leading-tight">
            {cultos.length}{' '}
            <span className="text-[11px] font-sans font-normal text-muted">
              {cultos.length === 1 ? 'lar' : 'lares'}
            </span>
          </div>
          {totalPessoas > 0 && (
            <div className="text-[10px] text-muted">
              {totalPessoas} pessoas
            </div>
          )}
        </div>

        {/* Indicador Chevron de Expansão */}
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Conteúdo Expansível: Chips de Bairros e Cultos */}
      {isOpen && (
        <div
          id={`setor-content-${setor.setor}`}
          className="px-3 pb-3 pt-1 border-t border-line/50 animate-fade-in"
        >
          {/* Chips dos Bairros Pertencentes ao Setor */}
          <div className="flex flex-wrap gap-1.5 mb-3 pt-1">
            {bairros.map((b) => (
              <span
                key={b.nome}
                className="text-[10px] bg-chip text-muted px-2 py-0.5 rounded-full border border-line"
                title={`Bairro ${b.nome} (${b.precisao})`}
              >
                {b.nome}
              </span>
            ))}
          </div>

          {/* Lista de Cultos no Setor */}
          <div className="flex flex-col gap-2">
            {cultos.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted border border-dashed border-line rounded-lg bg-chip/20">
                Nenhum culto cadastrado neste setor ainda.
              </div>
            ) : (
              cultos.map((culto) => (
                <CultoCard
                  key={culto.id}
                  culto={culto}
                  isSelected={selectedCultoId === culto.id}
                  onSelect={onSelectCulto}
                  onFocusOnMap={onFocusCulto}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
