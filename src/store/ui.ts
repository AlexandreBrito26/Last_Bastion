import { MAPA_CAVERNA, RUBI_PRIMEIRA_CAVERNA, desafiosDoDia, diaHoje, lerDesafios, gravarDesafios, progressoDe, type EstadoDesafios, type TipoDesafio } from '../game/data/economia';
import { TORRES } from '../game/data/torres';
import { gravarReliquia, gravarTorresLiberadas, lerTorresLiberadas } from '../game/data/economia';
import { BONUS_SEM_PERDER_VIDA, CONSUMIVEIS, CUSTO_MELHORIA_MOEDA, EFEITO_OURO_EXTRA, EFEITO_OURO_MOEDA, EFEITO_REPARO, EFEITO_VIDAS_MOEDA, gravarConsumiveis, gravarMelhoriasMoeda, lerConsumiveis, lerMelhoriasMoeda, type TipoConsumivel, type TipoMelhoriaMoeda } from '../game/data/economia';
import { create } from 'zustand';
import type { Fase } from '../game/estado';
import { chaveItemTema, gravarEscolhas, gravarPossuidas, lerEscolhas, lerPossuidas, precoDoItem, ITENS_SKIN } from '../game/data/skins';
import {
  CUSTO_CELESTIAL_RUBIS, gravarCelestial, gravarRubis, lerCelestial, lerRubis,
  CUSTO_MELHORIA, EFEITO_INICIAL, EFEITO_VITORIA, NIVEL_MAX, estrelasPorVidas, gravarFasesIniciadas, gravarMelhorias, gravarMoedas, gravarVerdes,
  lerFasesIniciadas, lerMelhorias, lerMoedas, lerVerdes, recompensaVitoria, type TipoMelhoria,
} from '../game/data/economia';
import { gravarNivel, lerNivel, type NivelEfeitos } from '../core/qualidade';
import { cenaDe } from '../game/cenas';

const CHAVE_VISTAS = 'last-bastion:cutscenes-vistas';
function lerVistas(): string[] {
  try {
    const arr = JSON.parse(localStorage.getItem(CHAVE_VISTAS) ?? '[]') as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function gravarVistas(v: string[]): void {
  try {
    localStorage.setItem(CHAVE_VISTAS, JSON.stringify(v));
  } catch {
    /* ignora */
  }
}

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
  /** escolha de skin de cada item (chave do item -> id do tema em SKINS) */
  escolhas: Record<string, string>;
  /** posses: chaves `item|tema` que o jogador comprou */
  possuidas: string[];
  possui: (key: string, temaId: string) => boolean;
  /** equipa um tema num item (precisa ter comprado, ou ser o padrão) */
  equipar: (key: string, temaId: string) => boolean;
  /** compra o tema para um item e já equipa */
  comprarItem: (key: string, temaId: string) => boolean;
  /** aplica um tema a todos os itens que o jogador possui nele */
  equiparTudo: (temaId: string) => number;
  /** moedas verdes (premium, raras; caem dos inimigos) */
  verdes: number;
  ganharVerdes: (n: number) => void;
  /** melhorias permanentes com moeda 🪙 (vidas, ouro inicial, desconto) */
  melhoriasMoeda: Record<TipoMelhoriaMoeda, number>;
  comprarMelhoriaMoeda: (tipo: TipoMelhoriaMoeda) => boolean;
  /** consumíveis comprados com 🪙, usados no início da próxima fase */
  consumiveis: Record<TipoConsumivel, number>;
  comprarConsumivel: (tipo: TipoConsumivel) => boolean;
  /** Relíquia Esmeralda liberada (comprada com 💚) */
  reliquiaLiberada: boolean;
  desbloquearReliquia: () => boolean;
  /** torres liberadas com moedas: id -> liberada */
  torresLiberadas: Record<string, boolean>;
  desbloquearTorre: (id: string) => boolean;

  /** nível de cada melhoria da moeda verde (0 a NIVEL_MAX) */
  melhorias: Record<TipoMelhoria, number>;
  comprarMelhoria: (tipo: TipoMelhoria) => boolean;
  /** verdes ganhos na última vitória (inclui bônus de melhoria) */
  ultimaVerdes: number;
  /** rubis ganhos na última vitória */
  ultimaRubis: number;
  /** aviso discreto (toast) mostrado no topo da partida */
  toast: { id: number; texto: string } | null;
  mostrarToast: (texto: string) => void;
  /** moeda rubi 🔴 (a mais rara, cai dos inimigos) */
  rubis: number;
  ganharRubis: (n: number) => void;
  ganharMoedas: (n: number) => void;
  /** desafios diários: estado do dia atual */
  desafios: EstadoDesafios;
  progredirDesafio: (tipo: TipoDesafio, n?: number) => void;
  resgatarDesafio: (tipo: TipoDesafio) => boolean;
  /** Evolução Celestial do Arqueiro liberada na conta */
  celestialLiberada: boolean;
  desbloquearCelestial: () => boolean;
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
  /** Fases cuja cutscene já foi vista (ou pulada). Alimenta o diário. */
  vistas: string[];
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
  escolhas: lerEscolhas(),
  possuidas: lerPossuidas(),
  possui: (key, temaId) => temaId === 'padrao' || get().possuidas.includes(chaveItemTema(key, temaId)),
  equipar: (key, temaId) => {
    if (!get().possui(key, temaId)) return false;
    const escolhas = { ...get().escolhas, [key]: temaId };
    gravarEscolhas(escolhas);
    set({ escolhas });
    return true;
  },
  comprarItem: (key, temaId) => {
    const st = get();
    if (st.possui(key, temaId)) return st.equipar(key, temaId);
    const { preco, moeda } = precoDoItem(temaId);
    const saldo = moeda === 'verde' ? st.verdes : moeda === 'rubi' ? st.rubis : st.moedas;
    if (saldo < preco) return false;
    if (moeda === 'verde') {
      gravarVerdes(st.verdes - preco);
      set({ verdes: st.verdes - preco });
    } else if (moeda === 'rubi') {
      gravarRubis(st.rubis - preco);
      set({ rubis: st.rubis - preco });
    } else {
      gravarMoedas(st.moedas - preco);
      set({ moedas: st.moedas - preco });
    }
    const possuidas = [...get().possuidas, chaveItemTema(key, temaId)];
    gravarPossuidas(possuidas);
    set({ possuidas });
    return st.equipar(key, temaId);
  },
  equiparTudo: (temaId) => {
    let n = 0;
    const escolhas = { ...get().escolhas };
    for (const it of ITENS_SKIN) {
      if (get().possui(it.key, temaId)) {
        escolhas[it.key] = temaId;
        n++;
      }
    }
    gravarEscolhas(escolhas);
    set({ escolhas });
    return n;
  },
  moedas: lerMoedas(),
  verdes: lerVerdes(),
  melhorias: lerMelhorias(),
  ultimaVerdes: 0,
  ultimaRubis: 0,
  toast: null,
  mostrarToast: (texto) => set((s) => ({ toast: { id: (s.toast?.id ?? 0) + 1, texto } })),
  rubis: lerRubis(),
  desafios: lerDesafios(diaHoje()),
  progredirDesafio: (tipo, n = 1) => {
    const dia = diaHoje();
    const atual = get().desafios.dia === dia ? get().desafios : lerDesafios(dia);
    const sorteados = desafiosDoDia(dia);
    const def = sorteados.find((d) => d.id === tipo);
    if (!def || atual.resgatados[tipo]) return;
    const progresso = { ...atual.progresso, [tipo]: Math.min(def.meta, (atual.progresso[tipo] ?? 0) + n) };
    if ((atual.progresso[tipo] ?? 0) < def.meta && progresso[tipo]! >= def.meta) get().mostrarToast(`Desafio concluído: ${def.nome}`);
    const novo = { ...atual, progresso };
    gravarDesafios(novo);
    set({ desafios: novo });
  },
  resgatarDesafio: (tipo) => {
    const dia = diaHoje();
    const atual = get().desafios.dia === dia ? get().desafios : lerDesafios(dia);
    const def = desafiosDoDia(dia).find((d) => d.id === tipo);
    if (!def || atual.resgatados[tipo] || progressoDe(atual, tipo) < def.meta) return false;
    if (def.recompensa.moedas) get().ganharMoedas(def.recompensa.moedas);
    if (def.recompensa.verdes) get().ganharVerdes(def.recompensa.verdes);
    if (def.recompensa.rubis) get().ganharRubis(def.recompensa.rubis);
    const novo = { ...atual, resgatados: { ...atual.resgatados, [tipo]: true } };
    gravarDesafios(novo);
    set({ desafios: novo });
    return true;
  },
  ganharMoedas: (n) => {
    const moedas = get().moedas + n;
    gravarMoedas(moedas);
    set({ moedas });
  },
  ganharRubis: (n) => {
    const rubis = get().rubis + n;
    gravarRubis(rubis);
    set({ rubis });
  },
  celestialLiberada: lerCelestial(),
  desbloquearCelestial: () => {
    const st = get();
    if (st.celestialLiberada || st.rubis < CUSTO_CELESTIAL_RUBIS) return false;
    const rubis = st.rubis - CUSTO_CELESTIAL_RUBIS;
    gravarRubis(rubis);
    gravarCelestial(true);
    set({ rubis, celestialLiberada: true });
    return true;
  },
  comprarMelhoria: (tipo) => {
    const st = get();
    const nivel = st.melhorias[tipo];
    if (nivel >= NIVEL_MAX) return false;
    const custo = CUSTO_MELHORIA[nivel];
    if (st.verdes < custo) return false;
    const verdes = st.verdes - custo;
    const melhorias = { ...st.melhorias, [tipo]: nivel + 1 };
    gravarVerdes(verdes);
    gravarMelhorias(melhorias);
    set({ verdes, melhorias });
    return true;
  },
  melhoriasMoeda: lerMelhoriasMoeda(),
  comprarMelhoriaMoeda: (tipo) => {
    const st = get();
    const nivel = st.melhoriasMoeda[tipo];
    if (nivel >= NIVEL_MAX) return false;
    const custo = CUSTO_MELHORIA_MOEDA[nivel];
    if (st.moedas < custo) return false;
    const moedas = st.moedas - custo;
    const melhoriasMoeda = { ...st.melhoriasMoeda, [tipo]: nivel + 1 };
    gravarMoedas(moedas);
    gravarMelhoriasMoeda(melhoriasMoeda);
    set({ moedas, melhoriasMoeda });
    return true;
  },
  consumiveis: lerConsumiveis(),
  comprarConsumivel: (tipo: TipoConsumivel) => {
    const st = get();
    const preco = CONSUMIVEIS[tipo].preco;
    if (st.moedas < preco) return false;
    const moedas = st.moedas - preco;
    const consumiveis = { ...st.consumiveis, [tipo]: st.consumiveis[tipo] + 1 };
    gravarMoedas(moedas);
    gravarConsumiveis(consumiveis);
    set({ moedas, consumiveis });
    return true;
  },
  reliquiaLiberada: lerTorresLiberadas().reliquia === true,
  torresLiberadas: lerTorresLiberadas(),
  desbloquearTorre: (id) => {
    const st = get();
    const def = TORRES[id];
    if (!def) return false;
    if (!def.desbloqueio || st.torresLiberadas[id]) return true;
    const { moeda, preco } = def.desbloqueio;
    const saldo = moeda === 'verde' ? st.verdes : st.moedas;
    if (saldo < preco) return false;
    if (moeda === 'verde') {
      gravarVerdes(st.verdes - preco);
      set({ verdes: st.verdes - preco });
    } else {
      gravarMoedas(st.moedas - preco);
      set({ moedas: st.moedas - preco });
    }
    const torresLiberadas = { ...st.torresLiberadas, [id]: true };
    gravarTorresLiberadas(torresLiberadas);
    if (id === 'reliquia') gravarReliquia(true);
    set({ torresLiberadas, reliquiaLiberada: id === 'reliquia' ? true : st.reliquiaLiberada });
    return true;
  },
  desbloquearReliquia: () => get().desbloquearTorre('reliquia'),
  ganharVerdes: (n) => {
    const verdes = get().verdes + n;
    gravarVerdes(verdes);
    set({ verdes });
  },
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
    const primeiraVez = (st.progresso[k] ?? 0) === 0;
    const progresso = { ...st.progresso, [k]: Math.max(st.progresso[k] ?? 0, estrelas) };
    gravarProgresso(progresso);
    const ganho = recompensaVitoria(estrelas, st.desafio);
    const moedas = st.moedas + ganho;
    const perfeita = st.vidas === st.vidasIniciais;
    get().progredirDesafio('vencer_fase', 1);
    if (perfeita) get().progredirDesafio('vencer_sem_perder', 1);
    const verdesGanhos = EFEITO_VITORIA[st.melhorias.vitoria] + (perfeita ? BONUS_SEM_PERDER_VIDA : 0);
    const verdes = st.verdes + verdesGanhos;
    gravarMoedas(moedas);
    gravarVerdes(verdes);
    const rubisGanhos = primeiraVez && st.mapaId === MAPA_CAVERNA && !st.desafio ? RUBI_PRIMEIRA_CAVERNA : 0;
    set({ progresso, moedas, verdes, ultimaRecompensa: ganho, ultimaVerdes: verdesGanhos, ultimaRubis: rubisGanhos });
    if (rubisGanhos > 0) get().ganharRubis(rubisGanhos);
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
  vistas: lerVistas(),
  iniciarIntro: (mapa) => {
    if (!cenaDe(mapa)) return;
    if (!get().vistas.includes(mapa)) {
      const vistas = [...get().vistas, mapa];
      gravarVistas(vistas);
      set({ vistas });
    }
    set({ intro: { mapa, passo: 0 }, pausado: true });
  },
  avancarIntro: () =>
    set((s) => {
      if (!s.intro) return {};
      const total = cenaDe(s.intro.mapa)?.paineis.length ?? 0;
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
  reiniciar: (mapaId, ouro, vidas) => {
    // bônus inicial: verdes pagos só na primeira vez que a fase é iniciada
    const st = get();
    const chave = chaveFase(mapaId, st.desafio);
    const iniciadas = lerFasesIniciadas();
    let verdes = st.verdes;
    if (!iniciadas[chave]) {
      verdes += EFEITO_INICIAL[st.melhorias.inicial];
      gravarVerdes(verdes);
      gravarFasesIniciadas({ ...iniciadas, [chave]: true });
    }
    const mm = get().melhoriasMoeda;
    const consFinal = { ...get().consumiveis };
    let vidasFinal = vidas + EFEITO_VIDAS_MOEDA[mm.vidas];
    let ouroFinal = ouro + EFEITO_OURO_MOEDA[mm.ouro];
    if (consFinal.reparo > 0) { consFinal.reparo -= 1; vidasFinal += EFEITO_REPARO; }
    if (consFinal.ouroExtra > 0) { consFinal.ouroExtra -= 1; ouroFinal += EFEITO_OURO_EXTRA; }
    gravarConsumiveis(consFinal);
    set({ verdes, consumiveis: consFinal,
      mapaId,
      vidasIniciais: vidasFinal,
      habilidade: null,
      ouro: ouroFinal,
      vidas: vidasFinal,
      onda: 1,
      fase: 'pausa',
      contagem: 0,
      construirId: null,
      selecionadaId: null,
      pausado: false,
      previaToque: false,
      aviso: null,
      pulsoDano: 0,
    });
  },
}));
