import type { Mapa } from './data/mapas';
import type { DefOnda } from './data/ondas';
import type { Mundo } from './estado';

/** Acesso compartilhado ao mundo atual (fora do React/Zustand). */
export const ref = {
  mundo: null as unknown as Mundo,
  mapa: null as unknown as Mapa,
  ondas: [] as DefOnda[],
  /** modo sem fim: depois da última onda, novas ondas são geradas em vez de vencer */
  endless: false,
  /** número de ondas da fase antes do modo sem fim (as infinitas vêm depois) */
  endlessBase: 0,
};

/** Estado de entrada de alta frequência (mouse). */
export const entrada: { mouse: { x: number; y: number } | null } = { mouse: null };
