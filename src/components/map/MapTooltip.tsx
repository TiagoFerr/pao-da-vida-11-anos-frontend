import React from 'react';
import { useMapStore } from '../../stores/useMapStore';

export const MapTooltip: React.FC = () => {
  const tooltip = useMapStore((s) => s.tooltip);

  if (!tooltip) return null;

  return (
    <div
      className="absolute pointer-events-none bg-panel text-ink border border-line rounded-xl p-2.5 shadow-lg text-xs max-w-[280px] z-20 transition-opacity duration-150 animate-fade-in"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }}
    >
      <div className="font-serif font-semibold text-sm text-ink leading-tight mb-0.5">
        {tooltip.title}
      </div>
      {tooltip.subtitle && (
        <div className="text-muted text-xs leading-normal">
          {tooltip.subtitle}
        </div>
      )}
      {tooltip.details && (
        <div className="text-muted text-[11px] leading-tight mt-1 border-t border-line/60 pt-1">
          {tooltip.details}
        </div>
      )}
    </div>
  );
};
