import { GEO, BairroGeo, SetorGeo } from '../components/map/map-data';
import { STREETS } from '../components/map/street-data';

export const KM = 80.9;
export const META_GOAL = 120;

// Land world dimensions
const [LCX, LCY, LR] = [500, 560, 560]; // From LAND._c or GEO
export const WORLD: [number, number, number, number] = [LCX - LR, LCY - LR, 2 * LR, 2 * LR];
export const HOME: [number, number, number, number] = [...GEO.view] as [number, number, number, number];

export const setorBy = Object.fromEntries(
  GEO.setores.map((s) => [s.setor, s])
) as Record<number, SetorGeo>;

export const bairroByName = Object.fromEntries(
  GEO.bairros.map((b) => [b.nome, b])
) as Record<string, BairroGeo>;

/**
 * Normaliza strings removendo acentos e convertendo para minúsculas
 */
export function norm(t: string | null | undefined): string {
  return String(t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Converte coordenadas SVG do mapa para Latitude e Longitude [lat, lng]
 */
export function toLL(x: number, y: number): [number, number] {
  return [-5.115 - y / 9000, x / (Math.cos((-5.188 * Math.PI) / 180) * 9000) - 37.4];
}

/**
 * Converte coordenadas de tela (clientX, clientY) para coordenadas do mapa SVG
 */
export function toSvg(
  px: number,
  py: number,
  vb: [number, number, number, number],
  rect: { left: number; top: number; width: number; height: number }
): [number, number] {
  const [x, y, w, h] = vb;
  const s = Math.max(w / rect.width, h / rect.height);
  const ox = (rect.width * s - w) / 2;
  const oy = (rect.height * s - h) / 2;
  return [x - ox + (px - rect.left) * s, y - oy + (py - rect.top) * s];
}

export function f6(v: number): string {
  return v.toFixed(6);
}

export function gPin(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${f6(lat)}%2C${f6(lng)}`;
}

export function gAddr(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function formatEndereco(c: { rua?: string; numero?: string }): string {
  return [c.rua, c.numero].filter(Boolean).join(', ');
}

/**
 * Calcula luminância de cor hex para contraste de texto
 */
export function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function txtOn(hex: string): '#16231A' | '#FFFFFF' {
  return lum(hex) > 0.28 ? '#16231A' : '#FFFFFF';
}

/**
 * Converte array flat de coordenadas [x0, y0, x1, y1...] em path SVG 'M...L...'
 */
export function wayD(p: number[]): string {
  let d = 'M' + p[0] / 2 + ',' + p[1] / 2;
  for (let i = 2; i < p.length; i += 2) {
    d += 'L' + p[i] / 2 + ',' + p[i + 1] / 2;
  }
  return d;
}

/**
 * Encontra a rua mais próxima de (x, y) no mapa
 */
export function nearestStreet(x: number, y: number, maxDist = 14): string {
  let best: [number, number, number[]] | null = null;
  let bd = Infinity;
  const X = x * 2;
  const Y = y * 2;

  for (const w of STREETS.ways) {
    if (w[1] < 0 || w[0] >= 5) continue;
    const p = w[2];
    for (let i = 2; i < p.length; i += 2) {
      const ax = p[i - 2],
        ay = p[i - 1],
        bx = p[i],
        by = p[i + 1],
        dx = bx - ax,
        dy = by - ay;
      const t = Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / (dx * dx + dy * dy || 1)));
      const d = (X - ax - t * dx) ** 2 + (Y - ay - t * dy) ** 2;
      if (d < bd) {
        bd = d;
        best = w;
      }
    }
  }

  return best && Math.sqrt(bd) / 2 < maxDist ? STREETS.names[best[1]] : '';
}

/**
 * Parse SVG polygon path M x y L x y ... Z
 */
function parsePolygon(d: string): [number, number][] {
  const points: [number, number][] = [];
  const matches = d.matchAll(/([ML])\s*(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/gi);
  for (const m of matches) {
    points.push([parseFloat(m[2]), parseFloat(m[3])]);
  }
  return points;
}

const parsedBairros = GEO.bairros.map((b) => ({
  bairro: b,
  ring: parsePolygon(b.d),
}));

export function pointInPolygon(px: number, py: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Encontra o bairro que contém as coordenadas (x, y)
 */
export function bairroAt(x: number, y: number): BairroGeo {
  // 1. Ray-casting point-in-polygon
  for (const item of parsedBairros) {
    if (pointInPolygon(x, y, item.ring)) {
      return item.bairro;
    }
  }

  // 2. Fallback para bairro com centróide mais próximo
  let best = GEO.bairros[0];
  let bd = Infinity;
  for (const b of GEO.bairros) {
    const d = (b.x - x) ** 2 + (b.y - y) ** 2;
    if (d < bd) {
      bd = d;
      best = b;
    }
  }
  return best;
}

/**
 * Calcula viewBox para enquadrar uma bounding box com padding e proporção de tela
 */
export function fitBox(
  b: [number, number, number, number],
  pad = 0.14,
  minSize = 420,
  aspectRatio = 1.33
): [number, number, number, number] {
  let [x, y, w, h] = b;
  if (w < minSize) {
    x -= (minSize - w) / 2;
    w = minSize;
  }
  if (h < minSize) {
    y -= (minSize - h) / 2;
    h = minSize;
  }

  x -= w * pad;
  y -= h * pad;
  w *= 1 + 2 * pad;
  h *= 1 + 2 * pad;

  if (w / h < aspectRatio) {
    const nw = h * aspectRatio;
    x -= (nw - w) / 2;
    w = nw;
  } else {
    const nh = w / aspectRatio;
    y -= (nh - h) / 2;
    h = nh;
  }

  return [x, y, w, h];
}

/**
 * Aplica zoom centrado em (cx, cy)
 */
export function zoomAt(
  vb: [number, number, number, number],
  f: number,
  cx: number,
  cy: number,
  maxW = WORLD[2] * 1.25,
  minW = 60
): [number, number, number, number] {
  const [x, y, w, h] = vb;
  const nw = Math.min(Math.max(w * f, minW), maxW);
  const k = nw / w;
  return [cx - (cx - x) * k, cy - (cy - y) * k, w * k, h * k];
}

/**
 * Filtra ways da malha viária pelo nome da rua
 */
export function streetWays(q: string): [number, number, number[]][] {
  const n = norm(q).trim();
  if (n.length < 3) return [];
  let w = STREETS.ways.filter((x) => x[1] >= 0 && x[0] < 5 && norm(STREETS.names[x[1]]) === n);
  if (!w.length) {
    w = STREETS.ways.filter((x) => x[1] >= 0 && x[0] < 5 && norm(STREETS.names[x[1]]).endsWith(' ' + n));
  }
  if (!w.length && n.length >= 4) {
    w = STREETS.ways.filter((x) => x[1] >= 0 && x[0] < 5 && norm(STREETS.names[x[1]]).includes(n));
  }
  return w;
}

/**
 * Afasta ligeiramente marcadores que caem no mesmo ponto (spread espiral)
 */
export function spread(
  x: number,
  y: number,
  existingCultos: { x: number; y: number; id?: string }[] = [],
  excludeId?: string
): { x: number; y: number } {
  const near = existingCultos.filter(
    (c) => (!excludeId || c.id !== excludeId) && Math.hypot(c.x - x, c.y - y) < 3
  ).length;

  if (!near) return { x, y };
  const a = near * 2.4;
  const r = 5 + near * 1.5;
  return {
    x: +(x + Math.cos(a) * r).toFixed(1),
    y: +(y + Math.sin(a) * r).toFixed(1),
  };
}
