import type { Vec } from './vec';

/** Eventos de jogo para feedback (áudio, partículas, tremor). A lógica só emite; quem quiser escuta. */
export type EventoJogo =
  | { t: 'tiro'; torre: string; de: Vec; para: Vec }
  | { t: 'impacto'; pos: Vec; area: number; cor: number }
  | { t: 'acerto'; pos: Vec; cor: number }
  | { t: 'morte'; pos: Vec; cor: number; raio: number; ouro: number; chefe: boolean }
  | { t: 'vazou'; pos: Vec; dano: number }
  | { t: 'construir'; pos: Vec; cor: number }
  | { t: 'melhorar'; pos: Vec; cor: number }
  | { t: 'vender'; pos: Vec; ouro: number }
  | { t: 'onda'; numero: number; chefe: boolean }
  | { t: 'faseChefe'; pos: Vec }
  | { t: 'vitoria' }
  | { t: 'derrota' }
  | { t: 'erro' }
  | { t: 'clique' };

type Ouvinte = (e: EventoJogo) => void;
const ouvintes: Ouvinte[] = [];

export function ouvir(fn: Ouvinte): () => void {
  ouvintes.push(fn);
  return () => {
    const i = ouvintes.indexOf(fn);
    if (i >= 0) ouvintes.splice(i, 1);
  };
}

export function emitir(e: EventoJogo): void {
  for (const fn of ouvintes) fn(e);
}
