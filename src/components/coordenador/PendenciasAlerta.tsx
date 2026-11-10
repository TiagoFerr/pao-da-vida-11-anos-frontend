import React from 'react';
import { CultoMarker } from '@/types/culto';
import { AlertTriangle, CheckCircle, UserX, PhoneCall, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PendenciasAlertaProps {
  cultos: CultoMarker[];
  onEditCulto: (culto: CultoMarker) => void;
  onOpenConvite: (papel: 'LIDER' | 'ANFITRIAO', culto?: CultoMarker) => void;
}

export const PendenciasAlerta: React.FC<PendenciasAlertaProps> = ({
  cultos,
  onEditCulto,
  onOpenConvite,
}) => {
  // Identifica cultos com pendências
  const cultosComPendencias = cultos.filter((c) => {
    const semLider = !c.lider || c.lider.toLowerCase().includes('definir');
    const semAnfitriao = !c.anfitriao || c.anfitriao.toLowerCase().includes('definir');
    const semTelefone = !c.liderTel && !c.anfTel && !c.telefone;
    const semNumero = !c.numero;
    return semLider || semAnfitriao || semTelefone || semNumero;
  });

  if (cultosComPendencias.length === 0) {
    return (
      <div className="bg-panel border border-line rounded-2xl p-5 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verde/15 text-verde flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-primary">Todos os lares do setor estão confirmados!</h4>
            <p className="text-xs text-body">
              Nenhuma pendência de líderes, anfitriões ou contatos encontrada nos cultos do seu setor.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-verde bg-verde/10 px-3 py-1 rounded-full border border-verde/20">
          100% Pronto
        </span>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-bold text-sm sm:text-base text-primary">
            Atenção da Coordenação: {cultosComPendencias.length} lar(es) com pendências
          </h3>
        </div>
        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
          Requer Ação
        </span>
      </div>

      <div className="space-y-3">
        {cultosComPendencias.map((culto) => {
          const semLider = !culto.lider || culto.lider.toLowerCase().includes('definir');
          const semAnfitriao = !culto.anfitriao || culto.anfitriao.toLowerCase().includes('definir');
          const semTelefone = !culto.liderTel && !culto.anfTel && !culto.telefone;
          const semNumero = !culto.numero;

          return (
            <div
              key={culto.id}
              className="bg-creme/40 dark:bg-preto/30 border border-line rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-primary text-sm flex items-center gap-2">
                  <span>{culto.anfitriao || 'Lar sem anfitrião'}</span>
                  <span className="text-[10px] bg-chip px-2 py-0.5 rounded text-body border border-line">
                    {culto.bairro}
                  </span>
                </div>
                <p className="text-body mt-0.5">
                  {culto.rua} {culto.numero ? `nº ${culto.numero}` : '(sem número)'}
                </p>

                {/* Tags de Pendência */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {semLider && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      <UserX className="w-3 h-3" /> Falta designar Líder
                    </span>
                  )}
                  {semAnfitriao && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      <UserX className="w-3 h-3" /> Confirmar Anfitrião
                    </span>
                  )}
                  {semTelefone && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <PhoneCall className="w-3 h-3" /> Telefone não informado
                    </span>
                  )}
                  {semNumero && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                      Número do imóvel pendente
                    </span>
                  )}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {semLider && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => onOpenConvite('LIDER', culto)}
                    className="text-[11px] py-1 px-2.5"
                  >
                    Convidar Líder
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onEditCulto(culto)}
                  className="flex items-center gap-1 text-[11px] py-1 px-2.5"
                >
                  <Edit3 className="w-3 h-3 text-verde" />
                  <span>Completar</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
