import type { Mundo, Torre } from '../estado';

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

export type Ornamento = 'pontas' | 'asas' | 'coroa';

export interface Forma {
  nome: string;
  cor: number;
  ornamento: Ornamento;
}

export interface Ramo {
  nome: string;
  nos: Upgrade[];
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
  /** Árvore de evolução: cada ramo tem nós que precisam ser comprados em ordem. */
  arvore: Ramo[];
  /** Formas 2 a 4: nome próprio, cor base e ornamento visual. */
  formas: Forma[];
  /** Torre de suporte: não atira; dá bônus na aura. `dano` = % de dano e `cadencia` = % de cadência para as torres vizinhas. */
  suporte?: boolean;
}

export const DUR_QUEIMA = 3;
export const DUR_QUEBRA = 4;
export const RAIO_SALTO = 95;
export const DECAIMENTO_SALTO = 0.8;

const z = { area: 0, saltos: 0, lentFator: 1, lentDur: 0, quebra: 0, queima: 0, atordoa: 0, tipo: 'projetil' as TipoTorre };

export const TORRES: Record<string, DefTorre> = {
  arqueiro: {
    ...z, id: 'arqueiro', nome: 'Arqueiro', desc: 'Dano único, barato. Acerta voadores.',
    custo: 50, antiAereo: true, alcance: 150, cadencia: 1.5, dano: 19, velProjetil: 420, cor: 0x4cc9f0,
    formas: [
      { nome: 'Batedor', cor: 0x2ec4b6, ornamento: 'pontas' },
      { nome: 'Franco-atirador', cor: 0x9b5de5, ornamento: 'asas' },
      { nome: 'Sentinela Celeste', cor: 0xffd166, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Precisão', nos: [
        { nome: 'Treino', desc: '+60% de dano', custo: 50, mod: { dano: 1.6 } },
        { nome: 'Besta pesada', desc: '2x dano, +25% de alcance', custo: 90, mod: { dano: 2, alcance: 1.25 } },
        { nome: 'Flecha perfurante', desc: '+80% de dano, +20% de alcance', custo: 150, mod: { dano: 1.8, alcance: 1.2 } },
      ] },
      { nome: 'Cadência', nos: [
        { nome: 'Arco rápido', desc: '+40% de cadência', custo: 60, mod: { cadencia: 1.4 } },
        { nome: 'Chuva de flechas', desc: '+50% de cadência, +20% de dano', custo: 110, mod: { cadencia: 1.5, dano: 1.2 } },
        { nome: 'Tiro rápido', desc: '+70% de cadência', custo: 160, mod: { cadencia: 1.7 } },
      ] },
      { nome: 'Mira', nos: [
        { nome: 'Mira longa', desc: '+20% de alcance', custo: 50, mod: { alcance: 1.2 } },
        { nome: 'Mira de águia', desc: '+30% de alcance', custo: 90, mod: { alcance: 1.3 } },
        { nome: 'Olho de falcão', desc: '+40% de alcance, +20% de dano', custo: 150, mod: { alcance: 1.4, dano: 1.2 } },
      ] },
    ],
  },
  canhao: {
    ...z, id: 'canhao', nome: 'Canhão', desc: 'Dano em área. Só atinge terrestres.',
    custo: 90, antiAereo: false, alcance: 130, cadencia: 0.6, dano: 48, velProjetil: 300, area: 55, cor: 0x4361ee,
    formas: [
      { nome: 'Artilheiro', cor: 0xff7b00, ornamento: 'pontas' },
      { nome: 'Bombardeiro', cor: 0xd00000, ornamento: 'asas' },
      { nome: 'Titã de Ferro', cor: 0xffba08, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Potência', nos: [
        { nome: 'Pólvora', desc: '+60% de dano', custo: 65, mod: { dano: 1.6 } },
        { nome: 'Carga dupla', desc: '+50% de dano', custo: 100, mod: { dano: 1.5 } },
        { nome: 'Canhão de cerco', desc: '+80% de dano', custo: 170, mod: { dano: 1.8 } },
      ] },
      { nome: 'Área', nos: [
        { nome: 'Raio', desc: '+50% de raio da explosão', custo: 100, mod: { area: 1.5 } },
        { nome: 'Estrondo', desc: '+30% de raio, +20% de dano', custo: 130, mod: { area: 1.3, dano: 1.2 } },
        { nome: 'Onda de choque', desc: '+60% de raio', custo: 170, mod: { area: 1.6 } },
      ] },
      { nome: 'Fogo', nos: [
        { nome: 'Incendiário', desc: 'Queima 12 de dano/s por 3s', custo: 100, mod: { queima: 12 } },
        { nome: 'Brasa', desc: 'Queima 20 de dano/s', custo: 130, mod: { queima: 20 } },
        { nome: 'Inferno', desc: 'Queima 30 de dano/s', custo: 170, mod: { queima: 30 } },
      ] },
    ],
  },
  gelo: {
    ...z, id: 'gelo', nome: 'Gelo', desc: 'Lentidão. Só atinge terrestres.',
    custo: 70, antiAereo: false, alcance: 120, cadencia: 1.2, dano: 7, velProjetil: 380,
    lentFator: 0.5, lentDur: 2, cor: 0xcaf0f8,
    formas: [
      { nome: 'Geomante', cor: 0x48cae4, ornamento: 'pontas' },
      { nome: 'Tecelão de Gelo', cor: 0x0096c7, ornamento: 'asas' },
      { nome: 'Rainha do Inverno', cor: 0xcaf0f8, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Frio', nos: [
        { nome: 'Frio intenso', desc: 'Lentidão maior e mais longa', custo: 50, mod: { lentFator: 0.4, lentDur: 1.3 } },
        { nome: 'Congelar', desc: 'Atordoa 0,35s por golpe, lentidão 70%', custo: 90, mod: { atordoa: 0.35, lentFator: 0.3 } },
        { nome: 'Zero absoluto', desc: 'Atordoa 0,6s e lentidão 80%', custo: 160, mod: { atordoa: 0.6, lentFator: 0.2 } },
      ] },
      { nome: 'Gelo profundo', nos: [
        { nome: 'Gelo grosso', desc: '+40% de dano', custo: 60, mod: { dano: 1.4 } },
        { nome: 'Cristal', desc: '+60% de dano', custo: 110, mod: { dano: 1.6 } },
        { nome: 'Geleira', desc: '+80% de dano, +20% de alcance', custo: 160, mod: { dano: 1.8, alcance: 1.2 } },
      ] },
      { nome: 'Quebra', nos: [
        { nome: 'Quebra-armadura', desc: 'Remove 60% da armadura por 4s', custo: 80, mod: { quebra: 0.6 } },
        { nome: 'Fratura', desc: 'Remove 70% da armadura', custo: 120, mod: { quebra: 0.7 } },
        { nome: 'Armadura destruída', desc: 'Remove 80% da armadura, +50% de dano', custo: 170, mod: { quebra: 0.8, dano: 1.5 } },
      ] },
    ],
  },
  tesla: {
    ...z, id: 'tesla', nome: 'Tesla', desc: 'Raio em cadeia. Acerta voadores.',
    tipo: 'cadeia', custo: 110, antiAereo: true, alcance: 125, cadencia: 1.1, dano: 17, velProjetil: 0, saltos: 2, cor: 0x9d4edd,
    formas: [
      { nome: 'Condutor', cor: 0xc77dff, ornamento: 'pontas' },
      { nome: 'Tempestade Viva', cor: 0x7b2cbf, ornamento: 'asas' },
      { nome: 'Deus do Raio', cor: 0xfffb8f, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Corrente', nos: [
        { nome: 'Mais saltos', desc: '+3 saltos na cadeia', custo: 110, mod: { saltos: 3 } },
        { nome: 'Cadeia longa', desc: '+5 saltos na cadeia', custo: 150, mod: { saltos: 5 } },
        { nome: 'Tempestade', desc: '+3 saltos, +30% de dano', custo: 170, mod: { saltos: 3, dano: 1.3 } },
      ] },
      { nome: 'Voltagem', nos: [
        { nome: 'Alta tensão', desc: '+50% de dano', custo: 100, mod: { dano: 1.5 } },
        { nome: 'Sobrecarga', desc: '+70% de dano', custo: 140, mod: { dano: 1.7 } },
        { nome: 'Raio final', desc: '+100% de dano', custo: 180, mod: { dano: 2 } },
      ] },
      { nome: 'Choque', nos: [
        { nome: 'Atordoa', desc: 'Atordoa 0,5s por golpe, +20% de dano', custo: 110, mod: { atordoa: 0.5, dano: 1.2 } },
        { nome: 'Choque paralisante', desc: 'Atordoa 0,8s e +30% de cadência', custo: 150, mod: { atordoa: 0.8, cadencia: 1.3 } },
        { nome: 'Paralisia', desc: 'Atordoa 1s por golpe', custo: 180, mod: { atordoa: 1 } },
      ] },
    ],
  },
  alquimista: {
    ...z, id: 'alquimista', nome: 'Alquimista', desc: 'Frasco de veneno que queima por tempo. Acerta voadores.',
    custo: 85, antiAereo: true, alcance: 135, cadencia: 0.9, dano: 12, velProjetil: 340, queima: 6, cor: 0x7cff6b,
    formas: [
      { nome: 'Boticário', cor: 0x52b788, ornamento: 'pontas' },
      { nome: 'Mestre Alquimista', cor: 0x2d6a4f, ornamento: 'asas' },
      { nome: 'Arquiteto da Peste', cor: 0xb7ff5a, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Destilação', nos: [
        { nome: 'Destilação', desc: '+60% de dano', custo: 60, mod: { dano: 1.6 } },
        { nome: 'Elixir', desc: '+80% de dano', custo: 110, mod: { dano: 1.8 } },
        { nome: 'Essência', desc: '+100% de dano', custo: 160, mod: { dano: 2 } },
      ] },
      { nome: 'Peste', nos: [
        { nome: 'Peste', desc: 'Queima 9 de dano/s', custo: 90, mod: { queima: 9 } },
        { nome: 'Epidemia', desc: 'Queima 18 de dano/s, +20% de alcance', custo: 140, mod: { queima: 18, alcance: 1.2 } },
        { nome: 'Praga', desc: 'Queima 26 de dano/s', custo: 180, mod: { queima: 26 } },
      ] },
      { nome: 'Vapor', nos: [
        { nome: 'Vapor', desc: '+30% de alcance, +40% de cadência', custo: 90, mod: { alcance: 1.3, cadencia: 1.4 } },
        { nome: 'Névoa tóxica', desc: '+50% de cadência, +20% de alcance', custo: 140, mod: { cadencia: 1.5, alcance: 1.2 } },
        { nome: 'Nuvem', desc: '+70% de cadência', custo: 180, mod: { cadencia: 1.7 } },
      ] },
    ],
  },
  totem: {
    ...z, id: 'totem', nome: 'Totem', desc: 'Não ataca. Dá +15% de dano e +10% de cadência às torres próximas (não acumula).',
    custo: 80, antiAereo: false, alcance: 120, cadencia: 10, dano: 15, velProjetil: 0, cor: 0xffd166, suporte: true,
    formas: [
      { nome: 'Estandarte', cor: 0xffb703, ornamento: 'pontas' },
      { nome: 'Totem Sagrado', cor: 0xfb8500, ornamento: 'asas' },
      { nome: 'Pilar Divino', cor: 0xfff3b0, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Fúria', nos: [
        { nome: 'Fúria', desc: 'Aura de dano +50%', custo: 90, mod: { dano: 1.5 } },
        { nome: 'Fúria maior', desc: 'Aura de dano +100%', custo: 140, mod: { dano: 2 } },
        { nome: 'Ira', desc: 'Aura de dano +150%', custo: 180, mod: { dano: 2.5 } },
      ] },
      { nome: 'Ritmo', nos: [
        { nome: 'Ritmo', desc: 'Aura de cadência +60%', custo: 90, mod: { cadencia: 1.6 } },
        { nome: 'Compasso', desc: 'Aura de cadência +100%', custo: 140, mod: { cadencia: 2 } },
        { nome: 'Tambor', desc: 'Aura de cadência +140%', custo: 180, mod: { cadencia: 2.4 } },
      ] },
      { nome: 'Bênção', nos: [
        { nome: 'Bênção', desc: 'Aura maior: +25% de alcance', custo: 60, mod: { alcance: 1.25 } },
        { nome: 'Halo', desc: 'Aura maior: +50% de alcance', custo: 110, mod: { alcance: 1.5 } },
        { nome: 'Santuário', desc: 'Aura enorme: +80% de alcance', custo: 160, mod: { alcance: 1.8 } },
      ] },
    ],
  },
  morteiro: {
    ...z, id: 'morteiro', nome: 'Morteiro', desc: 'Alcance enorme e dano em área devastador, mas lento. Só terrestres.',
    custo: 130, antiAereo: false, alcance: 230, cadencia: 0.33, dano: 90, velProjetil: 230, area: 70, cor: 0xf8961e,
    formas: [
      { nome: 'Canhoneiro', cor: 0xf4a261, ornamento: 'pontas' },
      { nome: 'Mortal Pesado', cor: 0xe76f51, ornamento: 'asas' },
      { nome: 'Juízo Final', cor: 0x9d0208, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Cargas', nos: [
        { nome: 'Cargas pesadas', desc: '+60% de dano', custo: 90, mod: { dano: 1.6 } },
        { nome: 'Cargas de cerco', desc: '+80% de dano', custo: 140, mod: { dano: 1.8 } },
        { nome: 'Bomba final', desc: '+100% de dano', custo: 190, mod: { dano: 2 } },
      ] },
      { nome: 'Salva', nos: [
        { nome: 'Salva dupla', desc: '+80% de cadência', custo: 130, mod: { cadencia: 1.8 } },
        { nome: 'Salva tripla', desc: '+100% de cadência', custo: 170, mod: { cadencia: 2 } },
        { nome: 'Barragem', desc: '+50% de cadência, +30% de raio', custo: 190, mod: { cadencia: 1.5, area: 1.3 } },
      ] },
      { nome: 'Napalm', nos: [
        { nome: 'Napalm', desc: 'Queima 22 de dano/s, +25% de raio', custo: 130, mod: { queima: 22, area: 1.25 } },
        { nome: 'Inferno', desc: 'Queima 40 de dano/s, +20% de raio', custo: 170, mod: { queima: 40, area: 1.2 } },
        { nome: 'Apocalipse', desc: 'Queima 60 de dano/s', custo: 200, mod: { queima: 60 } },
      ] },
    ],
  },
  ballista: {
    ...z, id: 'ballista', nome: 'Balista', desc: 'Um virote pesado e lento, com muito dano por tiro. Só terrestres.',
    custo: 110, antiAereo: false, alcance: 200, cadencia: 0.5, dano: 84, velProjetil: 520, cor: 0x8d6e63,
    formas: [
      { nome: 'Escorpião', cor: 0xa98467, ornamento: 'pontas' },
      { nome: 'Balista Pesada', cor: 0x6f4e37, ornamento: 'asas' },
      { nome: 'Caçador de Dragões', cor: 0xc0c0c0, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Ponta de ferro', nos: [
        { nome: 'Ponta de ferro', desc: '+50% de dano', custo: 75, mod: { dano: 1.5 } },
        { nome: 'Ponta de aço', desc: '+80% de dano', custo: 120, mod: { dano: 1.8 } },
        { nome: 'Virote mortal', desc: '+60% de dano, +20% de alcance', custo: 170, mod: { dano: 1.6, alcance: 1.2 } },
      ] },
      { nome: 'Perfuração', nos: [
        { nome: 'Perfuração', desc: '+40% de alcance, +40% de dano', custo: 120, mod: { alcance: 1.4, dano: 1.4 } },
        { nome: 'Longo alcance', desc: '+50% de alcance', custo: 110, mod: { alcance: 1.5 } },
        { nome: 'Lança longa', desc: '+60% de alcance, +20% de dano', custo: 170, mod: { alcance: 1.6, dano: 1.2 } },
      ] },
      { nome: 'Rajada', nos: [
        { nome: 'Rajada', desc: '+60% de cadência', custo: 120, mod: { cadencia: 1.6 } },
        { nome: 'Chuva de virotes', desc: '+50% de cadência, +20% de dano', custo: 170, mod: { cadencia: 1.5, dano: 1.2 } },
        { nome: 'Metralha', desc: '+80% de cadência', custo: 190, mod: { cadencia: 1.8 } },
      ] },
    ],
  },
  cristal: {
    ...z, id: 'cristal', nome: 'Cristal Arcano', desc: 'Um prisma que dispara raios de energia. Acerta voadores e terrestres, com bom alcance.',
    custo: 120, antiAereo: true, alcance: 170, cadencia: 0.8, dano: 40, velProjetil: 320, cor: 0xb388ff,
    formas: [
      { nome: 'Prismático', cor: 0x9d7bff, ornamento: 'pontas' },
      { nome: 'Arcano Supremo', cor: 0x6a4cff, ornamento: 'asas' },
      { nome: 'Cósmico', cor: 0xe0c3ff, ornamento: 'coroa' },
    ],
    arvore: [
      { nome: 'Ressonância', nos: [
        { nome: 'Vibração', desc: '+50% de dano', custo: 60, mod: { dano: 1.5 } },
        { nome: 'Onda', desc: '+70% de dano, +10% de cadência', custo: 110, mod: { dano: 1.7, cadencia: 1.1 } },
        { nome: 'Ressonância plena', desc: '+100% de dano', custo: 170, mod: { dano: 2 } },
      ] },
      { nome: 'Foco', nos: [
        { nome: 'Lente', desc: '+25% de alcance', custo: 55, mod: { alcance: 1.25 } },
        { nome: 'Feixe', desc: '+40% de alcance, +20% de cadência', custo: 100, mod: { alcance: 1.4, cadencia: 1.2 } },
        { nome: 'Farol', desc: '+60% de alcance', custo: 160, mod: { alcance: 1.6 } },
      ] },
      { nome: 'Prisma', nos: [
        { nome: 'Fratura', desc: 'Remove 40% da armadura', custo: 70, mod: { quebra: 0.4 } },
        { nome: 'Luz cega', desc: 'Atordoa 0,3s por golpe', custo: 110, mod: { atordoa: 0.3 } },
        { nome: 'Dispersão', desc: 'Remove 70% da armadura e atordoa 0,5s', custo: 170, mod: { quebra: 0.7, atordoa: 0.5 } },
      ] },
    ],
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

/** Multiplicador de dano por forma. A cadência sobe pela metade desse ganho. */
export const BONUS_FORMA = [1, 1.15, 1.35, 1.6] as const;

/** Forma atual da torre: 1 até 2 nós, 2 com 3 nós, 3 com 6, 4 com 9. */
export function formaTorre(t: Torre): number {
  const total = t.ramos.reduce((a, b) => a + b, 0);
  return Math.min(4, 1 + Math.floor(total / 3));
}

/** Nome da forma atual. A forma 1 usa o nome base da torre. */
export function nomeTorre(t: Torre): string {
  const f = formaTorre(t);
  return f > 1 ? TORRES[t.defId].formas[f - 2].nome : TORRES[t.defId].nome;
}

export function modsAplicados(t: Torre): Mod[] {
  const def = TORRES[t.defId];
  const mods: Mod[] = [];
  def.arvore.forEach((ramo, r) => {
    for (let i = 0; i < t.ramos[r]; i++) mods.push(ramo.nos[i].mod);
  });
  return mods;
}

/** Índice do ramo com mais nós comprados (define a cor de destaque). -1 se nada foi comprado. */
export function ramoPrincipal(t: Torre): number {
  let melhor = -1;
  let max = 0;
  t.ramos.forEach((n, r) => {
    if (n > max) { max = n; melhor = r; }
  });
  return melhor;
}

/**
 * Bônus de aura recebido por uma torre: multiplicadores de dano e cadência vindos das torres de suporte
 * dentro do alcance. Não acumula entre suportes (vale o maior) e as próprias torres de suporte não recebem aura.
 */
export function auraDe(m: Mundo, t: Torre): { dano: number; cadencia: number } {
  if (TORRES[t.defId].suporte) return { dano: 1, cadencia: 1 };
  let dano = 0;
  let cadencia = 0;
  for (const s of m.torres) {
    if (!TORRES[s.defId].suporte) continue;
    const ss = statsTorre(s);
    if (Math.hypot(s.pos.x - t.pos.x, s.pos.y - t.pos.y) > ss.alcance) continue;
    dano = Math.max(dano, ss.dano);
    cadencia = Math.max(cadencia, ss.cadencia);
  }
  return { dano: 1 + dano / 100, cadencia: 1 + cadencia / 100 };
}

export function statsTorre(t: Torre): Stats {
  const d = TORRES[t.defId];
  const s: Stats = {
    dano: d.dano, cadencia: d.cadencia, alcance: d.alcance, velProjetil: d.velProjetil, area: d.area,
    saltos: d.saltos, lentFator: d.lentFator, lentDur: d.lentDur, quebra: d.quebra, queima: d.queima, atordoa: d.atordoa,
  };
  const bonus = BONUS_FORMA[formaTorre(t) - 1];
  s.dano *= bonus;
  s.cadencia *= 1 + (bonus - 1) / 2;
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

/** Estatísticas que a torre teria aplicando um upgrade. Mesma regra de `statsTorre`. */
export function previewStats(st: Stats, mod: Mod): Stats {
  const s: Stats = { ...st };
  s.dano *= mod.dano ?? 1;
  s.cadencia *= mod.cadencia ?? 1;
  s.alcance *= mod.alcance ?? 1;
  s.area *= mod.area ?? 1;
  s.lentDur *= mod.lentDur ?? 1;
  s.saltos += mod.saltos ?? 0;
  if (mod.lentFator !== undefined) s.lentFator = Math.min(s.lentFator, mod.lentFator);
  if (mod.quebra !== undefined) s.quebra = Math.max(s.quebra, mod.quebra);
  if (mod.queima !== undefined) s.queima = Math.max(s.queima, mod.queima);
  if (mod.atordoa !== undefined) s.atordoa = Math.max(s.atordoa, mod.atordoa);
  return s;
}

export interface OpcaoUpgrade {
  ramo: number;
  up: Upgrade;
}

/** Próximo nó de cada ramo que ainda não está no fim. */
export function opcoesUpgrade(t: Torre): OpcaoUpgrade[] {
  const def = TORRES[t.defId];
  const ops: OpcaoUpgrade[] = [];
  def.arvore.forEach((ramo, r) => {
    const prox = ramo.nos[t.ramos[r]];
    if (prox) ops.push({ ramo: r, up: prox });
  });
  return ops;
}
