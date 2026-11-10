import * as React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export interface HeaderProps {
  totalCultos?: number;
  totalPessoas?: number;
  onOpenLogin?: () => void;
  onOpenConvite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCultos = 0,
  totalPessoas = 0,
  onOpenLogin,
  onOpenConvite,
}) => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-accent pb-4 mb-5">
      <div className="flex-1 min-w-[280px]">
        {/* Prefixo Editorial do Manual Atualizado */}
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted uppercase mb-1">
          <span className="text-gold font-mono">//</span>
          <span>120 Cultos nos Lares · 19 de Novembro de 2026</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl text-accent tracking-tight leading-tight flex items-baseline gap-1.5 select-none">
              <span className="font-sans font-normal tracking-wide">CRESCER</span>
              <span className="text-gold font-serif italic font-normal">&amp;</span>
              <span className="font-sans font-black italic tracking-tight">EDIFICAR</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-ce-bege text-ce-verde border border-ce-marfim/30 hidden sm:inline-block">
              11 Anos
            </span>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Linha de Apoio com Fios Horizontais e Efésios 4:16 */}
        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-[1px] w-4 bg-gold/70 inline-block" />
            <span className="font-serif italic text-gold text-xs sm:text-sm select-none">
              Efésios 4:16
            </span>
            <span className="h-[1px] w-4 bg-gold/70 inline-block" />
          </div>
          <span className="text-[10px] tracking-[0.2em] font-medium text-muted uppercase">
            Igreja Pão da Vida · Mossoró - RN
          </span>

          {/* Botões de Acesso de Liderança */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 text-xs bg-chip px-3 py-1.5 rounded-full border border-line">
                <span className="font-medium text-ink">
                  {user.nome || user.email}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent text-white">
                  {user.role}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-muted hover:text-danger ml-1 text-xs"
                  title="Sair da conta"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onOpenConvite}>
                  Ativar Convite
                </Button>
                <Button variant="default" size="sm" onClick={onOpenLogin}>
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
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

        {/* Botão de login para mobile */}
        <div className="sm:hidden flex items-center gap-2">
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-danger font-medium"
            >
              Sair ({user.role})
            </button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onOpenLogin}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
