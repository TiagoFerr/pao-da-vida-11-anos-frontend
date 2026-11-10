import React from 'react';
import { GEO, SetorGeo } from '../map/map-data';
import { txtOn } from '../../lib/geo';
import { CultoMarker } from '@/types/culto';
import { DecisaoItem } from '@/types/decisao';
import { Home, Sparkles, Users, MapPin, Target, ShieldCheck } from 'lucide-react';

interface SetorMetasCardProps {
  setorNumero: number;
  cultos: CultoMarker[];
  decisoes: DecisaoItem[];
}

export const SetorMetasCard: React.FC<SetorMetasCardProps> = ({
  setorNumero,
  cultos,
  decisoes,
}) => {
  const META_SETOR = 9;
  const setorGeo: SetorGeo | undefined = GEO.setores.find((s) => s.setor === setorNumero);
  const cultosDoSetor = cultos.filter((c) => c.setor === setorNumero);
  const decisoesDoSetor = decisoes.filter((d) => d.culto.setorNumero === setorNumero);

  const totalPessoas = cultosDoSetor.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const percentual = Math.min(100, Math.round((cultosDoSetor.length / META_SETOR) * 100));
  const faltam = Math.max(0, META_SETOR - cultosDoSetor.length);

  const bairros = GEO.bairros
    .filter((b) => b.setor === setorNumero)
    .map((b) => b.nome);

  const corSetor = setorGeo?.cor || '#1D4225';
  const textColor = txtOn(corSetor);

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-card relative overflow-hidden">
      {/* Detalhe luminoso no fundo */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: corSetor }}
      />

      {/* Cabeçalho do Setor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
        <div className="flex items-center gap-3">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md flex-shrink-0"
            style={{ backgroundColor: corSetor, color: textColor }}
          >
            {setorNumero}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao">
                // COORDENAÇÃO PASTORAL REGIONAL
              </span>
              <span className="text-[10px] font-bold bg-creme dark:bg-preto/40 text-body px-2 py-0.5 rounded-full border border-line">
                Setor Oficial {setorNumero}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-identidade text-primary mt-0.5">
              Supervisão do Setor {setorNumero}
            </h2>
            <p className="text-xs text-body font-medium">
              Coordenador(a): <strong className="text-primary">{setorGeo?.coord || 'Coordenador Designado'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-creme dark:bg-preto/40 px-3 py-1.5 rounded-full border border-line text-xs font-medium text-body">
          <ShieldCheck className="w-4 h-4 text-verde" />
          <span>Meta: {META_SETOR} lares no setor</span>
        </div>
      </div>

      {/* Grid de Indicadores do Setor */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        {/* Lares Confirmados */}
        <div className="bg-creme/50 dark:bg-preto/30 border border-line/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-body">
            <span className="text-[11px] uppercase font-semibold">Lares no Setor</span>
            <Home className="w-4 h-4 text-verde" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-serif text-primary">
                {cultosDoSetor.length}
              </span>
              <span className="text-xs text-body/70 font-mono">/ {META_SETOR}</span>
            </div>
            <p className="text-[10px] text-body/70 mt-1">
              {faltam === 0 ? 'Meta setorial alcançada!' : `Faltam ${faltam} lares`}
            </p>
          </div>
        </div>

        {/* Vidas para Cristo */}
        <div className="bg-gradient-to-br from-dourado/15 to-creme/30 dark:from-dourado/10 dark:to-preto/30 border border-dourado/40 rounded-xl p-4">
          <div className="flex items-center justify-between text-dourado">
            <span className="text-[11px] uppercase font-bold">Vidas Salvas</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-serif text-primary">
                {decisoesDoSetor.length}
              </span>
              <span className="text-[10px] font-semibold bg-dourado text-preto px-1.5 py-0.5 rounded-full uppercase">
                Decisões
              </span>
            </div>
            <p className="text-[10px] text-primary/80 mt-1">
              Colheita espiritual no setor
            </p>
          </div>
        </div>

        {/* Participantes Reunidos */}
        <div className="bg-creme/50 dark:bg-preto/30 border border-line/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-body">
            <span className="text-[11px] uppercase font-semibold">Pessoas Reunidas</span>
            <Users className="w-4 h-4 text-verde" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-serif text-primary">
                {totalPessoas}
              </span>
              <span className="text-xs text-body/70">vidas</span>
            </div>
            <p className="text-[10px] text-body/70 mt-1">
              Comunhão e edificação mútua
            </p>
          </div>
        </div>

        {/* Cobertura Territorial */}
        <div className="bg-creme/50 dark:bg-preto/30 border border-line/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-body">
            <span className="text-[11px] uppercase font-semibold">Bairros no Setor</span>
            <MapPin className="w-4 h-4 text-dourado" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-serif text-primary">
                {bairros.length}
              </span>
              <span className="text-xs text-body/70">bairros</span>
            </div>
            <p className="text-[10px] text-body/70 mt-1 truncate" title={bairros.join(', ')}>
              {bairros.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Progresso do Setor */}
      <div className="pt-4 border-t border-line/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-primary flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-dourado" />
            Avanço da Meta no Setor {setorNumero}
          </span>
          <span className="font-mono font-bold text-dourado text-sm">
            {percentual}% ({cultosDoSetor.length}/{META_SETOR} lares)
          </span>
        </div>
        <div className="w-full bg-line rounded-full h-2.5 overflow-hidden p-0.5 border border-line/40">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{
              width: `${percentual}%`,
              backgroundColor: corSetor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
