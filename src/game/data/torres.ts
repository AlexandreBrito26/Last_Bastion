import type { Torre } from '../estado';

/** Modificadores de upgrade. */
export interface Mod {
  // multiplicativos
  dano?: number;
  cadencia?: number;
  alcance?: number;
  area?: number;
  lentDur?: number;
  // aditivo
  saltos?: number;
  // definem/maximizam o valor
  lentFator?: number; // menor = mais lento
  quebra?: number; // fração de armadura removida
  queima?: number; // dano por segundo
  atordoa?: number; // s
}

export interface Upgrade {
  nome: string;
  desc: string;
  custo: number;
  mod: Mod;
}

export type TipoTorre = 'projetil' | 'cadeia';

export interface DefTorre {
  id: string;
  nome: string;
  desc: string;
  custo: number;
  tipo: TipoTorre;
  antiAereo: boolean;
  alcance: number;
  cadencia: number; // tiros/s
  dano: number;
  velProjetil: number; // px/s
  area: number; // raio de explosão (0 = alvo único)
  saltos: number; // saltos extras da cadeia
  lentFator: number; // 1 = sem lentidão
  lentDur: number;
  quebra: number;
  queima: number;
  atordoa: number;
  cor: number;
  /** Nível 1 -> 2 (comum). */
  nivel2: Upgrade;
  /** Nível 2 -> 3: escolha exclusiva A ou B. */
  nivel3: { A: Upgrade; B: Upgrade };
}

export const DUR_QUEIMA = 3;
export const DUR_QUEBRA = 4;
export const RAIO_SALTO = 95;
export const DECAIMENTO_SALTO = 0.8;

const z = { area: 0, saltos: 0, lentFator: 1, lentDur: 0, quebra: 0, queima: 0, atordoa: 0, tipo: 'projetil' as TipoTorre };

export const TORRES: Record<string, DefTorre> = {
  arqueiro: {
    ...z, id: 'arqueiro', nome: 'Arqueiro', desc: 'Dano único, barato. Acerta voadores.',
    custo: 50, antiAereo: true, alcance: 150, cadencia: 1.5, dano: 16, velProjetil: 420, cor: 0x4cc9f0,
    nivel2: { nome: 'Treino', desc: '+60% de dano', custo: 40, mod: { dano: 1.6 } },
    nivel3: {
      A: { nome: 'Cadência', desc: '+70% de cadência', custo: 70, mod: { cadencia: 1.7 } },
      B: { nome: 'Besta pesada', desc: '2x dano, +25% alcance', custo: 70, mod: { dano: 2, alcance: 1.25 } },
    },
  },
  canhao: {
    ...z, id: 'canhao', nome: 'Canhão', desc: 'Dano em área. Só atinge terrestres.',
    custo: 90, antiAereo: false, alcance: 130, cadencia: 0.6, dano: 40, velProjetil: 300, area: 55, cor: 0x4361ee,
    nivel2: { nome: 'Pólvora', desc: '+60% de dano', custo: 65, mod: { dano: 1.6 } },
    nivel3: {
      A: { nome: 'Raio', desc: '+50% de raio da explosão', custo: 100, mod: { area: 1.5 } },
      B: { nome: 'Incendiário', desc: 'Queima 12 de dano/s por 3s', custo: 100, mod: { queima: 12 } },
    },
  },
  gelo: {
    ...z, id: 'gelo', nome: 'Gelo', desc: 'Lentidão. Só atinge terrestres.',
    custo: 70, antiAereo: false, alcance: 120, cadencia: 1.2, dano: 6, velProjetil: 380,
    lentFator: 0.5, lentDur: 2, cor: 0xcaf0f8,
    nivel2: { nome: 'Frio intenso', desc: 'Lentidão maior e mais longa', custo: 50, mod: { lentFator: 0.4, lentDur: 1.3 } },
    nivel3: {
      A: { nome: 'Congelar', desc: 'Atordoa 0,35s por golpe, lentidão 70%', custo: 80, mod: { atordoa: 0.35, lentFator: 0.3 } },
      B: { nome: 'Quebra-armadura', desc: 'Remove 60% da armadura por 4s', custo: 80, mod: { quebra: 0.6 } },
    },
  },
  tesla: {
    ...z, id: 'tesla', nome: 'Tesla', desc: 'Raio em cadeia. Acerta voadores.',
    tipo: 'cadeia', custo: 110, antiAereo: true, alcance: 125, cadencia: 1.1, dano: 14, velProjetil: 0, saltos: 2, cor: 0x9d4edd,
    nivel2: { nome: 'Bobinas', desc: '+60% de dano', custo: 70, mod: { dano: 1.6 } },
    nivel3: {
      A: { nome: 'Mais saltos', desc: '+3 saltos na cadeia', custo: 110, mod: { saltos: 3 } },
      B: { nome: 'Atordoa', desc: 'Atordoa 0,5s por golpe, +20% dano', custo: 110, mod: { atordoa: 0.5, dano: 1.2 } },
    },
  },
  morteiro: {
    ...z, id: 'morteiro', nome: 'Morteiro', desc: 'Alcance enorme e dano em área devastador, mas lento. Só terrestres.',
    custo: 130, antiAereo: false, alcance: 230, cadencia: 0.33, dano: 75, velProjetil: 230, area: 70, cor: 0xf8961e,
    nivel2: { nome: 'Cargas pesadas', desc: '+60% de dano', custo: 90, mod: { dano: 1.6 } },
    nivel3: {
      A: { nome: 'Salva dupla', desc: '+80% de cadência', custo: 130, mod: { cadencia: 1.8 } },
      B: { nome: 'Napalm', desc: 'Queima 22 de dano/s, +25% de raio', custo: 130, mod: { queima: 22, area: 1.25 } },
    },
  },
};

export const PRIORIDADES = ['primeiro', 'ultimo', 'forte', 'perto'] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export const REEMBOLSO = 0.7;

export interface Stats {
  dano: number;
  cadencia: number;
  alcance: number;
  velProjetil: number;
  area: number;
  saltos: number;
  lentFator: number;
  lentDur: number;
  quebra: number;
  queima: number;
  atordoa: number;
}

export function modsAplicados(t: Torre): Mod[] {
  const def = TORRES[t.defId];
  const mods: Mod[] = [];
  if (t.nivel >= 2) mods.push(def.nivel2.mod);
  if (t.nivel >= 3 && t.caminho) mods.push(def.nivel3[t.caminho].mod);
  return mods;
}

export function statsTorre(t: Torre): Stats {
  const d = TORRES[t.defId];
  const s: Stats = {
    dano: d.dano, cadencia: d.cadencia, alcance: d.alcance, velProjetil: d.velProjetil, area: d.area,
    saltos: d.saltos, lentFator: d.lentFator, lentDur: d.lentDur, quebra: d.quebra, queima: d.queima, atordoa: d.atordoa,
  };
  for (const m of modsAplicados(t)) {
    s.dano *= m.dano ?? 1;
    s.cadencia *= m.cadencia ?? 1;
    s.alcance *= m.alcance ?? 1;
    s.area *= m.area ?? 1;
    s.lentDur *= m.lentDur ?? 1;
    s.saltos += m.saltos ?? 0;
    if (m.lentFator !== undefined) s.lentFator = Math.min(s.lentFator, m.lentFator);
    if (m.quebra !== undefined) s.quebra = Math.max(s.quebra, m.quebra);
    if (m.queima !== undefined) s.queima = Math.max(s.queima, m.queima);
    if (m.atordoa !== undefined) s.atordoa = Math.max(s.atordoa, m.atordoa);
  }
  return s;
}

export interface OpcaoUpgrade {
  chave: 'N' | 'A' | 'B';
  up: Upgrade;
}

export function opcoesUpgrade(t: Torre): OpcaoUpgrade[] {
  const def = TORRES[t.defId];
  if (t.nivel === 1) return [{ chave: 'N', up: def.nivel2 }];
  if (t.nivel === 2) return [{ chave: 'A', up: def.nivel3.A }, { chave: 'B', up: def.nivel3.B }];
  return [];
}
