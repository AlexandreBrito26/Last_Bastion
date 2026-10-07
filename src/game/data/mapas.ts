import type { Vec } from '../../core/vec';

export interface Mapa {
  nome: string;
  largura: number;
  altura: number;
  larguraTrilha: number;
  waypoints: Vec[];
}

export const MAPA_1: Mapa = {
  nome: 'Trilha Inicial',
  largura: 960,
  altura: 540,
  larguraTrilha: 44,
  waypoints: [
    { x: -20, y: 120 },
    { x: 220, y: 120 },
    { x: 220, y: 380 },
    { x: 480, y: 380 },
    { x: 480, y: 160 },
    { x: 740, y: 160 },
    { x: 740, y: 420 },
    { x: 980, y: 420 },
  ],
};
