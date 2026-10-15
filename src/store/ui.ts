import { create } from 'zustand';
import type { Fase } from '../game/estado';
import { gravarSkin, gravarCompradas, lerCompradas, lerSkin, SKINS } from '../game/data/skins';
import { estrelasPorVidas, gravarMoedas, lerMoedas, recompensaVitoria } from '../game/data/economia';
import { gravarNivel, lerNivel, type NivelEfeitos } from '../core/qualidade';
import { HISTORIA } from '../game/historia';

/** Só estado que a UI precisa. Posições a 60fps ficam fora daqui. */
export const OURO_INICIAL = 180;
export const VIDAS_INICIAIS = 20;

const CHAVE_PROG = 'last-bastion:progresso';

/** Chave de progresso: o modo desafio tem estrelas separadas do normal. */
export const chaveFase = (id: string, desafio: boolean): string => (desafio ? `${id}#desafio` : id);
function lerProgresso(): Record<string, number> {
  try {
    const b = localStorage.getItem(CHAVE_PROG);
    return b ? (JSON.parse(b) as Record<string, number>) : {};
  } catch {
    return {};
  }
}
function gravarProgresso(p: Record<string, number>): void {
  try {
    localStorage.setItem(CHAVE_PROG, JSON.stringify(p));
  } catch {
    /* ignora */
  }
}

export type Tela = 'menu' | 'jogo';

export interface Aviso { id: number; texto: string; chefe: boolean }

const CHAVE = 'last-bastion:config';
function lerConfig(): { volSfx: number; volMusica: number; mudo: boolean } {
  const padrao = { volSfx: 0.7, volMusica: 0.35, mudo: false };
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? { ...padrao, ...JSON.parse(bruto) } : padrao;
  } catch {
    return padrao;
  }
}
function gravarConfig(c: { volSfx: number; volMusica: number; mudo: boolean }): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(c));
  } catch {
    /* sem armazenamento: ignora */
  }
}

interface EstadoUI {
  tela: Tela;
  jogoIniciado: boolean;
  volSfx: number;
  volMusica: number;
  /** skin das torres (id em SKINS) */
  skin: string;
  /** ids das skins liberadas */
  skinsCompradas: string[];
  definirSkin: (id: string) => boolean;
  comprarSkin: (id: string) => boolean;
  /** moedas da conta (persistentes) */
  moedas: number;
  /** moedas ganhas na última vitória (para mostrar na tela de fim) */
  ultimaRecompensa: number;
  mudo: boolean;
  aviso: Aviso | null;
  pulsoDano: number; // incrementa a cada vida perdida (dispara a animação de dano)
  ouro: number;
  vidas: number;
  onda: number; // 1-based
  totalOndas: number;
  fase: Fase;
  contagem: number; // s até a próxima onda
  construirId: string | null;
  selecionadaId: number | null;
  velocidade: 1 | 2 | 3;
  pausado: boolean;
  mapaId: string;
  vidasIniciais: number;
  progresso: Record<string, number>; // estrelas por fase (modo normal e desafio)
  desafio: boolean;
  definirDesafio: (v: boolean) => void;
  habilidade: 'meteoro' | null; // habilidade em modo de mira
  definirHabilidade: (h: 'meteoro' | null) => void;
  registrarVitoria: () => void;
  previaToque: boolean; // prévia posicionada por toque, aguardando confirmar
  definirPreviaToque: (v: boolean) => void;
  rev: number; // incrementa quando o mundo muda de um jeito que a UI deve refletir
  ganharOuro: (n: number) => void;
  gastarOuro: (n: number) => boolean;
  perderVida: (n: number) => void;
  definirOnda: (n: number, total: number) => void;
  definirFase: (f: Fase, contagem?: number) => void;
  definirConstruir: (id: string | null) => void;
  selecionarTorre: (id: number | null) => void;
  definirVelocidade: (v: 1 | 2 | 3) => void;
  alternarPausa: () => void;
  definirTela: (t: Tela) => void;
  definirVolumes: (sfx: number, musica: number) => void;
  /** nível de efeitos visuais (salvo no aparelho) */
  efeitos: NivelEfeitos;
  definirEfeitos: (n: NivelEfeitos) => void;
  alternarMudo: () => void;
  mostrarAviso: (texto: string, chefe: boolean) => void;
  registrarDano: () => void;
  bump: () => void;
  reiniciar: (mapaId: string, ouro: number, vidas: number) => void;
  /** Cutscene da fase: painel atual e mapa. Enquanto existir, o jogo fica pausado. */
  intro: { mapa: string; passo: number } | null;
  iniciarIntro: (mapa: string) => void;
  avancarIntro: () => void;
  pularIntro: () => void;
}

export const useUI = create<EstadoUI>((set, get) => ({
  intro: null,
  tela: 'menu',
  jogoIniciado: false,
  ...lerConfig(),
  skin: lerSkin(),
  skinsCompradas: lerCompradas(),
  definirSkin: (id) => {
    if (!get().skinsCompradas.includes(id)) return false;
    gravarSkin(id);
    set({ skin: id });
    return true;
  },
  comprarSkin: (id) => {
    const st = get();
    const skin = SKINS.find((k) => k.id === id);
    if (!skin || st.skinsCompradas.includes(id) || st.moedas < skin.preco) return false;
    const moedas = st.moedas - skin.preco;
    const compradas = [...st.skinsCompradas, id];
    gravarMoedas(moedas);
    gravarCompradas(compradas);
    set({ moedas, skinsCompradas: compradas });
    return true;
  },
  moedas: lerMoedas(),
  ultimaRecompensa: 0,
  aviso: null,
  pulsoDano: 0,
  ouro: OURO_INICIAL,
  vidas: VIDAS_INICIAIS,
  onda: 1,
  totalOndas: 1,
  fase: 'pausa',
  contagem: 0,
  construirId: null,
  selecionadaId: null,
  velocidade: 1,
  pausado: false,
  mapaId: 'floresta',
  vidasIniciais: VIDAS_INICIAIS,
  progresso: lerProgresso(),
  desafio: false,
  definirDesafio: (v) => set({ desafio: v }),
  habilidade: null,
  definirHabilidade: (h) => set({ habilidade: h, construirId: null, selecionadaId: null, previaToque: false }),
  registrarVitoria: () => {
    const st = get();
    const estrelas = estrelasPorVidas(st.vidas, st.vidasIniciais);
    const k = chaveFase(st.mapaId, st.desafio);
    const progresso = { ...st.progresso, [k]: Math.max(st.progresso[k] ?? 0, estrelas) };
    gravarProgresso(progresso);
    const ganho = recompensaVitoria(estrelas, st.desafio);
    const moedas = st.moedas + ganho;
    gravarMoedas(moedas);
    set({ progresso, moedas, ultimaRecompensa: ganho });
  },
  previaToque: false,
  definirPreviaToque: (v) => set({ previaToque: v }),
  rev: 0,
  ganharOuro: (n) => set((s) => ({ ouro: s.ouro + n })),
  gastarOuro: (n) => {
    if (get().ouro < n) return false;
    set((s) => ({ ouro: s.ouro - n }));
    return true;
  },
  perderVida: (n) => set((s) => ({ vidas: Math.max(0, s.vidas - n) })),
  definirOnda: (n, total) => set({ onda: n, totalOndas: total }),
  definirFase: (f, contagem = 0) => {
    const s = get();
    if (s.fase !== f || s.contagem !== contagem) set({ fase: f, contagem });
  },
  definirConstruir: (id) => set({ construirId: id, selecionadaId: null, previaToque: false, habilidade: null }),
  selecionarTorre: (id) => set({ selecionadaId: id, construirId: null, habilidade: null }),
  definirVelocidade: (v) => set({ velocidade: v }),
  alternarPausa: () => set((s) => ({ pausado: !s.pausado })),
  iniciarIntro: (mapa) => {
    if (!HISTORIA[mapa]) return;
    set({ intro: { mapa, passo: 0 }, pausado: true });
  },
  avancarIntro: () =>
    set((s) => {
      if (!s.intro) return {};
      const total = HISTORIA[s.intro.mapa]?.length ?? 0;
      if (s.intro.passo + 1 >= total) return { intro: null, pausado: false };
      return { intro: { ...s.intro, passo: s.intro.passo + 1 } };
    }),
  pularIntro: () => set({ intro: null, pausado: false }),
  definirTela: (t) => set((s) => ({ tela: t, jogoIniciado: s.jogoIniciado || t === 'jogo', construirId: null })),
  efeitos: lerNivel(),
  definirEfeitos: (n) => {
    gravarNivel(n);
    set({ efeitos: n });
  },
  definirVolumes: (sfx, musica) => {
    set({ volSfx: sfx, volMusica: musica });
    gravarConfig({ volSfx: sfx, volMusica: musica, mudo: get().mudo });
  },
  alternarMudo: () => {
    set((s) => ({ mudo: !s.mudo }));
    gravarConfig({ volSfx: get().volSfx, volMusica: get().volMusica, mudo: get().mudo });
  },
  mostrarAviso: (texto, chefe) => set((s) => ({ aviso: { id: (s.aviso?.id ?? 0) + 1, texto, chefe } })),
  registrarDano: () => set((s) => ({ pulsoDano: s.pulsoDano + 1 })),
  bump: () => set((s) => ({ rev: s.rev + 1 })),
  reiniciar: (mapaId, ouro, vidas) =>
    set({
      mapaId,
      vidasIniciais: vidas,
      habilidade: null,
      ouro,
      vidas,
      onda: 1,
      fase: 'pausa',
      contagem: 0,
      construirId: null,
      selecionadaId: null,
      pausado: false,
      previaToque: false,
      aviso: null,
      pulsoDano: 0,
    }),
}));
