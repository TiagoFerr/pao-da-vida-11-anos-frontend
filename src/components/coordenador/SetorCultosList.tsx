import React from 'react';
import { CultoMarker } from '@/types/culto';
import { formatEndereco } from '@/lib/geo';
import {
  Home,
  User,
  Users,
  Clock,
  MapPin,
  Edit,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SetorCultosListProps {
  cultos: CultoMarker[];
  setorNumero: number;
  onEditCulto: (culto: CultoMarker) => void;
  onViewOnMap?: (culto: CultoMarker) => void;
}

export const SetorCultosList: React.FC<SetorCultosListProps> = ({
  cultos,
  setorNumero,
  onEditCulto,
  onViewOnMap,
}) => {
  const cultosDoSetor = cultos.filter((c) => c.setor === setorNumero);

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line">
        <div>
          <h3 className="font-bold text-sm sm:text-base font-identidade text-primary">
            Lares sob Supervisão ({cultosDoSetor.length} cadastrados)
          </h3>
          <p className="text-xs text-body">
            Lista operacional dos cultos nos lares confirmados no Setor {setorNumero}.
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-line/60">
        {cultosDoSetor.length === 0 ? (
          <div className="py-12 text-center text-body text-xs">
            Nenhum culto cadastrado neste setor ainda. Utilize o botão acima para adicionar o primeiro lar!
          </div>
        ) : (
          cultosDoSetor.map((culto) => {
            const liderTelLimpo = culto.liderTel?.replace(/\D/g, '') || '';
            const anfTelLimpo = (culto.anfTel || culto.telefone)?.replace(/\D/g, '') || '';

            return (
              <div
                key={culto.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Dados do Lar e Endereço */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-primary text-sm sm:text-base">
                      {culto.anfitriao || 'Lar a confirmar'}
                    </span>
                    <span className="text-[10px] bg-creme dark:bg-preto/50 text-body font-semibold px-2 py-0.5 rounded-full border border-line">
                      {culto.bairro}
                    </span>
                    {culto.horario && (
                      <span className="text-[11px] text-body flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-dourado" />
                        {culto.horario}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-body flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-dourado flex-shrink-0" />
                    <span>{formatEndereco(culto)}</span>
                    {culto.referencia && (
                      <span className="text-body/70 italic">({culto.referencia})</span>
                    )}
                  </div>

                  {/* Informações da Liderança e Participantes */}
                  <div className="flex items-center gap-4 text-xs text-body pt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <User className="w-3.5 h-3.5 text-verde" />
                      Líder: {culto.lider || 'A definir'}
                    </span>

                    <span className="flex items-center gap-1 text-body/80">
                      <Users className="w-3.5 h-3.5 text-dourado" />
                      {culto.pessoas ? culto.pessoas.length : 0} participantes
                    </span>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center flex-wrap">
                  {onViewOnMap && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onViewOnMap(culto)}
                      className="text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-verde" />
                      <span>Mapa</span>
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onEditCulto(culto)}
                    className="text-xs flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-body" />
                    <span>Editar</span>
                  </Button>

                  {/* WhatsApp do Líder */}
                  {liderTelLimpo && (
                    <a
                      href={`https://wa.me/55${liderTelLimpo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp do Líder"
                      className="p-2 bg-verde/15 text-verde hover:bg-verde hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Líder</span>
                    </a>
                  )}

                  {/* WhatsApp do Anfitrião */}
                  {anfTelLimpo && (
                    <a
                      href={`https://wa.me/55${anfTelLimpo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp do Anfitrião"
                      className="p-2 bg-dourado/15 text-dourado hover:bg-dourado hover:text-preto rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Anfitrião</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
