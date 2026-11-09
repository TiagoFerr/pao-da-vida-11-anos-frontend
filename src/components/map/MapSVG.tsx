import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GEO, LAND } from './map-data';
import { STREETS } from './street-data';
import {
  toSvg,
  bairroAt,
  nearestStreet,
  zoomAt,
  wayD,
  txtOn,
  KM,
  formatEndereco,
  setorBy,
} from '../../lib/geo';
import { useMapStore } from '../../stores/useMapStore';

export interface CultoMarker {
  id: string;
  setor: number;
  x: number;
  y: number;
  rua?: string;
  numero?: string;
  bairro?: string;
  lider?: string;
  anfitriao?: string;
  pessoas?: string[];
  horario?: string;
  obs?: string;
}

interface MapSVGProps {
  cultos?: CultoMarker[];
  onSelectCulto?: (id: string) => void;
  onPickLocation?: (data: {
    x: number;
    y: number;
    setor: number;
    bairro: string;
    rua: string;
  }) => void;
}

const HOUSE_PATH = 'M0,-15 L13,-3 L10,-3 L10,11 L-10,11 L-10,-3 L-13,-3 Z';
const HEART_PATH =
  'M0,9 C-1,8 -7.5,3.6 -7.5,-0.4 C-7.5,-3.2 -5.4,-5 -3.3,-5 C-1.8,-5 -0.6,-4.2 0,-3 C0.6,-4.2 1.8,-5 3.3,-5 C5.4,-5 7.5,-3.2 7.5,-0.4 C7.5,3.6 1,8 0,9 Z';

const [LCX, LCY, LR] = LAND._c || [500, 560, 560];

export const MapSVG: React.FC<MapSVGProps> = ({
  cultos = [],
  onSelectCulto,
  onPickLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    selectedSetor,
    selectedCultoId,
    vb,
    setVb,
    selectSetor,
    selectCulto,
    showStreets,
    showLabels,
    highlightedWaysD,
    picking,
    pendingPin,
    showTooltip,
    hideTooltip,
    setScaleWidth,
  } = useMapStore();

  // Escala atual (unidades de mapa por pixel)
  const upp = useMemo(() => {
    if (!containerRef.current) return 1;
    const r = containerRef.current.getBoundingClientRect();
    return Math.max(vb[2] / (r.width || 1), vb[3] / (r.height || 1)) || 1;
  }, [vb]);

  // Atualiza largura da escala no store
  useEffect(() => {
    setScaleWidth(Math.max(12, Math.min(220, KM / upp)));
  }, [upp, setScaleWidth]);

  // Precalcula caminhos otimizados da malha viária
  const { streetCasingPaths, streetFillPaths, streetLabelsList } = useMemo(() => {
    const byC: string[][] = [[], [], [], [], [], [], []];
    STREETS.ways.forEach((w) => {
      if (w[0] >= 0 && w[0] < byC.length) {
        byC[w[0]].push(wayD(w[2]));
      }
    });

    const casingPaths = [4, 3, 2, 1, 0]
      .filter((c) => byC[c]?.length)
      .map((c) => ({ tier: c, d: byC[c].join('') }));

    const fillPaths = [6, 5, 4, 3, 2, 1, 0]
      .filter((c) => byC[c]?.length)
      .map((c) => ({ tier: c, d: byC[c].join('') }));

    // Melhores caminhos para rótulos curvos de ruas
    const len = (p: number[]) => {
      let L = 0;
      for (let i = 2; i < p.length; i += 2) {
        L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
      }
      return L / 2;
    };

    const best: Record<number, { w: [number, number, number[]]; L: number }> = {};
    STREETS.ways.forEach((w) => {
      if (w[1] < 0) return;
      const L = len(w[2]);
      const k = w[1];
      if (!best[k] || L > best[k].L) {
        best[k] = { w, L };
      }
    });

    const labelsList = Object.values(best)
      .map(({ w, L }, idx) => {
        const tier = w[0] === 5 ? 1 : Math.min(w[0], 4);
        if (tier === 4 && L < 22) return null;
        let p = w[2].slice();
        if (p[p.length - 2] < p[0]) {
          const r: number[] = [];
          for (let j = p.length - 2; j >= 0; j -= 2) {
            r.push(p[j], p[j + 1]);
          }
          p = r;
        }
        const name = STREETS.names[w[1]];
        return {
          id: `sp-${idx}`,
          d: wayD(p),
          tier,
          name,
          L,
          nameLength: name.length,
        };
      })
      .filter(Boolean) as {
      id: string;
      d: string;
      tier: number;
      name: string;
      L: number;
      nameLength: number;
    }[];

    return {
      streetCasingPaths: casingPaths,
      streetFillPaths: fillPaths,
      streetLabelsList: labelsList,
    };
  }, []);

  // Determina nível de zoom para rótulos de ruas
  const zoomLevelClass = useMemo(() => {
    const w = vb[2];
    if (w < 230) return 'z4 z3 z2 z1';
    if (w < 420) return 'z3 z2 z1';
    if (w < 700) return 'z2 z1';
    if (w < 1000) return 'z1';
    return '';
  }, [vb]);

  // Gestão de Ponteiro: Pan / Drag / Pinch
  const pointerState = useRef<{
    pointers: Map<number, { x: number; y: number }>;
    pinchDist: number | null;
    moved: boolean;
    lastPos: { x: number; y: number };
  }>({
    pointers: new Map(),
    pinchDist: null,
    moved: false,
    lastPos: { x: 0, y: 0 },
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const state = pointerState.current;
    state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    state.moved = false;
    state.lastPos = { x: e.clientX, y: e.clientY };

    if (state.pointers.size === 2) {
      const pts = Array.from(state.pointers.values());
      state.pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = pointerState.current;
      if (!state.pointers.has(e.pointerId)) return;
      state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Pinch to Zoom com 2 dedos
      if (state.pointers.size === 2 && state.pinchDist && containerRef.current) {
        const pts = Array.from(state.pointers.values());
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const rect = containerRef.current.getBoundingClientRect();
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        const [cx, cy] = toSvg(midX, midY, vb, rect);

        setVb(zoomAt(vb, state.pinchDist / d, cx, cy));
        state.pinchDist = d;
        state.moved = true;
        hideTooltip();
        return;
      }

      // Drag / Pan com 1 ponteiro
      const dx = e.clientX - state.lastPos.x;
      const dy = e.clientY - state.lastPos.y;

      if (Math.abs(dx) + Math.abs(dy) > 4 || state.moved) {
        state.moved = true;
        hideTooltip();
        const s = upp;
        setVb([vb[0] - dx * s, vb[1] - dy * s, vb[2], vb[3]]);
        state.lastPos = { x: e.clientX, y: e.clientY };
      }
    },
    [vb, upp, setVb, hideTooltip]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const state = pointerState.current;
    state.pointers.delete(e.pointerId);
    if (state.pointers.size < 2) {
      state.pinchDist = null;
    }
  }, []);

  // Wheel zoom centrado no cursor do mouse
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const [cx, cy] = toSvg(e.clientX, e.clientY, vb, rect);
      const factor = Math.exp(e.deltaY * 0.0015);
      setVb(zoomAt(vb, factor, cx, cy));
      hideTooltip();
    },
    [vb, setVb, hideTooltip]
  );

  // Clique no canvas SVG (normal ou modo picking)
  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      if (pointerState.current.moved) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const [x, y] = toSvg(e.clientX, e.clientY, vb, rect);

      if (picking) {
        const b = bairroAt(x, y);
        const rua = nearestStreet(x, y);
        const snappedX = +x.toFixed(1);
        const snappedY = +y.toFixed(1);

        onPickLocation?.({
          x: snappedX,
          y: snappedY,
          setor: b.setor,
          bairro: b.nome,
          rua,
        });
        return;
      }

      // Clique em área vazia desmarca seleção se não clicou em elemento específico
      if (e.target === svgRef.current) {
        selectSetor(null);
        selectCulto(null);
      }
    },
    [picking, vb, onPickLocation, selectSetor, selectCulto]
  );

  const isDimmed = selectedSetor !== null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleSvgClick}
      className={`relative w-full h-[min(74vh,800px)] min-h-[420px] select-none touch-none overflow-hidden bg-bg transition-colors ${
        picking ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <svg
        ref={svgRef}
        viewBox={vb.map((v) => v.toFixed(2)).join(' ')}
        className={`w-full h-full block ${isDimmed ? 'dim' : ''} ${
          !showStreets ? 'nostreets' : ''
        } ${showLabels ? 'showlabels' : ''} ${zoomLevelClass}`}
        role="img"
        aria-label="Mapa cartográfico dos cultos nos lares com 14 setores"
      >
        <defs>
          {/* Gradiente Radial para desvanecimento suave das bordas */}
          <radialGradient
            id="fadeG"
            cx={LCX}
            cy={LCY}
            r={LR * 1.02}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.84" className="fade0" />
            <stop offset="1.0" className="fade1" />
          </radialGradient>

          {/* Definições de caminhos curvos para nomes de ruas */}
          {showStreets &&
            streetLabelsList.map((item) => (
              <path key={item.id} id={item.id} d={item.d} />
            ))}
        </defs>

        <g id="mapRoot">
          {/* Camada de Base Geográfica: Terra e Cobertura do Solo */}
          <g id="gLand" className="pointer-events-none">
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

          {/* Contorno do Território Municipal */}
          <path d={GEO.contorno} className="land" />

          {/* Células dos Bairros (Interativas para Seleção de Setor) */}
          <g id="gCells">
            {GEO.bairros.map((b) => {
              const s = setorBy[b.setor];
              const isSelected = selectedSetor === b.setor;
              return (
                <path
                  key={`${b.setor}-${b.nome}`}
                  d={b.d}
                  fill={s?.cor || '#1D4225'}
                  className={`cell ${isSelected ? 'sel' : ''}`}
                  onPointerMove={(e) => {
                    if (picking) return;
                    const r = containerRef.current?.getBoundingClientRect();
                    if (!r) return;
                    let x = e.clientX - r.left + 14;
                    let y = e.clientY - r.top + 14;
                    if (x + 260 > r.width) x -= 280;
                    if (y + 110 > r.height) y -= 120;
                    showTooltip({
                      x,
                      y,
                      title: b.nome,
                      subtitle: `Setor ${s.setor} · ${s.coord}`,
                    });
                  }}
                  onPointerLeave={hideTooltip}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pointerState.current.moved || picking) return;
                    selectSetor(b.setor);
                  }}
                />
              );
            })}
          </g>

          {/* Malha Viária Otimizada em Casings e Fills */}
          {showStreets && (
            <g id="gStreets" className="streets">
              {streetCasingPaths.map((c) => (
                <path key={`rc-${c.tier}`} d={c.d} className={`rd rc c${c.tier}`} />
              ))}
              {streetFillPaths.map((f) => (
                <path key={`rf-${f.tier}`} d={f.d} className={`rd rf c${f.tier}`} />
              ))}
            </g>
          )}

          {/* Desvanecimento Radial das Bordas */}
          <rect
            x={LCX - LR * 4}
            y={LCY - LR * 4}
            width={LR * 8}
            height={LR * 8}
            fill="url(#fadeG)"
            className="pointer-events-none"
          />

          {/* Destaque de Rua Pesquisada */}
          {highlightedWaysD && (
            <g id="gHl">
              <path d={highlightedWaysD} className="hlst" />
            </g>
          )}

          {/* Linhas de Fronteira dos 14 Setores */}
          <g id="gSec">
            {GEO.setores.map((s) => (
              <path
                key={`sec-${s.setor}`}
                d={s.d}
                stroke={s.cor}
                className={`sec ${selectedSetor === s.setor ? 'sel' : ''}`}
              />
            ))}
          </g>

          {/* Pontos Centrais dos Bairros */}
          <g id="gDots">
            {GEO.bairros.map((b) => {
              const s = setorBy[b.setor];
              return (
                <circle
                  key={`dot-${b.nome}`}
                  cx={b.x}
                  cy={b.y}
                  r={Math.max(2.5, 4 * upp)}
                  fill={s?.cor || '#1D4225'}
                  className="dot"
                />
              );
            })}
          </g>

          {/* Rótulos de Ruas em TextPath */}
          {showStreets && (
            <g
              id="gNames"
              className="snames"
              style={{
                fontSize: `${(11 * upp).toFixed(2)}px`,
                strokeWidth: `${(3.2 * upp).toFixed(2)}px`,
              }}
            >
              {streetLabelsList.map((item) => {
                const isTooLong = item.nameLength * 6.3 * upp > item.L * 0.92;
                return (
                  <text
                    key={`label-${item.id}`}
                    className={`t${item.tier} ${isTooLong ? 'long' : ''}`}
                  >
                    <textPath
                      href={`#${item.id}`}
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      {item.name}
                    </textPath>
                  </text>
                );
              })}
            </g>
          )}

          {/* Nomes dos Bairros */}
          <g id="gLbl">
            {GEO.bairros.map((b) => {
              const isSelected = selectedSetor === b.setor;
              return (
                <text
                  key={`lbl-${b.nome}`}
                  x={b.x + 8 * upp}
                  y={b.y - 7 * upp}
                  transform={`translate(0, 0)`}
                  style={{ fontSize: `${12.5 * upp}px`, strokeWidth: `${4 * upp}px` }}
                  className={`blabel ${isSelected ? 'on' : ''}`}
                >
                  {b.nome}
                </text>
              );
            })}
          </g>

          {/* Badges Circulares dos Setores com Número */}
          <g id="gBadge">
            {GEO.setores.map((s) => {
              const isSelected = selectedSetor === s.setor;
              return (
                <g
                  key={`badge-${s.setor}`}
                  transform={`translate(${s.lx} ${s.ly}) scale(${upp.toFixed(4)})`}
                  className={`badge ${isSelected ? 'sel' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Setor ${s.setor}, ${s.coord}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pointerState.current.moved || picking) return;
                    selectSetor(s.setor);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectSetor(s.setor);
                    }
                  }}
                >
                  <circle cx={0} cy={0} r={15} fill={s.cor} />
                  <text x={0} y={1} fill={txtOn(s.cor)}>
                    {s.setor}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Marcadores dos Cultos nos Lares */}
          <g id="gHouse">
            {cultos.map((c) => {
              const isSelectedSetor = selectedSetor === null || c.setor === selectedSetor;
              const isFocused = selectedCultoId === c.id;
              return (
                <g
                  key={c.id}
                  transform={`translate(${c.x} ${c.y}) scale(${upp.toFixed(4)})`}
                  className={`house ${isSelectedSetor ? 'sel' : ''} ${
                    isFocused ? 'hl' : ''
                  }`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Culto em ${formatEndereco(c) || 'Endereço a definir'}`}
                  onPointerMove={(e) => {
                    if (picking) return;
                    const r = containerRef.current?.getBoundingClientRect();
                    if (!r) return;
                    let x = e.clientX - r.left + 14;
                    let y = e.clientY - r.top + 14;
                    if (x + 280 > r.width) x -= 295;
                    if (y + 130 > r.height) y -= 140;

                    showTooltip({
                      x,
                      y,
                      title: formatEndereco(c) || 'Endereço a definir',
                      subtitle: `${c.bairro ? `${c.bairro}, ` : ''}Setor ${c.setor}`,
                      details: [
                        c.lider ? `Líder: ${c.lider}` : null,
                        c.anfitriao ? `Anfitrião: ${c.anfitriao}` : null,
                        c.pessoas?.length ? `${c.pessoas.length} pessoas` : null,
                        c.horario || null,
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    });
                  }}
                  onPointerLeave={hideTooltip}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pointerState.current.moved || picking) return;
                    selectCulto(c.id);
                    onSelectCulto?.(c.id);
                  }}
                >
                  <circle cx={0} cy={-1.5} r={19} className="hc" />
                  <path d={HOUSE_PATH} className="hs" />
                  <path d={HOUSE_PATH} className="hb" />
                  <path
                    d={HEART_PATH}
                    className="hh"
                    transform="translate(0 3.6) scale(0.78)"
                  />
                </g>
              );
            })}
          </g>

          {/* Marcador Fantasma (Ghost Pin ao selecionar ponto) */}
          {pendingPin && (
            <g
              id="gGhost"
              className="ghost"
              transform={`translate(${pendingPin.x} ${pendingPin.y}) scale(${(
                upp * 1.2
              ).toFixed(4)})`}
            >
              <path d={HOUSE_PATH} />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
