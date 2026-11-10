import React from 'react';
import { GEO, SetorGeo } from '../map/map-data';
import { txtOn } from '../../lib/geo';
import { CultoMarker } from '@/types/culto';
import { DecisaoItem } from '@/types/decisao';
import { Users, Sparkles, MapPin } from 'lucide-react';

interface SetoresProgressGridProps {
  cultos: CultoMarker[];
  decisoes: DecisaoItem[];
  onSelectSetor?: (setorNumero: number) => void;
}

export const SetoresProgressGrid: React.FC<SetoresProgressGridProps> = ({
  cultos,
  decisoes,
  onSelectSetor,
}) => {
  // Meta sugerida por setor: ~9 lares por setor (14 x ~8.6 = 120 lares)
  const META_POR_SETOR = 9;

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-line">
        <div>
          <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
            <span className="text-dourado font-bold font-mono">//</span> COBERTURA TERRITORIAL DE MOSSORÓ
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-identidade text-primary mt-1">
            Distribuição dos 14 Setores Pastorais
          </h3>
        </div>
        <p className="text-xs text-body">
          Meta padrão: <span className="font-semibold text-primary">{META_POR_SETOR} lares</span> por setor
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mt-5">
        {GEO.setores.map((setor: SetorGeo) => {
          const cultosSetor = cultos.filter((c) => c.setor === setor.setor);
          const decisoesSetor = decisoes.filter((d) => d.culto.setorNumero === setor.setor);
          const totalPessoasSetor = cultosSetor.reduce(
            (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
            0
          );
          const percentual = Math.min(100, Math.round((cultosSetor.length / META_POR_SETOR) * 100));
          const textColor = txtOn(setor.cor);

          const bairrosDoSetor = GEO.bairros
            .filter((b) => b.setor === setor.setor)
            .map((b) => b.nome);

          return (
            <div
              key={setor.setor}
              onClick={() => onSelectSetor?.(setor.setor)}
              className="bg-creme/40 dark:bg-preto/30 border border-line/70 hover:border-dourado/60 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
                      style={{ backgroundColor: setor.cor, color: textColor }}
                    >
                      {setor.setor}
                    </span>
                    <span className="font-bold text-sm text-primary group-hover:text-dourado transition-colors line-clamp-1">
                      Setor {setor.setor}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-body">
                    {cultosSetor.length}/{META_POR_SETOR}
                  </span>
                </div>

                {/* Coordenador do Setor */}
                <p className="text-xs text-primary/80 font-medium mt-1 truncate">
                  Coord: {setor.coord}
                </p>

                {/* Lista de Bairros como texto auxiliar */}
                <div className="flex items-center gap-1 text-[11px] text-body/70 mt-2 line-clamp-1">
                  <MapPin className="w-3 h-3 text-dourado flex-shrink-0" />
                  <span>{bairrosDoSetor.join(', ')}</span>
                </div>
              </div>

              {/* Barra de Progresso do Setor */}
              <div className="mt-4 pt-3 border-t border-line/40">
                <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: setor.cor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-body mt-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-verde" />
                    <span>{totalPessoasSetor} reunidos</span>
                  </span>
                  {decisoesSetor.length > 0 && (
                    <span className="flex items-center gap-1 text-dourado font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>{decisoesSetor.length} vidas</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
