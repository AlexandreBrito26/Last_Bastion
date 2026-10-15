import { INIMIGOS } from './data/inimigos';
import type { Vec } from '../core/vec';
import { opcoesUpgrade, REEMBOLSO, TORRES, type Prioridade } from './data/torres';
import type { Torre } from './estado';
import { custoTorre, posicaoValida } from './construcao';
import { ref } from './ref';
import { useUI } from '../store/ui';
import { emitir } from '../core/eventos';
import { aplicarDano } from './systems/sistemas';

export function construir(defId: string, pos: Vec): boolean {
  const def = TORRES[defId];
  if (!def) return false;
  const custo = custoTorre(ref.mundo, defId);
  if (!posicaoValida(ref.mundo, ref.mapa, pos) || !useUI.getState().gastarOuro(custo)) {
    emitir({ t: 'erro' });
    return false;
  }
  const t: Torre = {
    id: ref.mundo.proximoId++,
    defId,
    pos: { x: pos.x, y: pos.y },
    recarga: 0,
    nivel: 1,
    caminho: null,
    prioridade: 'primeiro',
    investido: custo,
    flash: 0,
    idade: 0,
    melhoria: 0,
  };
  ref.mundo.torres.push(t);
  emitir({ t: 'construir', pos: t.pos, cor: def.cor });
  useUI.getState().bump();
  return true;
}

export function melhorar(id: number, chave: 'N' | 'A' | 'B'): boolean {
  const t = ref.mundo.torres.find((x) => x.id === id);
  if (!t) return false;
  const op = opcoesUpgrade(t).find((o) => o.chave === chave);
  if (!op || !useUI.getState().gastarOuro(op.up.custo)) {
    emitir({ t: 'erro' });
    return false;
  }
  t.investido += op.up.custo;
  t.nivel++;
  if (chave !== 'N') t.caminho = chave;
  t.melhoria = 0.5;
  emitir({ t: 'melhorar', pos: t.pos, cor: TORRES[t.defId].cor });
  useUI.getState().bump();
  return true;
}

export function vender(id: number): void {
  const i = ref.mundo.torres.findIndex((x) => x.id === id);
  if (i < 0) return;
  const t = ref.mundo.torres[i];
  ref.mundo.torres.splice(i, 1);
  const volta = Math.floor(t.investido * REEMBOLSO);
  useUI.getState().ganharOuro(volta);
  emitir({ t: 'vender', pos: t.pos, ouro: volta });
  useUI.getState().selecionarTorre(null);
}

export function definirPrioridade(id: number, p: Prioridade): void {
  const t = ref.mundo.torres.find((x) => x.id === id);
  if (!t) return;
  t.prioridade = p;
  useUI.getState().bump();
}

/** Chama a próxima onda antes do fim da contagem; cada segundo poupado rende 1 de ouro. */
export function chamarOnda(): void {
  const m = ref.mundo;
  if (m.fase !== 'pausa' || m.temporizador <= 0) return;
  useUI.getState().ganharOuro(Math.floor(m.temporizador));
  m.temporizador = 0;
  emitir({ t: 'clique' });
}

// ---------- habilidades ativas ----------
export const HAB = {
  meteoro: { recarga: 40, dano: 180, raio: 78 },
  congelar: { recarga: 55, atordoa: 2.5, lentDur: 4 },
  escudo: { recarga: 30, duracao: 6 },
} as const;

export type NomeHab = 'meteoro' | 'congelar' | 'escudo';
export const habPronta = (nome: NomeHab): boolean => !!ref.mundo && ref.mundo.tempo >= ref.mundo.hab[nome];
export const habRestante = (nome: NomeHab): number => Math.max(0, ref.mundo.hab[nome] - ref.mundo.tempo);

export function usarMeteoro(pos: Vec): boolean {
  const m = ref.mundo;
  if (!habPronta('meteoro') || m.fase === 'vitoria' || m.fase === 'derrota') { emitir({ t: 'erro' }); return false; }
  m.hab.meteoro = m.tempo + HAB.meteoro.recarga;
  for (const e of m.inimigos) {
    if (e.vivo && Math.hypot(e.pos.x - pos.x, e.pos.y - pos.y) <= HAB.meteoro.raio) {
      aplicarDano(e, HAB.meteoro.dano, true);
      e.queimaDps = Math.max(e.queimaDps, 15);
      e.queimaTempo = Math.max(e.queimaTempo, 3);
    }
  }
  emitir({ t: 'meteoro', pos: { x: pos.x, y: pos.y }, raio: HAB.meteoro.raio });
  useUI.getState().definirHabilidade(null);
  return true;
}

export function usarEscudo(): boolean {
  const m = ref.mundo;
  if (!habPronta('escudo') || m.fase === 'vitoria' || m.fase === 'derrota') { emitir({ t: 'erro' }); return false; }
  m.hab.escudo = m.tempo + HAB.escudo.recarga;
  m.escudoTempo = HAB.escudo.duracao;
  return true;
}

export function usarCongelar(): boolean {
  const m = ref.mundo;
  if (!habPronta('congelar') || m.fase === 'vitoria' || m.fase === 'derrota') { emitir({ t: 'erro' }); return false; }
  m.hab.congelar = m.tempo + HAB.congelar.recarga;
  for (const e of m.inimigos) {
    if (!e.vivo) continue;
    const chefe = !!INIMIGOS[e.defId].chefe;
    if (chefe) { e.lentFator = 0.4; e.lentTempo = Math.max(e.lentTempo, HAB.congelar.lentDur); }
    else e.atordTempo = Math.max(e.atordTempo, HAB.congelar.atordoa);
    e.lentFator = chefe ? 0.4 : Math.min(e.lentFator, 0.5);
    e.lentTempo = Math.max(e.lentTempo, HAB.congelar.lentDur);
  }
  emitir({ t: 'congelar' });
  return true;
}
