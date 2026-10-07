import type { Mapa } from './data/mapas';
import type { Mundo } from './estado';

/** Acesso compartilhado ao mundo atual (fora do React/Zustand). */
export const ref = { mundo: null as unknown as Mundo, mapa: null as unknown as Mapa };

/** Estado de entrada de alta frequência (mouse). */
export const entrada: { mouse: { x: number; y: number } | null } = { mouse: null };
