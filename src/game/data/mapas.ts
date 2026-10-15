import type { Vec } from '../../core/vec';
import type { DefOnda } from './ondas';

export type TemaId = 'floresta' | 'cinzas' | 'gelo' | 'pantano' | 'ruinas' | 'deserto';
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
  {
    id: 'pantano',
    nome: 'Pântano Sussurrante',
    desc: 'Águas paradas e névoa. Voadores atacam em bando e os sapadores abrem caminho.',
    tema: 'pantano',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 200,
    vidas: 20,
    vidaMult: 1.1,
    qtdMult: 1.1,
    chefes: 1,
    extras: [
      { bonus: 45, grupos: [{ inimigo: 'espectro', quantidade: 8, intervalo: 0.7 }, { inimigo: 'sapador', quantidade: 3, intervalo: 2.2, atraso: 4 }] },
      { bonus: 60, grupos: [{ inimigo: 'sapador', quantidade: 5, intervalo: 1.6 }, { inimigo: 'espectro', quantidade: 12, intervalo: 0.45, atraso: 5 }] },
    ],
    waypoints: [
      { x: -20, y: 300 }, { x: 200, y: 300 }, { x: 200, y: 90 }, { x: 420, y: 90 },
      { x: 420, y: 330 }, { x: 660, y: 330 }, { x: 660, y: 150 }, { x: 980, y: 150 },
    ],
    obstaculos: [
      { x: 320, y: 200, r: 34, tipo: 'lago' },
      { x: 560, y: 250, r: 30, tipo: 'lago' },
      { x: 860, y: 60, r: 26, tipo: 'lago' },
      { x: 110, y: 160, r: 20, tipo: 'arvore' },
      { x: 800, y: 300, r: 24, tipo: 'pinheiro' },
      { x: 500, y: 470, r: 22, tipo: 'rocha' },
    ],
  },
  {
    id: 'ruinas',
    nome: 'Ruínas do Sol',
    desc: 'Colunas antigas e brasas eternas. Um dragão guarda o último corredor.',
    tema: 'ruinas',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 230,
    vidas: 18,
    vidaMult: 1.15,
    qtdMult: 1.15,
    chefes: 1,
    extras: [
      { bonus: 55, grupos: [{ inimigo: 'sapador', quantidade: 5, intervalo: 2 }, { inimigo: 'rapido', quantidade: 10, intervalo: 0.5, atraso: 4 }] },
      { bonus: 70, grupos: [{ inimigo: 'espectro', quantidade: 10, intervalo: 0.5 }, { inimigo: 'curandeiro', quantidade: 3, intervalo: 2.5 }] },
      { bonus: 120, grupos: [{ inimigo: 'dragao', quantidade: 1, intervalo: 0 }, { inimigo: 'sapador', quantidade: 6, intervalo: 1.8, atraso: 6 }] },
    ],
    waypoints: [
      { x: -20, y: 460 }, { x: 300, y: 460 }, { x: 300, y: 260 }, { x: 120, y: 260 },
      { x: 120, y: 70 }, { x: 600, y: 70 }, { x: 600, y: 300 }, { x: 840, y: 300 }, { x: 980, y: 300 },
    ],
    obstaculos: [
      { x: 200, y: 400, r: 30, tipo: 'lava' },
      { x: 450, y: 180, r: 24, tipo: 'cristal' },
      { x: 720, y: 200, r: 24, tipo: 'rocha' },
      { x: 420, y: 430, r: 26, tipo: 'lava' },
      { x: 880, y: 110, r: 20, tipo: 'cristal' },
    ],
  },
  {
    id: 'deserto',
    nome: 'Dunas Douradas',
    desc: 'Areia quente e ventos fortes. As dunas escondem rochas e os inimigos vêm em grandes levas.',
    tema: 'deserto',
    largura: L,
    altura: A,
    larguraTrilha: 42,
    ouroInicial: 240,
    vidas: 18,
    vidaMult: 1.2,
    qtdMult: 1.2,
    chefes: 1,
    extras: [
      { bonus: 60, grupos: [{ inimigo: 'enxame', quantidade: 18, intervalo: 0.3 }, { inimigo: 'voador', quantidade: 6, intervalo: 1, atraso: 4 }] },
      { bonus: 75, grupos: [{ inimigo: 'tanque', quantidade: 4, intervalo: 2.2 }, { inimigo: 'curandeiro', quantidade: 4, intervalo: 2 }, { inimigo: 'rapido', quantidade: 8, intervalo: 0.5, atraso: 6 }] },
    ],
    waypoints: [
      { x: -20, y: 120 }, { x: 250, y: 120 }, { x: 250, y: 380 }, { x: 560, y: 380 },
      { x: 560, y: 120 }, { x: 800, y: 120 }, { x: 800, y: 420 }, { x: 980, y: 420 },
    ],
    obstaculos: [
      { x: 400, y: 200, r: 26, tipo: 'rocha' },
      { x: 680, y: 260, r: 24, tipo: 'rocha' },
      { x: 150, y: 300, r: 20, tipo: 'cristal' },
      { x: 880, y: 260, r: 20, tipo: 'cristal' },
      { x: 420, y: 470, r: 22, tipo: 'rocha' },
    ],
  },
  {
    id: 'pantano-profundo',
    nome: 'Pântano Profundo',
    desc: 'Trilhas estreitas entre lagos e ilhas. Os inimigos vêm em levas rápidas e com muita resistência.',
    tema: 'pantano',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 240,
    vidas: 20,
    vidaMult: 1.25,
    qtdMult: 1.15,
    chefes: 1,
    extras: [],
    waypoints: [
      { x: -20, y: 80 }, { x: 180, y: 80 }, { x: 180, y: 300 }, { x: 420, y: 300 },
      { x: 420, y: 460 }, { x: 640, y: 460 }, { x: 640, y: 140 }, { x: 860, y: 140 },
      { x: 860, y: 300 }, { x: 980, y: 300 },
    ],
    obstaculos: [
      { x: 300, y: 150, r: 26, tipo: 'pinheiro' },
      { x: 520, y: 200, r: 28, tipo: 'lago' },
      { x: 300, y: 420, r: 34, tipo: 'lago' },
      { x: 760, y: 420, r: 26, tipo: 'arvore' },
      { x: 560, y: 60, r: 24, tipo: 'rocha' },
      { x: 80, y: 300, r: 28, tipo: 'arvore' },
      { x: 900, y: 440, r: 22, tipo: 'rocha' },
    ],
  },
  {
    id: 'bastiao',
    nome: 'Coração do Bastião',
    desc: 'A última muralha, cercada de lava e cristal. Dois chefes defendem o portão final.',
    tema: 'cinzas',
    largura: L,
    altura: A,
    larguraTrilha: 44,
    ouroInicial: 260,
    vidas: 20,
    vidaMult: 1.4,
    qtdMult: 1.3,
    chefes: 2,
    extras: [
      { bonus: 80, grupos: [{ inimigo: 'tanque', quantidade: 6, intervalo: 1.8 }, { inimigo: 'rapido', quantidade: 14, intervalo: 0.45, atraso: 5 }] },
      { bonus: 95, grupos: [{ inimigo: 'voador', quantidade: 16, intervalo: 0.5 }, { inimigo: 'curandeiro', quantidade: 4, intervalo: 2, atraso: 4 }, { inimigo: 'espectro', quantidade: 8, intervalo: 0.6, atraso: 8 }] },
    ],
    waypoints: [
      { x: -20, y: 470 }, { x: 200, y: 470 }, { x: 200, y: 250 }, { x: 440, y: 250 },
      { x: 440, y: 80 }, { x: 720, y: 80 }, { x: 720, y: 420 }, { x: 980, y: 420 },
    ],
    obstaculos: [
      { x: 330, y: 380, r: 24, tipo: 'lava' },
      { x: 600, y: 250, r: 26, tipo: 'rocha' },
      { x: 820, y: 220, r: 28, tipo: 'lava' },
      { x: 330, y: 150, r: 26, tipo: 'cristal' },
      { x: 100, y: 330, r: 30, tipo: 'lava' },
      { x: 860, y: 80, r: 24, tipo: 'rocha' },
      { x: 600, y: 500, r: 22, tipo: 'cristal' },
    ],
  },
];

export const MAPA_1 = MAPAS[0];
export const mapaPorId = (id: string): Mapa => MAPAS.find((m) => m.id === id) ?? MAPAS[0];
