import React, { useMemo, useState } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { STREETS } from './street-data';
import { setorBy, zoomAt } from '../../lib/geo';
import { Button } from '../ui/Button';

interface MapControlsProps {
  onZoom?: (factor: number) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ onZoom }) => {
  const {
    selectedSetor,
    vb,
    setVb,
    resetView,
    fitRegion,
    showStreets,
    setShowStreets,
    showLabels,
    setShowLabels,
    streetQuery,
    searchStreet,
    clearStreetSearch,
  } = useMapStore();

  const [inputVal, setInputVal] = useState(streetQuery);

  // Lista ordenada e desduplicada de ruas principais para autocompletar
  const streetOptions = useMemo(() => {
    const seen = new Set<string>();
    STREETS.ways.forEach((w) => {
      if (w[1] >= 0 && w[0] < 5) {
        seen.add(STREETS.names[w[1]]);
      }
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, []);

  const handleZoom = (factor: number) => {
    if (onZoom) {
      onZoom(factor);
    } else {
      const cx = vb[0] + vb[2] / 2;
      const cy = vb[1] + vb[3] / 2;
      setVb(zoomAt(vb, factor, cx, cy));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      searchStreet(inputVal);
    } else {
      clearStreetSearch();
    }
  };

  const handleClear = () => {
    setInputVal('');
    clearStreetSearch();
  };

  const currentSetorObj = selectedSetor ? setorBy[selectedSetor] : null;

  return (
    <div className="flex flex-col gap-2 p-3 bg-panel border-b border-line text-sm">
      {/* Barra Superior: Status do Setor Atual + Botões Rápidos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentSetorObj ? (
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: currentSetorObj.cor }}
              >
                {currentSetorObj.setor}
              </span>
              <div>
                <div className="font-medium text-ink">Setor {currentSetorObj.setor}</div>
                <div className="text-xs text-muted">{currentSetorObj.coord}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium text-ink">Cidade inteira</div>
              <div className="text-xs text-muted">Toque num setor para aproximar</div>
            </div>
          )}
        </div>

        {/* Botões de Ação de Visualização */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(0.65)}
            title="Aproximar (+)"
            aria-label="Aproximar"
          >
            +
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(1 / 0.65)}
            title="Afastar (-)"
            aria-label="Afastar"
          >
            −
          </Button>
          <Button
            type="button"
            variant={selectedSetor === null ? 'default' : 'ghost'}
            size="sm"
            onClick={() => resetView()}
          >
            Cidade
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fitRegion()}
            title="Ver limites regionais (15 km)"
          >
            Região (15km)
          </Button>
        </div>
      </div>

      {/* Barra Inferior: Busca de Ruas + Filtros Rápidos */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Formulário de Busca com Autocomplete */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-md">
          <input
            type="text"
            list="map-ruas-list"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (!e.target.value) clearStreetSearch();
            }}
            onBlur={() => {
              if (inputVal.trim()) searchStreet(inputVal);
            }}
            placeholder="Buscar rua ou avenida..."
            className="w-full h-8 pl-3 pr-8 text-xs rounded-full bg-chip text-ink border border-line focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde"
          />
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs p-0.5"
              title="Limpar busca"
            >
              ✕
            </button>
          )}
          <datalist id="map-ruas-list">
            {streetOptions.slice(0, 150).map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </form>

        {/* Toggles de Camadas */}
        <div className="flex items-center gap-3 text-xs text-ink select-none ml-auto">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-verde">
            <input
              type="checkbox"
              checked={showStreets}
              onChange={(e) => setShowStreets(e.target.checked)}
              className="accent-verde rounded"
            />
            <span>Ruas</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-verde">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-verde rounded"
            />
            <span>Bairros</span>
          </label>
        </div>
      </div>
    </div>
  );
};
