export interface FaseChefe {
  em: number; // fração de vida em que a fase dispara
  invoca: { defId: string; qtd: number };
}

export interface DefInimigo {
  id: string;
  nome: string;
  vida: number;
  velocidade: number; // px/s
  raio: number;
  recompensa: number;
  cor: number;
  armadura: number; // redução fixa por golpe (mín. 1 de dano)
  voador: boolean; // ignora o caminho e só é atingido por torres anti-aéreas
  danoBase: number; // vidas perdidas ao chegar ao fim
  cura?: { raio: number; quantidade: number; intervalo: number };
  chefe?: FaseChefe[];
}

const base = { armadura: 0, voador: false, danoBase: 1 };

export const INIMIGOS: Record<string, DefInimigo> = {
  golemGigante: { ...base, id: 'golemGigante', nome: 'Golem Gigante', vida: 3000, velocidade: 28, raio: 30, recompensa: 220, cor: 0x9be7ff, armadura: 10, danoBase: 10, chefe: [{ em: 0.5, invoca: { defId: 'golem', qtd: 2 } }] },
  relicario: { ...base, id: 'relicario', nome: 'Relicário Errante', vida: 260, velocidade: 110, raio: 12, recompensa: 40, cor: 0xffd60a, armadura: 2, danoBase: 2 },
  basico: { ...base, id: 'basico', nome: 'Básico', vida: 60, velocidade: 70, raio: 11, recompensa: 5, cor: 0xf72585 },
  rapido: { ...base, id: 'rapido', nome: 'Rápido', vida: 35, velocidade: 130, raio: 9, recompensa: 6, cor: 0xff6b9d },
  tanque: { ...base, id: 'tanque', nome: 'Tanque', vida: 260, velocidade: 45, raio: 15, recompensa: 18, cor: 0xb5179e, armadura: 6 },
  enxame: { ...base, id: 'enxame', nome: 'Enxame', vida: 18, velocidade: 85, raio: 7, recompensa: 2, cor: 0xff477e },
  voador: { ...base, id: 'voador', nome: 'Voador', vida: 55, velocidade: 95, raio: 10, recompensa: 8, cor: 0xfb8500, voador: true },
  curandeiro: {
    ...base, id: 'curandeiro', nome: 'Curandeiro', vida: 90, velocidade: 60, raio: 11, recompensa: 12, cor: 0xff8fab,
    cura: { raio: 90, quantidade: 12, intervalo: 1 },
  },
  espectro: { ...base, id: 'espectro', nome: 'Espectro', vida: 45, velocidade: 150, raio: 9, recompensa: 9, cor: 0x8e7dff, voador: true },
  golem: { ...base, id: 'golem', nome: 'Golem de Cristal', vida: 420, velocidade: 38, raio: 17, recompensa: 26, cor: 0x7ec8e3, armadura: 9, danoBase: 3 },
  ceifador: { ...base, id: 'ceifador', nome: 'Ceifador', vida: 110, velocidade: 120, raio: 11, recompensa: 16, cor: 0x2d1b4e, voador: true, danoBase: 2 },
  sapador: { ...base, id: 'sapador', nome: 'Sapador', vida: 130, velocidade: 55, raio: 13, recompensa: 14, cor: 0xc2185b, armadura: 3, danoBase: 2 },
  escudeiro: { ...base, id: 'escudeiro', nome: 'Escudeiro', vida: 140, velocidade: 60, raio: 13, recompensa: 10, cor: 0x8d99ae, armadura: 4 },
  corvo: { ...base, id: 'corvo', nome: 'Corvo', vida: 40, velocidade: 150, raio: 8, recompensa: 7, cor: 0x3d3d56, voador: true },
  colosso: {
    ...base, id: 'colosso', nome: 'Colosso de Areia', vida: 2200, velocidade: 30, raio: 26, recompensa: 180, cor: 0xc9a227, armadura: 10, danoBase: 8,
    chefe: [{ em: 0.5, invoca: { defId: 'escudeiro', qtd: 6 } }],
  },
  ogro: { ...base, id: 'ogro', nome: 'Ogro de Pedra', vida: 500, velocidade: 40, raio: 19, recompensa: 30, cor: 0x7d5a50, armadura: 5, danoBase: 4 },
  guardiao: {
    ...base, id: 'guardiao', nome: 'Guardião de Ferro', vida: 2000, velocidade: 32, raio: 25, recompensa: 170, cor: 0x6c757d, armadura: 9, danoBase: 8,
    chefe: [{ em: 0.6, invoca: { defId: 'ogro', qtd: 3 } }],
  },
  dragao: {
    ...base, id: 'dragao', nome: 'Dragão de Brasa', vida: 2600, velocidade: 40, raio: 28, recompensa: 220, cor: 0xff5e3a, armadura: 6, voador: true, danoBase: 9,
    chefe: [{ em: 0.5, invoca: { defId: 'espectro', qtd: 8 } }],
  },
  besouro: { ...base, id: 'besouro', nome: 'Besouro Couraçado', vida: 170, velocidade: 62, raio: 12, recompensa: 13, cor: 0x6d4c41, armadura: 7 },
  lich: {
    ...base, id: 'lich', nome: 'Lich do Pântano', vida: 2300, velocidade: 34, raio: 25, recompensa: 170, cor: 0x3a5a40, armadura: 8, danoBase: 7,
    chefe: [{ em: 0.5, invoca: { defId: 'ceifador', qtd: 4 } }],
  },
  chefe: {
    ...base, id: 'chefe', nome: 'Chefe', vida: 1800, velocidade: 36, raio: 24, recompensa: 150, cor: 0xff9e00, armadura: 8, danoBase: 7,
    chefe: [
      { em: 0.66, invoca: { defId: 'enxame', qtd: 10 } },
      { em: 0.33, invoca: { defId: 'tanque', qtd: 2 } },
    ],
  },
};
