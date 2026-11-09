import React from 'react';
import { useMapStore } from '../../stores/useMapStore';

export const MapLegend: React.FC = () => {
  const scaleWidth = useMapStore((s) => s.scaleWidth);

  const landCategories = [
    { label: 'Caatinga', color: 'var(--lc-caatinga)' },
    { label: 'Mata', color: 'var(--lc-mata)' },
    { label: 'Plantações', color: 'var(--lc-roca)' },
    { label: 'Área urbana', color: 'var(--lc-urbano)' },
    { label: 'Rio / Água', color: 'var(--lc-agua)' },
    { label: 'Salinas', color: 'var(--lc-salina)' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-panel border-t border-line text-xs text-muted">
      {/* Legenda de Tipologia de Solo */}
      <div className="flex flex-wrap items-center gap-3">
        {landCategories.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-[3px] border border-line flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-ink">{item.label}</span>
          </span>
        ))}
      </div>

      {/* Nota e Escala Gráfica Dinâmica */}
      <div className="flex items-center gap-4 ml-auto">
        <span className="hidden md:inline text-[11px] text-muted">
          14 setores eclesiásticos da Igreja Pão da Vida.
        </span>

        <div className="flex items-center gap-2">
          <div
            className="h-1.5 bg-ink rounded-full transition-all duration-150"
            style={{ width: `${Math.max(12, Math.min(200, scaleWidth))}px` }}
          />
          <span className="font-mono text-[11px] font-medium text-ink">1 km</span>
        </div>
      </div>
    </div>
  );
};
