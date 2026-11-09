import React, { useRef, useState, useMemo, useCallback } from 'react';
import { GEO, LAND } from './map-data';
import { STREETS } from './street-data';
import { HOME, bairroAt, nearestStreet, wayD } from '../../lib/geo';

interface MiniMapProps {
  pin: { x: number; y: number } | null;
  onPinChange: (location: {
    x: number;
    y: number;
    setor: number;
    bairro: string;
    rua: string;
  }) => void;
  className?: string;
}

const HOUSE_PATH = 'M0,-15 L13,-3 L10,-3 L10,11 L-10,11 L-10,-3 L-13,-3 Z';
const HEART_PATH =
  'M0,9 C-1,8 -7.5,3.6 -7.5,-0.4 C-7.5,-3.2 -5.4,-5 -3.3,-5 C-1.8,-5 -0.6,-4.2 0,-3 C0.6,-4.2 1.8,-5 3.3,-5 C5.4,-5 7.5,-3.2 7.5,-0.4 C7.5,3.6 1,8 0,9 Z';

const [LCX, LCY, LR] = LAND._c || [500, 560, 560];

export const MiniMap: React.FC<MiniMapProps> = ({
  pin,
  onPinChange,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [miniW, setMiniW] = useState(170);

  // Precalcula caminhos principais de ruas para visualização rápida no mini-mapa
  const streetPaths = useMemo(() => {
    const casing: string[] = [];
    const fill: string[] = [];

    STREETS.ways.forEach((w) => {
      if (w[0] <= 3) {
        const d = wayD(w[2]);
        casing.push(d);
        fill.push(d);
      }
    });

    return {
      casingD: casing.join(''),
      fillD: fill.join(''),
    };
  }, []);

  // Calcula viewBox dinâmico em torno do pino
  const viewBoxStr = useMemo(() => {
    if (!pin) return HOME.join(' ');
    // Proporção 2:1 padrão para mini-mapa
    const h = miniW / 2;
    return `${pin.x - miniW / 2} ${pin.y - h / 2} ${miniW} ${h}`;
  }, [pin, miniW]);

  // Fator de escala para tamanho do pino
  const pinScale = (miniW / 360) * 1.35;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMiniW((prev) => Math.max(50, prev / 1.6));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMiniW((prev) => Math.min(900, prev * 1.6));
  };

  const handleMapClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const svg = svgRef.current;
      const m = svg.getScreenCTM();
      if (!m) return;

      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const snappedX = +p.x.toFixed(1);
      const snappedY = +p.y.toFixed(1);

      const b = bairroAt(snappedX, snappedY);
      const rua = nearestStreet(snappedX, snappedY);

      onPinChange({
        x: snappedX,
        y: snappedY,
        setor: b.setor,
        bairro: b.nome,
        rua,
      });
    },
    [onPinChange]
  );

  return (
    <div
      className={`relative w-full h-[190px] border border-line rounded-xl overflow-hidden bg-bg shadow-inner select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        onClick={handleMapClick}
        className="w-full h-full block cursor-crosshair"
        role="img"
        aria-label="Mini-mapa para ajuste de localização do endereço"
      >
        {/* Camada Geográfica de Solo */}
        <g id="gMiniLand" className="pointer-events-none">
          <circle cx={LCX} cy={LCY} r={LR * 1.02} className="terra" />
          {LAND.roca && <path d={LAND.roca} className="lc lc-roca" />}
          {LAND.pomar && <path d={LAND.pomar} className="lc lc-pomar" />}
          {LAND.campo && <path d={LAND.campo} className="lc lc-campo" />}
          {LAND.caatinga && <path d={LAND.caatinga} className="lc lc-caatinga" />}
          {LAND.mata && <path d={LAND.mata} className="lc lc-mata" />}
          {LAND.urbano && <path d={LAND.urbano} className="lc lc-urbano" />}
          {LAND.industria && <path d={LAND.industria} className="lc lc-industria" />}
          {LAND.parque && <path d={LAND.parque} className="lc lc-parque" />}
          {LAND.brejo && <path d={LAND.brejo} className="lc lc-brejo" />}
          {LAND.areia && <path d={LAND.areia} className="lc lc-areia" />}
          {LAND.salina && <path d={LAND.salina} className="lc lc-salina" />}
          {LAND.agua && <path d={LAND.agua} className="lc lc-agua" />}
        </g>

        {/* Polígonos de Bairros */}
        <g id="gMiniCells" className="pointer-events-none">
          {GEO.bairros.map((b) => (
            <path
              key={`mini-cell-${b.nome}`}
              d={b.d}
              fill="var(--panel)"
              className="cell"
            />
          ))}
        </g>

        {/* Ruas Principais */}
        <g id="gMiniStreets" className="streets pointer-events-none">
          {streetPaths.casingD && (
            <path d={streetPaths.casingD} className="rd rc c2" />
          )}
          {streetPaths.fillD && (
            <path d={streetPaths.fillD} className="rd rf c2" />
          )}
        </g>

        {/* Linhas de Setor */}
        <g id="gMiniSec" className="pointer-events-none">
          {GEO.setores.map((s) => (
            <path
              key={`mini-sec-${s.setor}`}
              d={s.d}
              stroke={s.cor}
              className="sec"
            />
          ))}
        </g>

        {/* Pino Marcador Ativo */}
        {pin && (
          <g
            className="minipin"
            transform={`translate(${pin.x} ${pin.y}) scale(${pinScale.toFixed(4)})`}
          >
            <circle r={22} className="pulse" />
            <circle cx={0} cy={-1.5} r={19} className="hc" />
            <path d={HOUSE_PATH} className="hs" />
            <path d={HOUSE_PATH} className="hb" />
            <path
              d={HEART_PATH}
              className="hh"
              transform="translate(0 3.6) scale(0.78)"
            />
          </g>
        )}
      </svg>

      {/* Controles de Zoom Integrados */}
      <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Aproximar mini-mapa"
          className="w-7 h-7 flex items-center justify-center rounded-md bg-panel/90 text-ink text-sm font-semibold border border-line shadow-sm hover:bg-chip active:scale-95 transition-transform"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Afastar mini-mapa"
          className="w-7 h-7 flex items-center justify-center rounded-md bg-panel/90 text-ink text-sm font-semibold border border-line shadow-sm hover:bg-chip active:scale-95 transition-transform"
        >
          −
        </button>
      </div>

      {/* Dica de Ação */}
      <div className="absolute bottom-1.5 left-2 text-[10px] text-muted bg-panel/85 px-2 py-0.5 rounded-full border border-line/60 pointer-events-none">
        Clique para ajustar a posição
      </div>
    </div>
  );
};
