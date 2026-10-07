import type { Vec } from '../core/vec';
import { PAUSA_INICIAL } from './data/ondas';
import type { Prioridade } from './data/torres';

export interface Inimigo {
  id: number;
  defId: string;
  pos: Vec;
  vida: number;
  vidaMax: number;
  indiceWp: number;
  vivo: boolean;
  chegou: boolean;
  progresso: number; // distância percorrida (mira 'primeiro')
  lentFator: number;
  lentTempo: number;
  quebra: number;
  quebraTempo: number;
  queimaDps: number;
  queimaTempo: number;
  atordTempo: number;
  curaTimer: number;
  fases: number; // fases de chefe já disparadas
  flash: number; // s restantes do brilho de dano (feedback visual)
}

export interface Torre {
  id: number;
  defId: string;
  pos: Vec;
  recarga: number;
  nivel: number;
  caminho: 'A' | 'B' | null;
  prioridade: Prioridade;
  investido: number;
  flash: number; // s restantes do clarão de disparo
  idade: number; // s desde a construção (animação de entrada)
  melhoria: number; // s restantes do brilho de melhoria
}

export interface EfeitoProj {
  area: number;
  lentFator: number;
  lentDur: number;
  quebra: number;
  queima: number;
  atordoa: number;
}

export interface Projetil {
  id: number;
  pos: Vec;
  alvoPos: Vec;
  efeito: EfeitoProj;
  alvoId: number;
  dano: number;
  velocidade: number;
  vivo: boolean;
}

export interface EfeitoVisual {
  tipo: 'arco' | 'explosao';
  pontos: Vec[];
  raio: number;
  ttl: number;
  ttlMax: number;
  cor: number;
}

export interface EventoSpawn {
  defId: string;
  em: number; // tempo (s) desde o início da onda
}

export type Fase = 'pausa' | 'onda' | 'vitoria' | 'derrota';

export interface Mundo {
  inimigos: Inimigo[];
  torres: Torre[];
  projeteis: Projetil[];
  efeitos: EfeitoVisual[];
  proximoId: number;
  tempo: number;
  fase: Fase;
  ondaIdx: number;
  temporizador: number; // contagem da pausa
  tempoOnda: number;
  fila: EventoSpawn[];
  /** tempo de jogo em que cada habilidade fica pronta */
  hab: { meteoro: number; congelar: number };
}

export function criarMundo(): Mundo {
  return {
    inimigos: [],
    torres: [],
    projeteis: [],
    efeitos: [],
    proximoId: 1,
    tempo: 0,
    fase: 'pausa',
    ondaIdx: 0,
    temporizador: PAUSA_INICIAL,
    tempoOnda: 0,
    fila: [],
    hab: { meteoro: 20, congelar: 30 },
  };
}
