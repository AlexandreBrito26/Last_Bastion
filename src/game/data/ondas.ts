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
  { bonus: 65, grupos: [{ inimigo: 'golem', quantidade: 3, intervalo: 3 }, { inimigo: 'enxame', quantidade: 12, intervalo: 0.4, atraso: 4 }] },
  { bonus: 70, grupos: [{ inimigo: 'tanque', quantidade: 5, intervalo: 2.5 }, { inimigo: 'curandeiro', quantidade: 3, intervalo: 3, atraso: 2 }, { inimigo: 'enxame', quantidade: 20, intervalo: 0.3, atraso: 6 }] },
  { bonus: 80, grupos: [{ inimigo: 'tanque', quantidade: 6, intervalo: 2 }, { inimigo: 'voador', quantidade: 8, intervalo: 0.9, atraso: 3 }, { inimigo: 'curandeiro', quantidade: 4, intervalo: 2.5 }] },
  { bonus: 85, grupos: [{ inimigo: 'ceifador', quantidade: 10, intervalo: 0.6 }, { inimigo: 'golem', quantidade: 2, intervalo: 4, atraso: 6 }] },
  { bonus: 0, grupos: [{ inimigo: 'chefe', quantidade: 1, intervalo: 0 }, { inimigo: 'basico', quantidade: 12, intervalo: 0.8, atraso: 3 }, { inimigo: 'rapido', quantidade: 10, intervalo: 0.5, atraso: 10 }] },
];

const escalar = (w: DefOnda, q: number): DefOnda => ({
  bonus: Math.round(w.bonus * (1 + (q - 1) * 0.6)),
  grupos: w.grupos.map((g) => ({ ...g, quantidade: Math.max(1, Math.round(g.quantidade * q)) })),
});

/** Monta as ondas de uma fase: base escalada + ondas extras + onda final com chefe(s). */
export function gerarOndas(cfg: { qtdMult: number; extras: DefOnda[]; chefes: number }): DefOnda[] {
  const meio = ONDAS.slice(0, ONDAS.length - 1).map((w) => escalar(w, cfg.qtdMult));
  const final = escalar(ONDAS[ONDAS.length - 1], cfg.qtdMult);
  // o chefe não deve ter a quantidade escalada
  final.grupos[0] = { ...ONDAS[ONDAS.length - 1].grupos[0] };
  if (cfg.chefes > 1) final.grupos.push({ inimigo: 'chefe', quantidade: cfg.chefes - 1, intervalo: 14, atraso: 16 });
  return [...meio, ...cfg.extras, final];
}

// ---------- modo sem fim (endless) ----------

/** Ciclo de inimigos usado nas ondas infinitas (sem chefes). */
const CICLO_INFINITO = ['basico', 'rapido', 'voador', 'tanque', 'enxame', 'curandeiro', 'espectro', 'sapador', 'golem', 'ceifador'];

/**
 * Onda gerada depois da última onda da fase, no modo sem fim.
 * `n` é o índice global da onda (a primeira infinita tem o índice igual ao número de ondas da fase).
 * A composição gira pelo ciclo de inimigos e a quantidade cresce devagar, para o desafio subir sem saltos.
 */
export function ondaInfinita(n: number): DefOnda {
  const principal = CICLO_INFINITO[n % CICLO_INFINITO.length];
  const secundario = CICLO_INFINITO[(n + 3) % CICLO_INFINITO.length];
  const grupos: GrupoOnda[] = [
    { inimigo: principal, quantidade: Math.round(8 + n * 0.8), intervalo: Math.max(0.25, 1 - n * 0.02) },
    { inimigo: secundario, quantidade: Math.round(4 + n * 0.4), intervalo: 0.8, atraso: 5 },
  ];
  // a cada 5 ondas, um grupo extra de tanques ou sapadores (mais resistentes)
  if (n % 5 === 4) {
    grupos.push({ inimigo: n % 10 === 9 ? 'sapador' : 'tanque', quantidade: 2 + Math.floor(n / 5), intervalo: 2.5, atraso: 8 });
  }
  return { bonus: 80 + 15 * Math.max(0, n - ONDAS.length + 1), grupos };
}
