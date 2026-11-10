import React from 'react';
import { CultoMarker } from '../../types/culto';
import { formatEndereco, toLL, gPin, gAddr, setorBy } from '../../lib/geo';
import { Button } from '../ui/Button';

interface CultoCardProps {
  culto: CultoMarker;
  isSelected: boolean;
  onSelect: (culto: CultoMarker) => void;
  onFocusOnMap: (culto: CultoMarker) => void;
  onEdit?: (culto: CultoMarker) => void;
}

/**
 * Converte número de telefone em link seguro do WhatsApp
 */
function toWhatsAppUrl(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${fullNumber}`;
}

export const CultoCard: React.FC<CultoCardProps> = ({
  culto,
  isSelected,
  onSelect,
  onFocusOnMap,
  onEdit,
}) => {
  const [lat, lng] = toLL(culto.x, culto.y);
  const setor = setorBy[culto.setor];
  const enderecoFormatado = formatEndereco(culto) || 'Endereço a definir';
  const liderWa = toWhatsAppUrl(culto.liderTel);
  const anfitriaoWa = toWhatsAppUrl(culto.anfTel || culto.telefone);

  const pessoas = Array.isArray(culto.pessoas) ? culto.pessoas : [];

  return (
    <article
      id={`culto-card-${culto.id}`}
      onClick={() => onSelect(culto)}
      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
        isSelected
          ? 'border-gold bg-creme/40 dark:bg-panel shadow-sm ring-1 ring-gold'
          : 'border-line hover:border-accent/40 bg-panel hover:bg-chip/50'
      }`}
      aria-current={isSelected ? 'true' : undefined}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-semibold text-sm text-ink leading-snug">
          {enderecoFormatado}
        </h4>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: setor?.cor || '#1D4225' }}
          title={`Setor ${culto.setor}`}
        >
          S{culto.setor}
        </span>
      </div>

      {/* Bairro e Referência */}
      <div className="text-[11px] text-muted mb-2 flex items-center gap-1.5 flex-wrap">
        <span className="font-medium text-ink/80">{culto.bairro || 'Bairro a definir'}</span>
        {culto.referencia && (
          <>
            <span>·</span>
            <span className="italic text-muted">{culto.referencia}</span>
          </>
        )}
      </div>

      {/* Grade de Informações de Liderança e Anfitrião */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-muted mb-2.5">
        {culto.lider && (
          <div className="truncate">
            Líder:{' '}
            <strong className="text-ink font-medium">{culto.lider}</strong>
            {liderWa && (
              <a
                href={liderWa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-verde hover:underline ml-1 font-sans"
                title="Conversar no WhatsApp com o líder"
              >
                (WhatsApp)
              </a>
            )}
          </div>
        )}

        {culto.anfitriao && (
          <div className="truncate">
            Anfitrião:{' '}
            <strong className="text-ink font-medium">{culto.anfitriao}</strong>
            {anfitriaoWa && (
              <a
                href={anfitriaoWa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-verde hover:underline ml-1 font-sans"
                title="Conversar no WhatsApp com o anfitrião"
              >
                (WhatsApp)
              </a>
            )}
          </div>
        )}

        {culto.horario && (
          <div>
            Horário: <strong className="text-ink font-medium">{culto.horario}</strong>
          </div>
        )}

        {pessoas.length > 0 && (
          <div>
            Pessoas: <strong className="text-ink font-medium">{pessoas.length}</strong>
          </div>
        )}
      </div>

      {/* Participantes Colapsáveis */}
      {pessoas.length > 0 && (
        <details
          className="group text-[11px] text-muted mb-2.5 bg-chip/50 rounded-lg p-1.5 border border-line/60"
          onClick={(e) => e.stopPropagation()}
        >
          <summary className="cursor-pointer select-none font-medium hover:text-ink">
            {pessoas.length} {pessoas.length === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}
          </summary>
          <ol className="list-decimal list-inside pl-1 pt-1.5 space-y-0.5 text-[11px] text-ink">
            {pessoas.map((p, idx) => (
              <li key={idx} className="truncate">{p}</li>
            ))}
          </ol>
        </details>
      )}

      {/* Observações */}
      {culto.obs && (
        <p className="text-[11px] italic text-muted mb-2.5 line-clamp-2">
          &ldquo;{culto.obs}&rdquo;
        </p>
      )}

      {/* Barra de Ações: Ver no Mapa e Rotas */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-line/60 flex-wrap">
        <Button
          type="button"
          variant={isSelected ? 'default' : 'ghost'}
          size="sm"
          className="h-6 text-[10px] px-2.5"
          onClick={(e) => {
            e.stopPropagation();
            onFocusOnMap(culto);
          }}
        >
          Ver no mapa
        </Button>

        <a
          href={gAddr(`${enderecoFormatado}, ${culto.bairro || ''}, Mossoró - RN`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-verde hover:underline px-1 py-0.5"
        >
          Google Maps
        </a>

        <span className="text-muted text-[10px]">·</span>

        <a
          href={gPin(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-verde hover:underline px-1 py-0.5"
        >
          Ponto GPS
        </a>

        {onEdit && (
          <>
            <span className="text-muted text-[10px]">·</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(culto);
              }}
              className="text-[10px] text-accent hover:underline px-1 py-0.5 font-medium ml-auto"
            >
              Editar
            </button>
          </>
        )}
      </div>
    </article>
  );
};
