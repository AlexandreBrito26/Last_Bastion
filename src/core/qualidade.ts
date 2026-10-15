/**
 * Nível de efeitos visuais. Um único lugar decide o que é ligado em cada nível;
 * o resto do jogo só pergunta `limitesDe(nivel)`.
 */
export type NivelEfeitos = 'baixo' | 'medio' | 'alto';

export interface LimitesEfeitos {
  /** partículas simultâneas máximas */
  particulas: number;
  /** halos de luz (luz()) */
  luz: boolean;
  /** desfoque do brilho (bloom) */
  desfoque: boolean;
  /** gradação de cor do mapa */
  corMundo: boolean;
  /** tremor de tela em impactos */
  tremor: boolean;
}

const LIMITES: Record<NivelEfeitos, LimitesEfeitos> = {
  alto: { particulas: 700, luz: true, desfoque: true, corMundo: true, tremor: true },
  medio: { particulas: 350, luz: true, desfoque: false, corMundo: true, tremor: true },
  baixo: { particulas: 150, luz: false, desfoque: false, corMundo: false, tremor: false },
};

export const NIVEIS: { id: NivelEfeitos; rotulo: string }[] = [
  { id: 'baixo', rotulo: 'Baixo' },
  { id: 'medio', rotulo: 'Médio' },
  { id: 'alto', rotulo: 'Alto' },
];

export function limitesDe(nivel: NivelEfeitos): LimitesEfeitos {
  return LIMITES[nivel];
}

const CHAVE = 'last-bastion:efeitos';

/** Padrão: celular começa em médio (sem desfoque caro), computador em alto. */
export function nivelPadrao(): NivelEfeitos {
  try {
    const telaPequena = window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 820;
    return telaPequena ? 'medio' : 'alto';
  } catch {
    return 'medio';
  }
}

export function lerNivel(): NivelEfeitos {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === 'baixo' || v === 'medio' || v === 'alto') return v;
  } catch {
    /* sem armazenamento: usa o padrão */
  }
  return nivelPadrao();
}

export function gravarNivel(n: NivelEfeitos): void {
  try {
    localStorage.setItem(CHAVE, n);
  } catch {
    /* ignora */
  }
}
