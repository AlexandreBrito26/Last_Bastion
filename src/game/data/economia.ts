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
