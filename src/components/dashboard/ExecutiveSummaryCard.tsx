import React from 'react';
import { Home, Users, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface ExecutiveSummaryCardProps {
  totalCultos: number;
  metaGlobal?: number;
  totalPessoas: number;
  totalDecisoes: number;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  totalCultos,
  metaGlobal = 120,
  totalPessoas,
  totalDecisoes,
}) => {
  const percentual = Math.min(100, Math.round((totalCultos / metaGlobal) * 100));
  const faltam = Math.max(0, metaGlobal - totalCultos);
  const mediaPorLar = totalCultos > 0 ? (totalPessoas / totalCultos).toFixed(1) : '0';

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-card relative overflow-hidden transition-all">
      {/* Detalhe de fundo dourado suave na quina superior */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-dourado/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho Editorial com Identidade Visual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-line">
        <div>
          <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
            <span className="text-dourado font-bold font-mono">//</span> RELATÓRIO EXECUTIVO PASTORAL
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-identidade text-primary mt-1">
            Placar Geral dos 120 Lares de Mossoró
          </h2>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-creme dark:bg-preto/40 px-3.5 py-1.5 rounded-full border border-line text-xs font-medium text-body">
          <ShieldCheck className="w-4 h-4 text-verde" />
          <span>Celebração 19 de Novembro</span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-6">
        {/* Card 1: Lares Confirmados */}
        <div className="bg-creme/60 dark:bg-preto/30 border border-line/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-body">
            <span className="text-xs uppercase font-medium tracking-wide">Lares Ativos</span>
            <Home className="w-4 h-4 text-verde" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-serif text-primary">
                {totalCultos}
              </span>
              <span className="text-xs sm:text-sm text-body/70 font-mono">/ {metaGlobal}</span>
            </div>
            <p className="text-[11px] text-body/70 mt-1">
              {faltam === 0 ? 'Meta de 120 Lares alcançada!' : `Faltam ${faltam} lares para a meta`}
            </p>
          </div>
        </div>

        {/* Card 2: Vidas para Cristo (Destaque Espiritual) */}
        <div className="bg-gradient-to-br from-dourado/15 to-creme/30 dark:from-dourado/10 dark:to-preto/30 border border-dourado/40 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-dourado">
            <span className="text-xs uppercase font-bold tracking-wide">Vidas para Cristo</span>
            <Sparkles className="w-4 h-4 text-dourado animate-pulse" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-serif text-primary">
                {totalDecisoes}
              </span>
              <span className="text-[10px] font-semibold bg-dourado text-preto px-2 py-0.5 rounded-full uppercase">
                Salvação
              </span>
            </div>
            <p className="text-[11px] text-primary/80 mt-1 font-medium">
              Decisões, reconciliações e batismos
            </p>
          </div>
        </div>

        {/* Card 3: Pessoas Reunidas */}
        <div className="bg-creme/60 dark:bg-preto/30 border border-line/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-body">
            <span className="text-xs uppercase font-medium tracking-wide">Pessoas nos Lares</span>
            <Users className="w-4 h-4 text-verde" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-serif text-primary">
                {totalPessoas}
              </span>
              <span className="text-xs text-body/70">vidas</span>
            </div>
            <p className="text-[11px] text-body/70 mt-1">
              Comunhão, louvor e intercessão
            </p>
          </div>
        </div>

        {/* Card 4: Média por Lar */}
        <div className="bg-creme/60 dark:bg-preto/30 border border-line/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-body">
            <span className="text-xs uppercase font-medium tracking-wide">Média por Lar</span>
            <TrendingUp className="w-4 h-4 text-verde" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-serif text-primary">
                {mediaPorLar}
              </span>
              <span className="text-xs text-body/70">pessoas/casa</span>
            </div>
            <p className="text-[11px] text-body/70 mt-1">
              Densidade espiritual e alcance
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Consolidada da Meta dos 120 Lares */}
      <div className="mt-2 pt-4 border-t border-line/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-primary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-dourado" />
            Progresso Geral da Convocação dos 120 Lares
          </span>
          <span className="font-mono font-bold text-dourado text-sm">
            {percentual}% ({totalCultos}/{metaGlobal})
          </span>
        </div>
        <div className="w-full bg-line rounded-full h-3 overflow-hidden p-0.5 border border-line/40">
          <div
            className="bg-gradient-to-r from-verde via-dourado to-dourado h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>
    </div>
  );
};
