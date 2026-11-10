import { create } from 'zustand';
import { HOME, fitBox, WORLD, setorBy, streetWays, wayD } from '../lib/geo';

export interface TooltipData {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  details?: string;
}

interface MapState {
  selectedSetor: number | null;
  selectedCultoId: string | null;
  vb: [number, number, number, number];
  showStreets: boolean;
  showLabels: boolean;
  streetQuery: string;
  highlightedWaysD: string;
  picking: boolean;
  pendingPin: { x: number; y: number } | null;
  tooltip: TooltipData | null;
  scaleWidth: number;

  // Actions
  selectSetor: (setor: number | null, containerAspect?: number) => void;
  selectCulto: (id: string | null) => void;
  focusCulto: (
    culto: { id: string; setor: number; x: number; y: number },
    containerAspect?: number
  ) => void;
  setVb: (vb: [number, number, number, number]) => void;
  resetView: (containerAspect?: number) => void;
  fitRegion: (containerAspect?: number) => void;
  setShowStreets: (show: boolean) => void;
  setShowLabels: (show: boolean) => void;
  searchStreet: (query: string, containerAspect?: number) => boolean;
  clearStreetSearch: () => void;
  setPicking: (picking: boolean) => void;
  setPendingPin: (pin: { x: number; y: number } | null) => void;
  showTooltip: (data: TooltipData) => void;
  hideTooltip: () => void;
  setScaleWidth: (width: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  selectedSetor: null,
  selectedCultoId: null,
  vb: [...HOME] as [number, number, number, number],
  showStreets: true,
  showLabels: false,
  streetQuery: '',
  highlightedWaysD: '',
  picking: false,
  pendingPin: null,
  tooltip: null,
  scaleWidth: 80,

  selectSetor: (setor, containerAspect = 1.33) => {
    if (setor === null) {
      set({
        selectedSetor: null,
        vb: fitBox(HOME, 0, 420, containerAspect),
      });
    } else {
      const s = setorBy[setor];
      if (s) {
        set({
          selectedSetor: setor,
          vb: fitBox(s.bbox, 0.14, 420, containerAspect),
        });
      }
    }
  },

  selectCulto: (id) => set({ selectedCultoId: id }),

  focusCulto: (culto, containerAspect = 1.33) => {
    const bbox: [number, number, number, number] = [
      culto.x - 60,
      culto.y - 60,
      120,
      120,
    ];
    set({
      selectedCultoId: culto.id,
      selectedSetor: culto.setor,
      vb: fitBox(bbox, 0.05, 140, containerAspect),
    });
  },

  setVb: (vb) => set({ vb }),

  resetView: (containerAspect = 1.33) => {
    set({
      selectedSetor: null,
      vb: fitBox(HOME, 0, 420, containerAspect),
      highlightedWaysD: '',
      streetQuery: '',
    });
  },

  fitRegion: (containerAspect = 1.33) => {
    set({
      selectedSetor: null,
      vb: fitBox(WORLD, 0.02, 0, containerAspect),
    });
  },

  setShowStreets: (showStreets) => set({ showStreets }),
  setShowLabels: (showLabels) => set({ showLabels }),

  searchStreet: (query, containerAspect = 1.33) => {
    const trimmed = query.trim();
    if (!trimmed) {
      get().clearStreetSearch();
      return false;
    }

    let ways = streetWays(trimmed);
    if (!ways.length) {
      return false;
    }

    const firstIndex = ways[0][1];
    ways = ways.filter((w) => w[1] === firstIndex);

    const d = ways.map((w) => wayD(w[2])).join('');

    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    ways.forEach((w) => {
      for (let i = 0; i < w[2].length; i += 2) {
        const x = w[2][i] / 2;
        const y = w[2][i + 1] / 2;
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    });

    const bbox: [number, number, number, number] = [x0, y0, x1 - x0, y1 - y0];
    const newVb = fitBox(bbox, 0.16, 160, containerAspect);

    set({
      streetQuery: trimmed,
      highlightedWaysD: d,
      vb: newVb,
    });
    return true;
  },

  clearStreetSearch: () =>
    set({
      streetQuery: '',
      highlightedWaysD: '',
    }),

  setPicking: (picking) => set({ picking }),
  setPendingPin: (pendingPin) => set({ pendingPin }),

  showTooltip: (tooltip) => set({ tooltip }),
  hideTooltip: () => set({ tooltip: null }),
  setScaleWidth: (scaleWidth) => set({ scaleWidth }),
}));
