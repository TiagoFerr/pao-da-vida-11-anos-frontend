import * as React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export interface HeaderProps {
  totalCultos?: number;
  totalPessoas?: number;
}

export const Header: React.FC<HeaderProps> = ({ totalCultos = 0, totalPessoas = 0 }) => {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-accent pb-4 mb-5">
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-accent tracking-tight leading-tight">
            120 Cultos nos Lares
          </h1>
          <ThemeToggle className="sm:hidden" />
        </div>
        <p className="text-sm text-muted mt-1 max-w-[62ch]">
          Mapa dos setores de Mossoró para o aniversário de 11 anos da Igreja Pão da Vida. Cultos em 19 de novembro de 2026.
        </p>
        <p className="font-serif italic text-gold text-sm sm:text-base mt-1 select-none">
          Crescer &amp; Edificar, Efésios 4:16
        </p>
      </div>

      <div className="w-full sm:w-auto sm:min-w-[260px] flex sm:flex-col items-center sm:items-end justify-between gap-3">
        <div className="w-full sm:w-72">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-none">
              {totalCultos} <small className="text-xs sm:text-sm font-normal text-muted font-sans">de 120 lares</small>
            </span>
            <ThemeToggle className="hidden sm:inline-grid" />
          </div>
          <ProgressBar value={totalCultos} max={120} />
          <span className="text-xs text-muted mt-1 block">
            {totalCultos >= 120
              ? 'Meta alcançada. Glória a Deus!'
              : `Faltam ${120 - totalCultos} lares para a meta${totalPessoas > 0 ? ` · ${totalPessoas} pessoas` : ''}`}
          </span>
        </div>
      </div>
    </header>
  );
};
