/** Moedas: moeda de longo prazo, ganha ao vencer fases e gasta na loja. Separada do ouro da partida. */
export const CHAVE_MOEDAS = 'last-bastion:moedas';

export function lerMoedas(): number {
  try {
    const n = Number(localStorage.getItem(CHAVE_MOEDAS));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function gravarMoedas(n: number): void {
  try {
    localStorage.setItem(CHAVE_MOEDAS, String(Math.max(0, Math.floor(n))));
  } catch {
    /* sem armazenamento: ignora */
  }
}

/** Moedas por vitória: mais estrelas rendem mais; o modo desafio rende o dobro. */
export function recompensaVitoria(estrelas: number, desafio: boolean): number {
  return (10 + 10 * estrelas) * (desafio ? 2 : 1);
}

/** Estrelas por vida restante (mesma regra usada no placar). */
export function estrelasPorVidas(vidas: number, vidasIniciais: number): number {
  const f = vidas / vidasIniciais;
  return f >= 0.75 ? 3 : f >= 0.4 ? 2 : 1;
}

/** Moeda verde: rara, cai dos inimigos. Gasta em skins premium e (depois) em upgrades secretos. */
export const CHAVE_VERDES = 'last-bastion:verdes';

/** Quantidade mínima e máxima de moedas verdes por drop (antes dos bônus de melhoria). */
export const DROP_VERDE_MIN = 5;
export const DROP_VERDE_MAX = 10;

export type TipoMelhoria = 'inicial' | 'vitoria' | 'drop' | 'economia';
export const TIPOS_MELHORIA: TipoMelhoria[] = ['inicial', 'vitoria', 'drop', 'economia'];
/** Nível máximo de cada melhoria. Nível 0 = sem melhoria. */
export const NIVEL_MAX = 3;
/** Custo em 💚 para subir do nível n para n+1 (índice n). */
export const CUSTO_MELHORIA = [50, 150, 400];
/** Verdes ganhos ao iniciar uma fase pela primeira vez, por nível de 'inicial'. */
export const EFEITO_INICIAL = [0, 1, 2, 3];
/** Verdes extras ao vencer uma fase, por nível de 'vitoria'. */
export const EFEITO_VITORIA = [0, 5, 10, 20];
/** Chance de cada inimigo derrotado dropar, por nível de 'drop'. */
export const CHANCE_DROP_NIVEL = [0.05, 0.07, 0.10, 0.13];
/** Bônus de quantidade no drop, por nível de 'drop'. */
export const BONUS_QTD_DROP_NIVEL = [0, 2, 5, 8];

export const CHAVE_MELHORIAS = 'last-bastion:melhorias-verde';
export const CHAVE_FASES_INICIADAS = 'last-bastion:fases-iniciadas';

export function lerMelhorias(): Record<TipoMelhoria, number> {
  const padrao: Record<TipoMelhoria, number> = { inicial: 0, vitoria: 0, drop: 0, economia: 0 };
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_MELHORIAS) ?? '{}') as Record<string, unknown>;
    for (const t of TIPOS_MELHORIA) {
      const n = Number(b[t]);
      if (Number.isInteger(n) && n >= 0 && n <= NIVEL_MAX) padrao[t] = n;
    }
    return padrao;
  } catch {
    return padrao;
  }
}

export function gravarMelhorias(m: Record<TipoMelhoria, number>): void {
  try {
    localStorage.setItem(CHAVE_MELHORIAS, JSON.stringify(m));
  } catch {
    /* ignora */
  }
}

export function lerFasesIniciadas(): Record<string, boolean> {
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_FASES_INICIADAS) ?? '{}') as unknown;
    return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function gravarFasesIniciadas(f: Record<string, boolean>): void {
  try {
    localStorage.setItem(CHAVE_FASES_INICIADAS, JSON.stringify(f));
  } catch {
    /* ignora */
  }
}

export function lerVerdes(): number {
  try {
    const n = Number(localStorage.getItem(CHAVE_VERDES));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function gravarVerdes(n: number): void {
  try {
    localStorage.setItem(CHAVE_VERDES, String(Math.max(0, Math.floor(n))));
  } catch {
    /* sem armazenamento: ignora */
  }
}

/** Sorteia o drop de um inimigo derrotado: 0 (sem drop) ou moedas verdes, conforme o nível de 'drop'. */
export function sorteiaVerdes(nivelDrop = 0): number {
  if (Math.random() >= CHANCE_DROP_NIVEL[nivelDrop]) return 0;
  const base = DROP_VERDE_MIN + Math.floor(Math.random() * (DROP_VERDE_MAX - DROP_VERDE_MIN + 1));
  return base + BONUS_QTD_DROP_NIVEL[nivelDrop];
}

// ---------- moeda rubi 🔴 (a terceira moeda, a mais rara) ----------
export const CHAVE_RUBIS = 'last-bastion:rubis';
export const CHAVE_CELESTIAL = 'last-bastion:celestial-arqueiro';
/** Chance de cada inimigo derrotado dropar rubis. */
export const CHANCE_DROP_RUBI = 0.005;
/** Quantidade de rubis por drop (sorteada entre o mínimo e o máximo). */
export const DROP_RUBI_MIN = 1;
export const DROP_RUBI_MAX = 3;
/** Custo em rubis para desbloquear a Evolução Celestial do Arqueiro. */
export const CUSTO_CELESTIAL_RUBIS = 10;

export function lerRubis(): number {
  try {
    const n = Number(localStorage.getItem(CHAVE_RUBIS));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function gravarRubis(n: number): void {
  try {
    localStorage.setItem(CHAVE_RUBIS, String(Math.max(0, Math.floor(n))));
  } catch {
    /* ignora */
  }
}

export function lerCelestial(): boolean {
  try {
    return localStorage.getItem(CHAVE_CELESTIAL) === '1';
  } catch {
    return false;
  }
}

export function gravarCelestial(v: boolean): void {
  try {
    localStorage.setItem(CHAVE_CELESTIAL, v ? '1' : '0');
  } catch {
    /* ignora */
  }
}

/** Sorteia o drop de rubis de um inimigo derrotado: 0 ou de 1 a 3. */
export function sorteiaRubis(): number {
  if (Math.random() >= CHANCE_DROP_RUBI) return 0;
  return DROP_RUBI_MIN + Math.floor(Math.random() * (DROP_RUBI_MAX - DROP_RUBI_MIN + 1));
}

// ---------- melhorias e consumíveis novos ----------
/** Desconto na construção de torres por nível de 'economia' (moeda verde). */
export const EFEITO_ECONOMIA = [0, 0.05, 0.1, 0.15];
/** Verdes extras ao vencer uma fase sem perder nenhuma vida. */
export const BONUS_SEM_PERDER_VIDA = 5;

export type TipoMelhoriaMoeda = 'vidas' | 'ouro' | 'desconto';
export const TIPOS_MELHORIA_MOEDA: TipoMelhoriaMoeda[] = ['vidas', 'ouro', 'desconto'];
export const CHAVE_MELHORIAS_MOEDA = 'last-bastion:melhorias-moeda';
/** Custo em 🪙 para subir do nível n para n+1. */
export const CUSTO_MELHORIA_MOEDA = [100, 250, 500];
/** Vidas extras no início de cada fase, por nível de 'vidas'. */
export const EFEITO_VIDAS_MOEDA = [0, 1, 2, 3];
/** Ouro extra no início de cada fase, por nível de 'ouro'. */
export const EFEITO_OURO_MOEDA = [0, 20, 40, 60];
/** Desconto nos upgrades de torre, por nível de 'desconto'. */
export const EFEITO_DESCONTO_MOEDA = [0, 0.1, 0.2, 0.3];

export function lerMelhoriasMoeda(): Record<TipoMelhoriaMoeda, number> {
  const padrao: Record<TipoMelhoriaMoeda, number> = { vidas: 0, ouro: 0, desconto: 0 };
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_MELHORIAS_MOEDA) ?? '{}') as Record<string, unknown>;
    for (const t of TIPOS_MELHORIA_MOEDA) {
      const n = Number(b[t]);
      if (Number.isInteger(n) && n >= 0 && n <= NIVEL_MAX) padrao[t] = n;
    }
    return padrao;
  } catch {
    return padrao;
  }
}

export function gravarMelhoriasMoeda(m: Record<TipoMelhoriaMoeda, number>): void {
  try {
    localStorage.setItem(CHAVE_MELHORIAS_MOEDA, JSON.stringify(m));
  } catch {
    /* ignora */
  }
}

export type TipoConsumivel = 'reparo' | 'ouroExtra';
export const CONSUMIVEIS: Record<TipoConsumivel, { nome: string; preco: number; desc: string }> = {
  reparo: { nome: 'Reparo', preco: 60, desc: '+3 vidas no início da próxima fase' },
  ouroExtra: { nome: 'Ouro extra', preco: 80, desc: '+100 de ouro no início da próxima fase' },
};
export const EFEITO_REPARO = 3;
export const EFEITO_OURO_EXTRA = 100;
export const CHAVE_CONSUMIVEIS = 'last-bastion:consumiveis';

export function lerConsumiveis(): Record<TipoConsumivel, number> {
  const padrao: Record<TipoConsumivel, number> = { reparo: 0, ouroExtra: 0 };
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_CONSUMIVEIS) ?? '{}') as Record<string, unknown>;
    for (const t of Object.keys(padrao) as TipoConsumivel[]) {
      const n = Number(b[t]);
      if (Number.isInteger(n) && n >= 0) padrao[t] = n;
    }
    return padrao;
  } catch {
    return padrao;
  }
}

export function gravarConsumiveis(c: Record<TipoConsumivel, number>): void {
  try {
    localStorage.setItem(CHAVE_CONSUMIVEIS, JSON.stringify(c));
  } catch {
    /* ignora */
  }
}

/** Preço de um upgrade de torre com o desconto da melhoria 🪙 aplicado. */
export function precoUpgrade(base: number, desconto: number): number {
  return Math.round(base * (1 - desconto));
}

// ---------- Relíquia Esmeralda (torre de suporte liberada com 💚) ----------
export const CHAVE_RELIQUIA = 'last-bastion:reliquia';

export function lerReliquia(): boolean {
  try {
    return localStorage.getItem(CHAVE_RELIQUIA) === '1';
  } catch {
    return false;
  }
}

export function gravarReliquia(v: boolean): void {
  try {
    localStorage.setItem(CHAVE_RELIQUIA, v ? '1' : '0');
  } catch {
    /* ignora */
  }
}

// ---------- inimigo raro: Relicário Errante ----------
/** Chance de cada inimigo comum nascer como Relicário Errante, em qualquer fase. */
export const CHANCE_RELICARIO = 0.015;
export const RELICARIO_RUBI_MIN = 2;
export const RELICARIO_RUBI_MAX = 4;
export const RELICARIO_VERDE_MIN = 15;
export const RELICARIO_VERDE_MAX = 25;

/** Recompensa de um Relicário derrotado: rubis e moedas verdes garantidos. */
export function sorteiaRecompensaRelicario(): { rubis: number; verdes: number } {
  return {
    rubis: RELICARIO_RUBI_MIN + Math.floor(Math.random() * (RELICARIO_RUBI_MAX - RELICARIO_RUBI_MIN + 1)),
    verdes: RELICARIO_VERDE_MIN + Math.floor(Math.random() * (RELICARIO_VERDE_MAX - RELICARIO_VERDE_MIN + 1)),
  };
}

// ---------- recompensas do modo sem fim ----------
/** Recompensa por onda sem fim concluída. `k` é o número da onda sem fim (1, 2, 3...). */
export function recompensaOndaSemFim(k: number): { moedas: number; verdes: number; rubis: number } {
  const marco = k % 5 === 0;
  return { moedas: 5 + k, verdes: marco ? 10 : 0, rubis: marco ? 1 : 0 };
}

// ---------- desafios diários ----------
export type TipoDesafio = 'vencer_sem_perder' | 'vencer_fase' | 'matar' | 'construir';
export interface DefDesafio {
  id: TipoDesafio;
  nome: string;
  meta: number;
  recompensa: { moedas?: number; verdes?: number; rubis?: number };
}
/** Sorteio do dia: 3 de 4 desafios, sempre os mesmos para todos no mesmo dia. */
const POOL_DESAFIOS: DefDesafio[] = [
  { id: 'vencer_sem_perder', nome: 'Vença uma fase sem perder vidas', meta: 1, recompensa: { verdes: 25 } },
  { id: 'vencer_fase', nome: 'Vença 2 fases', meta: 2, recompensa: { rubis: 1, verdes: 10 } },
  { id: 'matar', nome: 'Derrote 150 inimigos', meta: 150, recompensa: { rubis: 2 } },
  { id: 'construir', nome: 'Construa 8 torres', meta: 8, recompensa: { moedas: 30, verdes: 15 } },
];
export const CHAVE_DESAFIOS = 'last-bastion:desafios';

/** Dia local no formato AAAA-MM-DD. */
export function diaHoje(agora: Date = new Date()): string {
  const m = String(agora.getMonth() + 1).padStart(2, '0');
  const d = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${m}-${d}`;
}

/** Os 3 desafios do dia, escolhidos pela data (o mesmo dia dá sempre os mesmos). */
export function desafiosDoDia(dia: string): DefDesafio[] {
  let h = 0;
  for (const c of dia) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const fora = h % POOL_DESAFIOS.length;
  return POOL_DESAFIOS.filter((_, i) => i !== fora);
}

export interface EstadoDesafios {
  dia: string;
  progresso: Partial<Record<TipoDesafio, number>>;
  resgatados: Partial<Record<TipoDesafio, boolean>>;
}

export function estadoDesafiosVazio(dia: string): EstadoDesafios {
  return { dia, progresso: {}, resgatados: {} };
}

export function lerDesafios(dia: string): EstadoDesafios {
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_DESAFIOS) ?? 'null') as EstadoDesafios | null;
    if (!b || b.dia !== dia) return estadoDesafiosVazio(dia);
    return { dia, progresso: b.progresso ?? {}, resgatados: b.resgatados ?? {} };
  } catch {
    return estadoDesafiosVazio(dia);
  }
}

export function gravarDesafios(e: EstadoDesafios): void {
  try {
    localStorage.setItem(CHAVE_DESAFIOS, JSON.stringify(e));
  } catch {
    /* ignora */
  }
}

/** Progresso de um desafio do dia (só conta desafios sorteados hoje). */
export function progressoDe(e: EstadoDesafios, id: TipoDesafio): number {
  return e.progresso[id] ?? 0;
}

// ---------- torres liberadas com moedas (Relíquia com 💚, Veneno com 🪙) ----------
export const CHAVE_TORRES_LIBERADAS = 'last-bastion:torres-liberadas';

/** Torres já liberadas. Migra a Relíquia de saves antigos (CHAVE_RELIQUIA). */
export function lerTorresLiberadas(): Record<string, boolean> {
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE_TORRES_LIBERADAS) ?? '{}') as Record<string, unknown>;
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(b)) if (v === true) out[k] = true;
    if (lerReliquia()) out.reliquia = true;
    return out;
  } catch {
    return lerReliquia() ? { reliquia: true } : {};
  }
}

export function gravarTorresLiberadas(t: Record<string, boolean>): void {
  try {
    localStorage.setItem(CHAVE_TORRES_LIBERADAS, JSON.stringify(t));
  } catch {
    /* ignora */
  }
}

// ---------- recompensa da primeira vitória na Caverna de Cristal ----------
export const MAPA_CAVERNA = 'caverna-de-cristal';
export const RUBI_PRIMEIRA_CAVERNA = 2;
