import type { Vec } from '../../core/vec';
import type { DefOnda } from './ondas';

export type TemaId = 'floresta' | 'cinzas' | 'gelo';
export type TipoObstaculo = 'arvore' | 'rocha' | 'lago' | 'lava' | 'cristal' | 'pinheiro';

export interface Obstaculo {
  x: number;
  y: number;
  r: number;
  tipo: TipoObstaculo;
}

export interface Mapa {
  id: string;
  nome: string;
  desc: string;
  tema: TemaId;
  largura: number;
  altura: number;
  larguraTrilha: number;
  waypoints: Vec[];
  obstaculos: Obstaculo[];
  ouroInicial: number;
  vidas: number;
  /** multiplicador de vida dos inimigos */
  vidaMult: number;
  /** multiplicador da quantidade de inimigos por onda */
  qtdMult: number;
  /** quantos chefes na onda final */
  chefes: number;
  /** ondas extras inseridas antes do chefe */
  extras: DefOnda[];
}

const L = 960;
const A = 540;

export const MAPAS: Mapa[] = [
  {
    id: 'floresta',
    nome: 'Trilha Inicial',
    desc: 'Uma trilha serena entre árvores. Ideal para aprender.',
    tema: 'floresta',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 180,
    vidas: 20,
    vidaMult: 1,
    qtdMult: 1,
    chefes: 1,
    extras: [],
    waypoints: [
      { x: -20, y: 120 }, { x: 220, y: 120 }, { x: 220, y: 380 }, { x: 480, y: 380 },
      { x: 480, y: 160 }, { x: 740, y: 160 }, { x: 740, y: 420 }, { x: 980, y: 420 },
    ],
    obstaculos: [
      { x: 340, y: 250, r: 22, tipo: 'rocha' },
      { x: 610, y: 300, r: 28, tipo: 'arvore' },
      { x: 110, y: 290, r: 28, tipo: 'arvore' },
      { x: 860, y: 230, r: 26, tipo: 'arvore' },
      { x: 860, y: 310, r: 24, tipo: 'arvore' },
      { x: 130, y: 460, r: 38, tipo: 'lago' },
      { x: 350, y: 60, r: 24, tipo: 'arvore' },
      { x: 620, y: 60, r: 22, tipo: 'rocha' },
      { x: 600, y: 480, r: 26, tipo: 'arvore' },
    ],
  },
  {
    id: 'cinzas',
    nome: 'Cânion de Cinzas',
    desc: 'Uma trilha longa em zigue-zague sobre rios de lava. Mais inimigos e mais resistentes.',
    tema: 'cinzas',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 220,
    vidas: 20,
    vidaMult: 1.15,
    qtdMult: 1.2,
    chefes: 1,
    extras: [
      { bonus: 90, grupos: [{ inimigo: 'voador', quantidade: 14, intervalo: 0.6 }, { inimigo: 'tanque', quantidade: 4, intervalo: 2.2, atraso: 3 }] },
      { bonus: 100, grupos: [{ inimigo: 'curandeiro', quantidade: 5, intervalo: 2 }, { inimigo: 'tanque', quantidade: 6, intervalo: 1.8, atraso: 2 }, { inimigo: 'rapido', quantidade: 14, intervalo: 0.45, atraso: 8 }] },
    ],
    waypoints: [
      { x: -20, y: 80 }, { x: 860, y: 80 }, { x: 860, y: 215 }, { x: 100, y: 215 },
      { x: 100, y: 350 }, { x: 860, y: 350 }, { x: 860, y: 475 }, { x: 980, y: 475 },
    ],
    obstaculos: [
      { x: 480, y: 148, r: 30, tipo: 'lava' },
      { x: 250, y: 148, r: 22, tipo: 'rocha' },
      { x: 720, y: 148, r: 24, tipo: 'lava' },
      { x: 300, y: 283, r: 28, tipo: 'lava' },
      { x: 600, y: 283, r: 22, tipo: 'rocha' },
      { x: 780, y: 283, r: 30, tipo: 'lava' },
      { x: 480, y: 415, r: 34, tipo: 'lava' },
      { x: 220, y: 415, r: 22, tipo: 'rocha' },
      { x: 700, y: 430, r: 22, tipo: 'rocha' },
      { x: 120, y: 480, r: 26, tipo: 'lava' },
    ],
  },
  {
    id: 'gelo',
    nome: 'Fortaleza Gelada',
    desc: 'Uma espiral que leva ao coração da fortaleza. Dois chefes e 14 ondas brutais.',
    tema: 'gelo',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 240,
    vidas: 18,
    vidaMult: 1.3,
    qtdMult: 1.35,
    chefes: 2,
    extras: [
      { bonus: 90, grupos: [{ inimigo: 'enxame', quantidade: 30, intervalo: 0.22 }, { inimigo: 'curandeiro', quantidade: 4, intervalo: 2, atraso: 2 }] },
      { bonus: 100, grupos: [{ inimigo: 'voador', quantidade: 16, intervalo: 0.55 }, { inimigo: 'rapido', quantidade: 14, intervalo: 0.4, atraso: 5 }] },
      { bonus: 110, grupos: [{ inimigo: 'tanque', quantidade: 9, intervalo: 1.6 }, { inimigo: 'curandeiro', quantidade: 6, intervalo: 1.8, atraso: 2 }] },
      { bonus: 120, grupos: [{ inimigo: 'tanque', quantidade: 8, intervalo: 1.5 }, { inimigo: 'voador', quantidade: 14, intervalo: 0.6, atraso: 3 }, { inimigo: 'enxame', quantidade: 30, intervalo: 0.2, atraso: 8 }] },
    ],
    waypoints: [
      { x: -20, y: 60 }, { x: 900, y: 60 }, { x: 900, y: 480 }, { x: 60, y: 480 },
      { x: 60, y: 160 }, { x: 780, y: 160 }, { x: 780, y: 380 }, { x: 200, y: 380 },
      { x: 200, y: 270 }, { x: 480, y: 270 },
    ],
    obstaculos: [
      { x: 330, y: 110, r: 20, tipo: 'cristal' },
      { x: 620, y: 110, r: 20, tipo: 'pinheiro' },
      { x: 840, y: 270, r: 24, tipo: 'cristal' },
      { x: 480, y: 430, r: 22, tipo: 'pinheiro' },
      { x: 250, y: 430, r: 20, tipo: 'cristal' },
      { x: 700, y: 430, r: 20, tipo: 'cristal' },
      { x: 120, y: 320, r: 20, tipo: 'pinheiro' },
      { x: 500, y: 215, r: 18, tipo: 'cristal' },
      { x: 660, y: 270, r: 22, tipo: 'rocha' },
      { x: 930, y: 30, r: 16, tipo: 'pinheiro' },
    ],
  },
];

export const MAPA_1 = MAPAS[0];
export const mapaPorId = (id: string): Mapa => MAPAS.find((m) => m.id === id) ?? MAPAS[0];
