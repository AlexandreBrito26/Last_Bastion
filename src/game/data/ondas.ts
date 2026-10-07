export interface GrupoOnda {
  inimigo: string;
  quantidade: number;
  intervalo: number; // s entre inimigos do grupo
  atraso?: number; // s após o início da onda
}

export interface DefOnda {
  grupos: GrupoOnda[];
  bonus: number; // ouro ao concluir
}

/** A vida dos inimigos cresce a cada onda para acompanhar o poder acumulado do jogador. */
export const ESCALA_VIDA = 0.12;
export const fatorVida = (ondaIdx: number): number => 1 + ESCALA_VIDA * ondaIdx;

export const PAUSA_ENTRE_ONDAS = 6;
export const PAUSA_INICIAL = 4;

export const ONDAS: DefOnda[] = [
  { bonus: 20, grupos: [{ inimigo: 'basico', quantidade: 8, intervalo: 1.1 }] },
  { bonus: 25, grupos: [{ inimigo: 'basico', quantidade: 10, intervalo: 0.9 }, { inimigo: 'rapido', quantidade: 4, intervalo: 0.8, atraso: 6 }] },
  { bonus: 30, grupos: [{ inimigo: 'rapido', quantidade: 10, intervalo: 0.6 }] },
  { bonus: 40, grupos: [{ inimigo: 'basico', quantidade: 10, intervalo: 0.8 }, { inimigo: 'voador', quantidade: 5, intervalo: 1.2, atraso: 4 }] },
  { bonus: 50, grupos: [{ inimigo: 'tanque', quantidade: 3, intervalo: 3 }, { inimigo: 'enxame', quantidade: 16, intervalo: 0.35, atraso: 3 }] },
  { bonus: 55, grupos: [{ inimigo: 'basico', quantidade: 10, intervalo: 0.7 }, { inimigo: 'curandeiro', quantidade: 3, intervalo: 2.5, atraso: 2 }, { inimigo: 'rapido', quantidade: 6, intervalo: 0.6, atraso: 8 }] },
  { bonus: 60, grupos: [{ inimigo: 'voador', quantidade: 10, intervalo: 0.8 }, { inimigo: 'rapido', quantidade: 8, intervalo: 0.6, atraso: 5 }] },
  { bonus: 70, grupos: [{ inimigo: 'tanque', quantidade: 5, intervalo: 2.5 }, { inimigo: 'curandeiro', quantidade: 3, intervalo: 3, atraso: 2 }, { inimigo: 'enxame', quantidade: 20, intervalo: 0.3, atraso: 6 }] },
  { bonus: 80, grupos: [{ inimigo: 'tanque', quantidade: 6, intervalo: 2 }, { inimigo: 'voador', quantidade: 8, intervalo: 0.9, atraso: 3 }, { inimigo: 'curandeiro', quantidade: 4, intervalo: 2.5 }] },
  { bonus: 0, grupos: [{ inimigo: 'chefe', quantidade: 1, intervalo: 0 }, { inimigo: 'basico', quantidade: 12, intervalo: 0.8, atraso: 3 }, { inimigo: 'rapido', quantidade: 10, intervalo: 0.5, atraso: 10 }] },
];
