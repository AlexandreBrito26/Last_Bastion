import { Application, BlurFilter, ColorMatrixFilter, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { COR } from '../core/cores';
import { INIMIGOS } from '../game/data/inimigos';
import { formaTorre, ramoPrincipal, statsTorre, TORRES } from '../game/data/torres';
import { corBastiao, corInimigo, corProjetil, corTorre, formaProjetil } from '../game/data/skins';
import { custoTorre, posicaoValida } from '../game/construcao';
import { HAB } from '../game/acoes';
import { fx } from '../game/feedback';
import { calorLigado, CELULA_CALOR, gradeCalor } from '../game/calor';
import { brilhoBorda, contorno, corpoRespirando } from './sprites';
import { entrada, ref } from '../game/ref';
import { useUI } from '../store/ui';
import { limitesDe, type NivelEfeitos } from '../core/qualidade';
import type { Mapa } from '../game/data/mapas';
import type { Inimigo, Mundo, Torre } from '../game/estado';
import { gerarChao, gerarVinheta, TEMAS } from './arte';

const TAU = Math.PI * 2;

const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function mix(a: number, b: number, t: number): number {
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
  const g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
  const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
  return (r << 16) | (g << 8) | bl;
}
const escurecer = (c: number, f: number) => mix(c, 0x000000, f);
const clarear = (c: number, f: number) => mix(c, 0xffffff, f);

function rot(cx: number, cy: number, a: number, pts: number[]): number[] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const o: number[] = [];
  for (let i = 0; i < pts.length; i += 2) o.push(cx + pts[i] * c - pts[i + 1] * s, cy + pts[i] * s + pts[i + 1] * c);
  return o;
}

function poligono(cx: number, cy: number, r: number, n: number, a0 = 0): number[] {
  const o: number[] = [];
  for (let i = 0; i < n; i++) o.push(cx + Math.cos(a0 + (i / n) * TAU) * r, cy + Math.sin(a0 + (i / n) * TAU) * r);
  return o;
}

function difAngulo(a: number, b: number): number {
  let d = b - a;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

interface Ambiente {
  x: number;
  y: number;
  v: number;
  f: number;
}

export class Renderizador {
  app = new Application();
  private mundo = new Container();
  private camadaChao = new Container();
  private entidades = new Graphics();
  private particulas = new Graphics();
  private brilho = new Graphics();
  private calor = new Graphics();
  private camadaTexto = new Container();
  private camadaVinheta = new Container();
  private textos: Text[] = [];
  private coresTexto = new WeakMap<Text, number>();

  private mapaAtual: Mapa | null = null;
  private ambiente: Ambiente[] = [];
  private angTorre = new Map<number, number>();
  private dirInimigo = new Map<number, { x: number; y: number; a: number }>();
  private blur: BlurFilter | null = null;
  private baixa = false;
  private nivelAplicado: string | null = null;
  private luzOn = true;
  private filtroCor: ColorMatrixFilter | null = null;

  /** Nível efetivo: se o aparelho precisou de ajuda automática, 'alto' cai para 'médio'. */
  private nivelEfetivo(): NivelEfeitos {
    const n = useUI.getState().efeitos;
    return this.baixa && n === 'alto' ? 'medio' : n;
  }

  /** Reaplica os filtros quando o nível muda (sem custo por quadro). */
  private aplicarNivel(): void {
    const nivel = this.nivelEfetivo();
    if (nivel === this.nivelAplicado) return;
    this.nivelAplicado = nivel;
    const lim = limitesDe(nivel);
    this.luzOn = lim.luz;
    this.brilho.filters = lim.desfoque && this.blur ? [this.blur] : [];
    this.brilho.visible = lim.luz;
    this.mundo.filters = lim.corMundo && !this.baixa && this.filtroCor ? [this.filtroCor] : [];
  }
  private ema = 16;
  private ultimo = performance.now();
  private quadros = 0;
  /** Posições suavizadas por inimigo (interpolação visual entre ticks de 60 Hz). */
  private suaves = new Map<number, { x: number; y: number }>();
  private tQuadro = performance.now();
  private dtQuadro = 1 / 60;

  async iniciar(host: HTMLElement, mapa: Mapa): Promise<void> {
    await this.app.init({
      width: mapa.largura,
      height: mapa.altura,
      background: COR.ceu,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';
    host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.mundo);
    this.brilho.blendMode = 'add';
    try {
      this.blur = new BlurFilter({ strength: 7, quality: 2 });
      this.blur.resolution = 0.5;
      this.brilho.filters = [this.blur];
    } catch {
      this.blur = null;
    }
    this.mundo.addChild(this.camadaChao, this.calor, this.entidades, this.particulas, this.brilho, this.camadaTexto, this.camadaVinheta);
    this.montarMapa(mapa);
  }

  /** Gera (uma vez por fase) o chão procedural, a vinheta e a gradação de cor do tema. */
  private montarMapa(mapa: Mapa): void {
    this.mapaAtual = mapa;
    const tema = TEMAS[mapa.tema];
    for (const c of [this.camadaChao, this.camadaVinheta]) {
      for (const f of c.removeChildren()) f.destroy({ texture: true, textureSource: true });
    }
    const chao = new Sprite(Texture.from(gerarChao(mapa)));
    chao.width = mapa.largura;
    chao.height = mapa.altura;
    this.camadaChao.addChild(chao);
    const vig = new Sprite(Texture.from(gerarVinheta(Math.round(mapa.largura / 2), Math.round(mapa.altura / 2), tema.vinheta)));
    vig.width = mapa.largura;
    vig.height = mapa.altura;
    this.camadaVinheta.addChild(vig);

    this.filtroCor = null;
    if (limitesDe(this.nivelEfetivo()).corMundo && !this.baixa) {
      try {
        const f = new ColorMatrixFilter();
        f.saturate(tema.grade.sat - 1, true);
        f.contrast(tema.grade.con - 1, true);
        f.tint(tema.grade.tint, true);
        this.filtroCor = f;
        this.mundo.filters = [f];
      } catch {
        this.mundo.filters = [];
      }
    }

    let semente = 1234 + mapa.id.length * 77;
    const rnd = () => {
      semente = (semente * 16807) % 2147483647;
      return semente / 2147483647;
    };
    this.ambiente = Array.from({ length: 38 }, () => ({ x: rnd() * mapa.largura, y: rnd() * mapa.altura, v: rnd(), f: rnd() * TAU }));
    this.angTorre.clear();
    this.dirInimigo.clear();
  }

  private textoDoPool(i: number): Text {
    let t = this.textos[i];
    if (!t) {
      t = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: '700', fill: COR.ouro, stroke: { color: 0x000000, width: 3 } } });
      t.anchor.set(0.5);
      this.camadaTexto.addChild(t);
      this.textos.push(t);
    }
    return t;
  }

  // ---------- luz ----------

  private luz(x: number, y: number, r: number, cor: number, a: number): void {
    if (!this.luzOn) return;
    this.brilho.circle(x, y, r).fill({ color: cor, alpha: a * 0.35 });
    this.brilho.circle(x, y, r * 0.55).fill({ color: cor, alpha: a * 0.55 });
  }

  private tracejado(g: Graphics, x: number, y: number, r: number, cor: number, alfa: number, fase: number): void {
    const n = 28;
    for (let i = 0; i < n; i += 2) {
      const a0 = fase + (i / n) * TAU;
      const a1 = fase + ((i + 1) / n) * TAU;
      g.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r).arc(x, y, r, a0, a1).stroke({ width: 1.5, color: cor, alpha: alfa });
    }
  }

  // ---------- torres ----------

  private anguloTorre(t: Torre, m: Mundo): number {
    const alc = statsTorre(t).alcance;
    const def = TORRES[t.defId];
    let melhor: Inimigo | null = null;
    let md = alc * alc;
    for (const e of m.inimigos) {
      if (!e.vivo) continue;
      if (INIMIGOS[e.defId].voador && !def.antiAereo) continue;
      const d = (e.pos.x - t.pos.x) ** 2 + (e.pos.y - t.pos.y) ** 2;
      if (d < md) {
        md = d;
        melhor = e;
      }
    }
    let a = this.angTorre.get(t.id) ?? -Math.PI / 2;
    if (melhor) {
      const alvo = Math.atan2(melhor.pos.y - t.pos.y, melhor.pos.x - t.pos.x);
      a += difAngulo(a, alvo) * (1 - Math.pow(0.75, this.dtQuadro * 60));
    }
    this.angTorre.set(t.id, a);
    return a;
  }

  private torre(t: Torre, m: Mundo, tempo: number): void {
    const g = this.entidades;
    const def = TORRES[t.defId];
    const k = Math.min(1, t.idade / 0.28);
    const esc = k < 1 ? Math.max(0.05, easeOutBack(k)) : 1;
    const cx = t.pos.x;
    const cy = t.pos.y;
    const a = this.anguloTorre(t, m);
    const cor = corTorre(def.id, def.cor, useUI.getState().skin);
    const flash = Math.min(1, t.flash / 0.09);
    const recuo = flash * 4;
    const ramo = ramoPrincipal(t);
    const corCaminho = ramo === 0 ? COR.torreArcana : ramo === 1 ? COR.inimigoElite : cor;

    // sombra e plinto
    g.ellipse(cx + 4, cy + 12 * esc, 19 * esc, 8 * esc).fill({ color: 0x000000, alpha: 0.38 });
    g.poly(poligono(cx, cy + 2 * esc, 17 * esc, 8, Math.PI / 8)).fill(0x1b262d);
    g.poly(poligono(cx, cy, 16 * esc, 8, Math.PI / 8)).fill(0x41555f);
    g.poly(poligono(cx, cy - 1.5 * esc, 13.5 * esc, 8, Math.PI / 8)).fill(0x566c77);
    g.poly(poligono(cx, cy, 16 * esc, 8, Math.PI / 8)).stroke({ width: 1.5, color: clarear(0x41555f, 0.35), alpha: 0.8 });
    brilhoBorda(g, cx, cy - 1.5 * esc, 13.5 * esc, 0xffffff, 0.14);
    if (t.nivel > 1) g.poly(poligono(cx, cy, 17.5 * esc, 8, Math.PI / 8)).stroke({ width: 2, color: corCaminho, alpha: 0.9 });
    const forma = formaTorre(t);
    if (forma > 1) {
      // anel dourado a partir da 2ª forma; a 4ª forma ganha um segundo anel mais externo
      g.poly(poligono(cx, cy, (20 + forma) * esc, 8, Math.PI / 8)).stroke({ width: 1.5, color: COR.ouro, alpha: 0.35 + forma * 0.1 });
      if (forma === 4) g.poly(poligono(cx, cy, 24 * esc, 8, Math.PI / 8)).stroke({ width: 1, color: COR.ouro, alpha: 0.5 });
    }

    const s = esc;
    switch (def.id) {
      case 'arqueiro': {
        g.circle(cx, cy - 2 * s, 8 * s).fill(escurecer(cor, 0.45));
        g.circle(cx, cy - 3 * s, 7 * s).fill(cor);
        contorno(g, cx, cy - 3 * s, 7 * s, 7 * s, 0.5);
        brilhoBorda(g, cx, cy - 3 * s, 7 * s, 0xffffff, 0.3);
        g.circle(cx - 2 * s, cy - 5 * s, 2.4 * s).fill({ color: 0xffffff, alpha: 0.55 });
        const pts = (p: number[]) => rot(cx, cy - 3 * s, a, p.map((v) => v * s));
        const haste = pts([-3, 0, 12 - recuo, 0]);
        g.moveTo(haste[0], haste[1]).lineTo(haste[2], haste[3]).stroke({ width: 3, color: 0x5a3a22 });
        const arco = pts([6 - recuo * 0.5, -10, 10 - recuo * 0.5, 0, 6 - recuo * 0.5, 10]);
        g.moveTo(arco[0], arco[1]).lineTo(arco[2], arco[3]).lineTo(arco[4], arco[5]).stroke({ width: 2.5, color: 0xe8d4a0 });
        const corda = pts([6 - recuo * 0.5, -10, 1 - recuo, 0, 6 - recuo * 0.5, 10]);
        g.moveTo(corda[0], corda[1]).lineTo(corda[2], corda[3]).lineTo(corda[4], corda[5]).stroke({ width: 1, color: 0xffffff, alpha: 0.8 });
        if (t.flash <= 0) {
          const seta = pts([0, 0, 13, 0]);
          g.moveTo(seta[0], seta[1]).lineTo(seta[2], seta[3]).stroke({ width: 1.5, color: COR.ouro });
        }
        break;
      }
      case 'canhao': {
        const barril = rot(cx, cy - 2 * s, a, [-5, -5.5, 15 - recuo, -5, 15 - recuo, 5, -5, 5.5].map((v) => v * s));
        g.poly(barril).fill(0x1d2a3a);
        g.poly(rot(cx, cy - 2 * s, a, [-5, -5.5, 15 - recuo, -5, 15 - recuo, -1.5, -5, -1.5].map((v) => v * s))).fill({ color: 0xffffff, alpha: 0.12 });
        g.poly(rot(cx, cy - 2 * s, a, [11 - recuo, -6.5, 17 - recuo, -6.5, 17 - recuo, 6.5, 11 - recuo, 6.5].map((v) => v * s))).fill(cor);
        g.circle(cx, cy - 2 * s, 9 * s).fill(escurecer(cor, 0.4));
        g.circle(cx, cy - 3 * s, 8 * s).fill(cor);
        contorno(g, cx, cy - 3 * s, 8 * s, 8 * s, 0.5);
        brilhoBorda(g, cx, cy - 3 * s, 8 * s, 0xffffff, 0.3);
        g.circle(cx - 2.5 * s, cy - 6 * s, 2.8 * s).fill({ color: 0xffffff, alpha: 0.5 });
        break;
      }
      case 'gelo': {
        const pulso = 0.5 + 0.5 * Math.sin(tempo * 3 + t.id);
        g.poly(poligono(cx, cy - 4 * s, 10 * s, 6, tempo * 0.4)).fill(escurecer(cor, 0.35));
        g.poly(poligono(cx, cy - 5 * s, 8.5 * s, 6, tempo * 0.4)).fill(cor);
        g.poly(poligono(cx, cy - 5 * s, 4.5 * s, 6, -tempo * 0.7)).fill({ color: 0xffffff, alpha: 0.65 + 0.3 * pulso });
        for (let i = 0; i < 3; i++) {
          const o = tempo * 1.4 + (i * TAU) / 3;
          g.poly(rot(cx + Math.cos(o) * 13 * s, cy - 5 * s + Math.sin(o) * 5 * s, o, [0, -3, 2, 0, 0, 3, -2, 0].map((v) => v * s))).fill(0xe8fbff);
        }
        this.luz(cx, cy - 5, 24 + pulso * 6 + flash * 10, 0x6fdcff, 0.45 + flash * 0.4);
        break;
      }
      case 'tesla': {
        const pulso = 0.5 + 0.5 * Math.sin(tempo * 7 + t.id);
        g.rect(cx - 5 * s, cy - 12 * s, 10 * s, 14 * s).fill(0x2a1b3d);
        for (let i = 0; i < 3; i++) g.ellipse(cx, cy - (3 + i * 4) * s, (10 - i * 1.5) * s, 3 * s).fill(i % 2 ? 0x7d3cc2 : 0x4a2480);
        g.circle(cx, cy - 15 * s, (5 + pulso * 1.2) * s).fill(0xe9d0ff);
        g.circle(cx, cy - 15 * s, 3 * s).fill(0xffffff);
        this.luz(cx, cy - 15, 26 + pulso * 8 + flash * 14, 0xb06cff, 0.55 + flash * 0.4);
        if (flash > 0.2) {
          for (let i = 0; i < 3; i++) {
            const an = Math.random() * TAU;
            g.moveTo(cx, cy - 15).lineTo(cx + Math.cos(an) * 16, cy - 15 + Math.sin(an) * 16).stroke({ width: 1.5, color: 0xf3e5ff });
          }
        }
        break;
      }
      case 'morteiro': {
        g.circle(cx, cy - 1 * s, 11 * s).fill(escurecer(cor, 0.55));
        g.circle(cx, cy - 2 * s, 10 * s).fill(escurecer(cor, 0.25));
        const barril = rot(cx, cy - 3 * s, a, [-6, -8, 13 - recuo, -7, 13 - recuo, 7, -6, 8].map((v) => v * s));
        g.poly(barril).fill(0x3a2a1c);
        g.poly(rot(cx, cy - 3 * s, a, [0, -8, 3, -8, 3, 8, 0, 8].map((v) => v * s))).fill(cor);
        g.poly(rot(cx, cy - 3 * s, a, [9 - recuo, -7.5, 13 - recuo, -7.5, 13 - recuo, 7.5, 9 - recuo, 7.5].map((v) => v * s))).fill(cor);
        g.circle(cx - 3 * s, cy - 6 * s, 2.6 * s).fill({ color: 0xffffff, alpha: 0.4 });
        break;
      }
      case 'alquimista': {
        const borb = 0.5 + 0.5 * Math.sin(tempo * 5 + t.id);
        g.circle(cx, cy - 2 * s, 9 * s).fill(escurecer(cor, 0.45));
        g.circle(cx, cy - 3 * s, 8 * s).fill(cor);
        g.circle(cx, cy - 3 * s, 5.5 * s).fill({ color: 0xdfffd0, alpha: 0.35 + 0.25 * borb });
        const tubo = rot(cx, cy - 4 * s, a, [-3, -2, 12 - recuo, -2, 12 - recuo, 2, -3, 2].map((v) => v * s));
        g.poly(tubo).fill(0x3d5a3a);
        g.circle(cx + Math.cos(a) * (12 - recuo) * s, cy - 4 * s + Math.sin(a) * (12 - recuo) * s, 3.2 * s).fill(0x2a4a2a);
        for (let i = 0; i < 3; i++) {
          const o = tempo * 2 + i * 2.1 + t.id;
          g.circle(cx - 4 * s + Math.cos(o) * 3 * s, cy - 12 * s - (((tempo * 6 + i * 5) % 10) * s * 0.6), 1.6 * s).fill({ color: 0xb6ff9a, alpha: 0.7 });
        }
        g.circle(cx - 2.5 * s, cy - 6 * s, 2.6 * s).fill({ color: 0xffffff, alpha: 0.45 });
        this.luz(cx, cy - 5, 20 + borb * 6, 0x7cff6b, 0.35 + flash * 0.3);
        break;
      }
      default:
        g.rect(cx - 8 * s, cy - 8 * s, 16 * s, 16 * s).fill(cor);
    }

    // brilho do disparo na boca
    if (flash > 0 && def.id !== 'tesla' && def.id !== 'gelo') this.luz(cx + Math.cos(a) * 18, cy - 3 + Math.sin(a) * 18, 18, cor, 0.9 * flash);

    // marcações de nível
    if (k >= 1) {
      for (let i = 0; i < t.nivel; i++) {
        const px = cx - (t.nivel - 1) * 3.5 + i * 7;
        g.circle(px, cy + 17.5, 2.6).fill(0x000000);
        g.circle(px, cy + 17, 2.1).fill(i === 2 ? corCaminho : COR.ouro);
      }
    }
    if (t.melhoria > 0) {
      const u = 1 - t.melhoria / 0.5;
      g.circle(cx, cy, 18 + u * 26).stroke({ width: 3, color: COR.ouro, alpha: 1 - u });
      this.luz(cx, cy, 30 + u * 30, COR.ouro, 0.7 * (1 - u));
    }
  }

  // ---------- inimigos ----------

  private olhos(g: Graphics, ex: number, ey: number, r: number, a: number, cor = 0xffffff): void {
    const px = Math.cos(a + Math.PI / 2);
    const py = Math.sin(a + Math.PI / 2);
    const bx = ex + Math.cos(a) * r * 0.42;
    const by = ey + Math.sin(a) * r * 0.42 - r * 0.08;
    for (const sgn of [-1, 1]) {
      const x = bx + px * r * 0.3 * sgn;
      const y = by + py * r * 0.3 * sgn;
      g.circle(x, y, r * 0.24).fill(cor);
      g.circle(x + Math.cos(a) * r * 0.08, y + Math.sin(a) * r * 0.08, r * 0.12).fill(0x14080c);
    }
  }

  /** Posição visual: segue a lógica com amortecimento exponencial (sem saltos a 60 Hz). Teleporte grande = snap. */
  private posSuave(e: Inimigo): { x: number; y: number } {
    let s = this.suaves.get(e.id);
    const dx = e.pos.x - (s?.x ?? 0);
    const dy = e.pos.y - (s?.y ?? 0);
    if (!s || dx * dx + dy * dy > 90 * 90) {
      s = { x: e.pos.x, y: e.pos.y };
      this.suaves.set(e.id, s);
      return s;
    }
    const k = 1 - Math.exp(-this.dtQuadro * 24);
    s.x += (e.pos.x - s.x) * k;
    s.y += (e.pos.y - s.y) * k;
    return s;
  }

  /** Desenho do bastião no fim da trilha: torre de pedra com merlões e bandeira na cor da skin. */
  private bastiao(g: Graphics, x: number, y: number, cor: number, tempo: number): void {
    const pedra = 0x3a3350;
    const s = 1;
    g.circle(x, y + 6 * s, 24 * s).fill({ color: 0x000000, alpha: 0.25 });
    g.rect(x - 13 * s, y - 10 * s, 26 * s, 24 * s).fill(pedra).stroke({ width: 2, color: escurecer(pedra, 0.5) });
    for (const dx of [-13, -4, 5]) g.rect((x + dx) * s, (y - 16) * s, 8 * s, 6 * s).fill(pedra).stroke({ width: 1.5, color: escurecer(pedra, 0.5) });
    g.rect(x - 4 * s, y - 2 * s, 8 * s, 10 * s).fill({ color: 0x0b0a14 });
    g.moveTo(x, y - 10 * s).lineTo(x, y - 34 * s).stroke({ width: 2, color: 0x5a3a22 });
    const onda = Math.sin(tempo * 4) * 3;
    g.poly([x, y - 34 * s, x + 16 * s, y - 30 * s + onda, x, y - 26 * s]).fill({ color: cor, alpha: 0.95 });
  }

  private inimigo(e: Inimigo, m: Mundo, tempo: number): void {
    const g = this.entidades;
    const def = INIMIGOS[e.defId];
    const r = def.raio;
    const p = this.posSuave(e);

    // direção do movimento (suavizada)
    let d = this.dirInimigo.get(e.id);
    if (!d) {
      d = { x: p.x, y: p.y, a: 0 };
      this.dirInimigo.set(e.id, d);
    }
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    if (dx * dx + dy * dy > 0.0004) d.a += difAngulo(d.a, Math.atan2(dy, dx)) * (1 - Math.pow(0.8, this.dtQuadro * 60));
    d.x = p.x;
    d.y = p.y;
    const a = d.a;

    const bob = def.voador ? Math.sin(m.tempo * 7 + e.id) * 2.5 : 0;
    const ex = p.x;
    const ey = p.y + bob;
    const corBase = corInimigo(def.id, def.cor, useUI.getState().skin);
    const c = def.chefe ? mix(corBase, 0xff2a00, Math.min(1, e.fases * 0.28)) : corBase;
    const esc = escurecer(c, 0.38);
    const cla = clarear(c, 0.45);
    const passo = Math.sin(m.tempo * (def.velocidade / 8) + e.id);
    const perp = a + Math.PI / 2;

    // sombra no chão
    g.ellipse(ex, p.y + (def.voador ? r + 12 : r * 0.8), r * (def.voador ? 0.7 : 1.05), r * 0.38).fill({ color: 0x000000, alpha: def.voador ? 0.2 : 0.3 });

    if (def.voador) {
      const asa = Math.abs(Math.sin(m.tempo * 24 + e.id));
      for (const sg of [-1, 1]) {
        const base = [0, 0, -r * 0.9, sg * r * (0.9 + 1.1 * asa), r * 0.8, sg * r * 0.8];
        g.poly(rot(ex, ey, a, base)).fill({ color: c, alpha: 0.85 });
        g.poly(rot(ex, ey, a, [0, 0, -r * 0.5, sg * r * (0.5 + 0.8 * asa), r * 0.3, sg * r * 0.5])).fill({ color: cla, alpha: 0.5 });
      }
      if (def.chefe) {
        const pulso = 0.5 + 0.5 * Math.sin(m.tempo * 4);
        this.luz(ex, ey, r * 3 + pulso * 10, 0xff7a10, 0.5 + 0.2 * pulso);
        g.star(ex, ey, 9, r * 1.45, r * 1.05, tempo * 0.35).fill(0x2a0d08);
        g.star(ex, ey, 9, r * 1.3, r * 0.98, tempo * 0.35).fill(esc);
      }
      g.circle(ex, ey, r * 0.75).fill(esc);
      g.circle(ex, ey - 1, r * 0.68).fill(c);
      contorno(g, ex, ey - 1, r * 0.68, r * 0.68);
      brilhoBorda(g, ex, ey - 1, r * 0.68, cla, 0.4);
      this.olhos(g, ex, ey, r * 0.95, a, 0xfff2a8);
      this.luz(ex, ey, r * 2.4, c, 0.4);
    } else if (def.id === 'rapido') {
      for (let i = 1; i <= 3; i++) g.moveTo(ex - Math.cos(a) * r * (1.4 + i * 0.7), ey - Math.sin(a) * r * (1.4 + i * 0.7) + (i - 2) * 3).lineTo(ex - Math.cos(a) * r * (2.4 + i), ey - Math.sin(a) * r * (2.4 + i) + (i - 2) * 3).stroke({ width: 1.5, color: c, alpha: 0.28 });
      const corpo = [-1.3 * r, 0, -0.4 * r, -0.72 * r, 1.05 * r, -0.4 * r, 1.4 * r, 0, 1.05 * r, 0.4 * r, -0.4 * r, 0.72 * r];
      g.poly(rot(ex, ey + 1.5, a, corpo)).fill(esc);
      g.poly(rot(ex, ey, a, corpo)).fill(c);
      g.poly(rot(ex, ey - r * 0.2, a, [-0.6 * r, 0, 0.6 * r, -0.2 * r, 0.9 * r, 0, 0.6 * r, 0.1 * r].map((v) => v * 0.8))).fill({ color: cla, alpha: 0.5 });
      this.olhos(g, ex, ey, r * 0.95, a);
    } else if (def.id === 'tanque') {
      g.circle(ex + perp * 0 + Math.cos(perp) * r * 0.85, ey + Math.sin(perp) * r * 0.85, r * 0.3).fill(0x1c1c22);
      g.circle(ex - Math.cos(perp) * r * 0.85, ey - Math.sin(perp) * r * 0.85, r * 0.3).fill(0x1c1c22);
      g.poly(poligono(ex, ey + 2, r * 1.08, 6, a)).fill(esc);
      g.poly(poligono(ex, ey, r * 1.02, 6, a)).fill(c);
      g.poly(poligono(ex, ey - 1, r * 0.72, 6, a)).fill(clarear(c, 0.18));
      for (let i = 0; i < 6; i++) g.circle(ex + Math.cos(a + (i / 6) * TAU + 0.52) * r * 0.9, ey + Math.sin(a + (i / 6) * TAU + 0.52) * r * 0.9, 1.4).fill(0xd8d8e0);
      g.poly(rot(ex, ey, a, [r * 0.15, -r * 0.35, r * 0.75, -r * 0.2, r * 0.75, r * 0.2, r * 0.15, r * 0.35])).fill(0x14060c);
      g.circle(ex + Math.cos(a) * r * 0.5, ey + Math.sin(a) * r * 0.5, r * 0.1).fill(0xff3040);
      if (e.quebraTempo > 0) for (let i = 0; i < 3; i++) g.moveTo(ex - r * 0.5 + i * r * 0.4, ey - r * 0.7).lineTo(ex - r * 0.3 + i * r * 0.4, ey + r * 0.5).stroke({ width: 1.5, color: 0xff6040, alpha: 0.8 });
    } else if (def.id === 'sapador') {
      g.poly(poligono(ex, ey + 2, r * 1.1, 6, a)).fill(esc);
      g.poly(poligono(ex, ey, r * 1.04, 6, a)).fill(c);
      g.poly(poligono(ex, ey - 1, r * 0.66, 6, a)).fill(clarear(c, 0.2));
      const px = ex + Math.cos(a) * r * 1.5;
      const py = ey + Math.sin(a) * r * 1.5;
      g.moveTo(ex + Math.cos(a) * r * 0.2, ey + Math.sin(a) * r * 0.2).lineTo(px, py).stroke({ width: 2.5, color: 0x6b4a2a });
      g.poly(poligono(px, py, r * 0.42, 3, a)).fill(0xc0c4cc);
      this.olhos(g, ex, ey, r * 0.85, a, 0xffd0a0);
    } else if (def.chefe) {
      const pulso = 0.5 + 0.5 * Math.sin(m.tempo * 4);
      this.luz(ex, ey, r * 3.2 + pulso * 10, 0xff7a10, 0.55 + 0.2 * pulso);
      g.star(ex, ey, 9, r * 1.45, r * 1.05, tempo * 0.35).fill(0x2a0d08);
      g.star(ex, ey, 9, r * 1.3, r * 0.98, tempo * 0.35).fill(esc);
      g.circle(ex, ey + 2, r).fill(esc);
      g.circle(ex, ey, r * 0.96).fill(c);
      contorno(g, ex, ey, r * 0.96, r * 0.96, 0.7);
      brilhoBorda(g, ex, ey, r * 0.96, cla, 0.5);
      g.circle(ex - r * 0.25, ey - r * 0.3, r * 0.5).fill({ color: cla, alpha: 0.4 });
      g.circle(ex, ey, r * 0.62).stroke({ width: 2, color: 0x2a0d08, alpha: 0.7 });
      for (const sg of [-1, 1]) g.poly(rot(ex, ey, a, [r * 0.3, sg * r * 0.55, r * 0.95, sg * r * 1.25, r * 0.7, sg * r * 0.45])).fill(0xf3e2c0);
      this.olhos(g, ex, ey, r * 0.9, a, 0xffe14a);
      this.luz(ex + Math.cos(a) * r * 0.4, ey + Math.sin(a) * r * 0.4, r * 0.9, 0xffe14a, 0.6);
    } else {
      // básico, enxame, curandeiro
      if (def.id !== 'enxame') {
        g.circle(ex + Math.cos(perp) * r * 0.75 + Math.cos(a) * passo * r * 0.4, ey + Math.sin(perp) * r * 0.75 + Math.sin(a) * passo * r * 0.4 + r * 0.2, r * 0.28).fill(esc);
        g.circle(ex - Math.cos(perp) * r * 0.75 - Math.cos(a) * passo * r * 0.4, ey - Math.sin(perp) * r * 0.75 - Math.sin(a) * passo * r * 0.4 + r * 0.2, r * 0.28).fill(esc);
      } else {
        const bat = Math.sin(m.tempo * 40 + e.id);
        g.ellipse(ex - Math.cos(perp) * r, ey - Math.sin(perp) * r, r * 0.9, r * (0.35 + 0.15 * bat)).fill({ color: 0xffffff, alpha: 0.35 });
        g.ellipse(ex + Math.cos(perp) * r, ey + Math.sin(perp) * r, r * 0.9, r * (0.35 - 0.15 * bat)).fill({ color: 0xffffff, alpha: 0.35 });
      }
      g.circle(ex, ey + 1.6, r).fill(esc);
      corpoRespirando(g, ex, ey - 0.6, r * 0.96, passo, c);
      brilhoBorda(g, ex, ey - 0.6, r * 0.96, cla, 0.45);
      g.ellipse(ex - r * 0.28, ey - r * 0.42, r * 0.38, r * 0.2).fill({ color: 0xffffff, alpha: 0.42 });
      this.olhos(g, ex, ey, r, a);
      if (def.cura) {
        g.rect(ex - 1.6, ey - 5.5, 3.2, 11).fill(0xffffff);
        g.rect(ex - 5.5, ey - 1.6, 11, 3.2).fill(0xffffff);
        const onda = (m.tempo % def.cura.intervalo) / def.cura.intervalo;
        g.circle(ex, ey, def.cura.raio * onda).stroke({ width: 1.5, color: COR.vida, alpha: 0.3 * (1 - onda) });
        this.luz(ex, ey, r * 2.4, COR.vida, 0.45);
      }
    }

    // estados
    if (e.flash > 0) g.circle(ex, ey, r + 1.5).fill({ color: 0xffffff, alpha: 0.7 * (e.flash / 0.1) });
    if (e.lentTempo > 0) {
      g.circle(ex, ey, r + 3).fill({ color: 0x9fe8ff, alpha: 0.22 });
      g.circle(ex, ey, r + 3).stroke({ width: 2, color: 0xcaf0f8, alpha: 0.9 });
    }
    if (e.queimaTempo > 0) {
      for (let i = 0; i < 3; i++) {
        const fx0 = ex + Math.sin(m.tempo * 18 + i * 2) * r * 0.6;
        const fy0 = ey - r * 0.4 - ((m.tempo * 40 + i * 9) % 14);
        g.circle(fx0, fy0, 2.6 - i * 0.5).fill(i % 2 ? 0xffd60a : 0xf8961e);
      }
      this.luz(ex, ey - r * 0.4, r * 2, 0xff7a10, 0.5);
    }
    if (e.atordTempo > 0) {
      for (let i = 0; i < 3; i++) {
        const an = m.tempo * 8 + (i * TAU) / 3;
        g.star(ex + Math.cos(an) * 9, ey - r - 10 + Math.sin(an) * 2.5, 4, 3, 1.2, an).fill(COR.ouro);
      }
    }

    // barra de vida
    if (e.vida < e.vidaMax || def.chefe) {
      const w = def.chefe ? 60 : 26;
      const y = ey - r - (def.chefe ? 16 : 9);
      const p = Math.max(0, e.vida / e.vidaMax);
      g.roundRect(ex - w / 2 - 1, y - 1, w + 2, 6, 3).fill({ color: 0x000000, alpha: 0.75 });
      g.roundRect(ex - w / 2, y, Math.max(2, w * p), 4, 2).fill(p > 0.6 ? 0x4ade80 : p > 0.3 ? 0xfacc15 : 0xf43f5e);
      g.rect(ex - w / 2, y, Math.max(2, w * p), 1.2).fill({ color: 0xffffff, alpha: 0.35 });
    }
  }

  // ---------- quadro ----------

  /** Mapa de calor: células em tons de amarelo a vermelho conforme o tempo que os inimigos passaram ali. */
  private desenharCalor(): void {
    const c = this.calor;
    c.clear();
    if (!calorLigado()) return;
    const { cols, rows, grade, maximo } = gradeCalor();
    if (maximo <= 0) return;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const v = grade[r * cols + k] / maximo;
        if (v <= 0.02) continue;
        const cor = v > 0.6 ? 0xff3b2f : v > 0.3 ? 0xff9f1c : 0xffe066;
        c.rect(k * CELULA_CALOR, r * CELULA_CALOR, CELULA_CALOR, CELULA_CALOR).fill({ color: cor, alpha: 0.12 + v * 0.4 });
      }
    }
  }

  desenhar(m: Mundo): void {
    this.desenharCalor();
    if (!this.mapaAtual || ref.mapa !== this.mapaAtual) {
      if (ref.mapa) this.montarMapa(ref.mapa);
      else return;
    }
    const mapa = this.mapaAtual!;
    const g = this.entidades;
    const lz = this.brilho;
    g.clear();
    lz.clear();
    const ui = useUI.getState();
    const tempo = performance.now() / 1000;
    const agora = performance.now();
    this.dtQuadro = Math.min(0.1, (agora - this.tQuadro) / 1000);
    this.tQuadro = agora;
    const tema = TEMAS[mapa.tema];

    this.aplicarNivel();

    // tremor de tela
    const tr = fx.tremor;
    this.mundo.position.set(tr > 0 ? (Math.random() - 0.5) * tr : 0, tr > 0 ? (Math.random() - 0.5) * tr : 0);

    // luz dos obstáculos (lava pulsa, cristais reluzem)
    for (const o of mapa.obstaculos) {
      if (o.tipo === 'lava') this.luz(o.x, o.y, o.r * 2.1, 0xff5a10, 0.55 + 0.2 * Math.sin(tempo * 2 + o.x));
      else if (o.tipo === 'cristal') this.luz(o.x, o.y - o.r * 0.4, o.r * 1.6, 0x7fe3ff, 0.3 + 0.12 * Math.sin(tempo * 1.7 + o.y));
    }

    // alvo final: brilho no fim da trilha
    const fim = mapa.waypoints[mapa.waypoints.length - 1];
    const fx0 = Math.min(Math.max(fim.x, 8), mapa.largura - 8);
    const fy0 = Math.min(Math.max(fim.y, 8), mapa.altura - 8);
    const corB = corBastiao(COR.dano, useUI.getState().skin);
    this.luz(fx0, fy0, 40 + 6 * Math.sin(tempo * 3), corB, 0.4);
    this.bastiao(g, fx0, fy0, corB, tempo);

    // torres
    for (const t of [...m.torres].sort((a, b) => a.pos.y - b.pos.y)) this.torre(t, m, tempo);

    // alcance da torre selecionada
    const sel = m.torres.find((t) => t.id === ui.selecionadaId);
    if (sel) {
      const al = statsTorre(sel).alcance;
      g.circle(sel.pos.x, sel.pos.y, al).fill({ color: COR.ui, alpha: 0.06 });
      this.tracejado(g, sel.pos.x, sel.pos.y, al, COR.ui, 0.75, tempo * 0.6);
      g.poly(poligono(sel.pos.x, sel.pos.y, 22, 4, Math.PI / 4)).stroke({ width: 1.5, color: COR.ui, alpha: 0.5 + 0.3 * Math.sin(tempo * 6) });
    }

    // prévia de construção / habilidade
    if (entrada.mouse && ref.mapa) {
      const mp = entrada.mouse;
      if (ui.construirId) {
        const def = TORRES[ui.construirId];
        const ok = posicaoValida(m, ref.mapa, mp) && ui.ouro >= custoTorre(m, def.id);
        const cor = ok ? corTorre(def.id, def.cor, useUI.getState().skin) : COR.dano;
        const s = 1 + 0.05 * Math.sin(tempo * 8);
        g.circle(mp.x, mp.y, def.alcance).fill({ color: cor, alpha: 0.1 });
        this.tracejado(g, mp.x, mp.y, def.alcance, cor, 0.6, tempo * 0.5);
        g.poly(poligono(mp.x, mp.y, 16 * s, 8, Math.PI / 8)).fill({ color: cor, alpha: 0.55 });
        g.poly(poligono(mp.x, mp.y, 16 * s, 8, Math.PI / 8)).stroke({ width: 2, color: cor });
        if (!ok) {
          g.moveTo(mp.x - 8, mp.y - 8).lineTo(mp.x + 8, mp.y + 8).moveTo(mp.x + 8, mp.y - 8).lineTo(mp.x - 8, mp.y + 8).stroke({ width: 3, color: 0xffffff });
        }
      } else if (ui.habilidade === 'meteoro') {
        const r = HAB.meteoro.raio;
        g.circle(mp.x, mp.y, r).fill({ color: 0xff4a10, alpha: 0.14 });
        this.tracejado(g, mp.x, mp.y, r, 0xff7a30, 0.9, tempo * 1.4);
        g.moveTo(mp.x - 14, mp.y).lineTo(mp.x + 14, mp.y).moveTo(mp.x, mp.y - 14).lineTo(mp.x, mp.y + 14).stroke({ width: 2, color: 0xffe0a0 });
        this.luz(mp.x, mp.y, r * 0.9, 0xff5a10, 0.4);
      }
    }

    // inimigos: terrestres por profundidade, voadores por cima
    const vivos = m.inimigos.filter((e) => e.vivo || e.vida > 0);
    const terrestres = vivos.filter((e) => !INIMIGOS[e.defId].voador).sort((a, b) => a.pos.y - b.pos.y);
    const voadores = vivos.filter((e) => INIMIGOS[e.defId].voador).sort((a, b) => a.pos.y - b.pos.y);
    for (const e of terrestres) this.inimigo(e, m, tempo);
    for (const e of voadores) this.inimigo(e, m, tempo);
    if (this.dirInimigo.size > 400) {
      const ids = new Set(m.inimigos.map((e) => e.id));
      for (const k of this.dirInimigo.keys()) if (!ids.has(k)) this.dirInimigo.delete(k);
      for (const k of this.suaves.keys()) if (!ids.has(k)) this.suaves.delete(k);
    }

    // projéteis com rastro e halo
    for (const p of m.projeteis) {
      const dx = p.alvoPos.x - p.pos.x;
      const dy = p.alvoPos.y - p.pos.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const gelo = p.efeito.lentFator < 1;
      const area = p.efeito.area > 0;
      const cor = gelo ? 0xcaf0f8 : area ? 0xf8961e : corProjetil(COR.ouro, useUI.getState().skin);
      for (let i = 3; i >= 1; i--) {
        g.moveTo(p.pos.x, p.pos.y).lineTo(p.pos.x - ux * i * 7, p.pos.y - uy * i * 7).stroke({ width: 4 - i * 0.9, color: cor, alpha: 0.18 + (4 - i) * 0.1 });
      }
      if (area) {
        g.circle(p.pos.x, p.pos.y, 5.5).fill(0x2a2a30);
        g.circle(p.pos.x - 1.2, p.pos.y - 1.2, 2).fill({ color: 0xffffff, alpha: 0.5 });
      } else {
        const forma = formaProjetil(useUI.getState().skin);
        if (forma === 'losango') {
          g.poly([p.pos.x, p.pos.y - 5, p.pos.x + 3.5, p.pos.y, p.pos.x, p.pos.y + 5, p.pos.x - 3.5, p.pos.y]).fill(cor);
        } else if (forma === 'estrela') {
          g.poly(poligono(p.pos.x, p.pos.y, 5.5, 5, -Math.PI / 2)).fill(cor);
        } else {
          g.circle(p.pos.x, p.pos.y, 3.6).fill(cor);
        }
      }
      g.circle(p.pos.x, p.pos.y, 1.6).fill(0xffffff);
      this.luz(p.pos.x, p.pos.y, area ? 16 : 12, cor, 0.8);
    }

    // explosões e arcos
    for (const f of m.efeitos) {
      const k = Math.max(0, f.ttl / f.ttlMax);
      if (f.tipo === 'explosao') {
        const rr = f.raio * (1.1 - k * 0.3);
        g.circle(f.pontos[0].x, f.pontos[0].y, rr).fill({ color: f.cor, alpha: 0.3 * k });
        g.circle(f.pontos[0].x, f.pontos[0].y, rr * 0.55).fill({ color: 0xffffff, alpha: 0.35 * k });
        g.circle(f.pontos[0].x, f.pontos[0].y, rr).stroke({ width: 2, color: f.cor, alpha: 0.7 * k });
        this.luz(f.pontos[0].x, f.pontos[0].y, rr * 1.2, f.cor, 0.9 * k);
      } else {
        const pts: number[] = [f.pontos[0].x, f.pontos[0].y];
        for (let i = 1; i < f.pontos.length; i++) {
          const a = f.pontos[i - 1];
          const b = f.pontos[i];
          pts.push((a.x + b.x) / 2 + (Math.random() - 0.5) * 9, (a.y + b.y) / 2 + (Math.random() - 0.5) * 9, b.x, b.y);
        }
        for (const [w, cor, al, alvo] of [[5, f.cor, 0.35 * k, lz], [2.4, f.cor, k, g], [1, 0xffffff, k, g]] as const) {
          alvo.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) alvo.lineTo(pts[i], pts[i + 1]);
          alvo.stroke({ width: w, color: cor, alpha: al });
        }
      }
    }

    // partículas
    const pg = this.particulas;
    pg.clear();
    let n = 0;
    for (const p of fx.particulas) {
      const k = Math.max(0, p.ttl / p.ttlMax);
      if (p.forma === 'anel') {
        pg.circle(p.x, p.y, p.tam * (1 + p.fim * (1 - k))).stroke({ width: 2.5, color: p.cor, alpha: k });
      } else if (p.forma === 'circ') {
        pg.circle(p.x, p.y, p.tam * k).fill({ color: p.cor, alpha: k });
      } else {
        const s = p.tam * (0.4 + 0.6 * k);
        pg.rect(p.x - s / 2, p.y - s / 2, s, s).fill({ color: p.cor, alpha: Math.min(1, k * 1.5) });
      }
      if ((n++ & 1) === 0 && p.forma !== 'anel') lz.circle(p.x, p.y, p.tam * 2.2 * (0.4 + k)).fill({ color: p.cor, alpha: 0.25 * k });
    }

    // atmosfera do tema (vagalumes, brasas, neve)
    for (const o of this.ambiente) {
      let x: number;
      let y: number;
      if (tema.ambiente === 'vagalume') {
        x = o.x + Math.sin(tempo * 0.5 + o.f) * 34;
        y = o.y + Math.cos(tempo * 0.7 + o.f * 1.3) * 22;
        const b = 0.25 + 0.75 * Math.abs(Math.sin(tempo * 1.4 + o.f));
        lz.circle(x, y, 7).fill({ color: tema.luz, alpha: 0.35 * b });
        pg.circle(x, y, 1.4).fill({ color: 0xf4ffc8, alpha: b });
      } else if (tema.ambiente === 'brasa') {
        y = ((o.y - tempo * (18 + o.v * 34)) % mapa.altura + mapa.altura) % mapa.altura;
        x = o.x + Math.sin(tempo * 1.2 + o.f) * 16;
        const b = 0.4 + 0.6 * Math.abs(Math.sin(tempo * 3 + o.f));
        lz.circle(x, y, 6).fill({ color: tema.luz, alpha: 0.4 * b });
        pg.circle(x, y, 1.1 + o.v * 1.2).fill({ color: 0xffb060, alpha: b });
      } else {
        y = (o.y + tempo * (22 + o.v * 36)) % mapa.altura;
        x = o.x + Math.sin(tempo * 0.8 + o.f) * 20;
        pg.circle(x, y, 1.2 + o.v * 1.8).fill({ color: 0xffffff, alpha: 0.85 });
      }
    }

    // textos flutuantes (pool)
    let i = 0;
    for (const f of fx.flutuantes) {
      const t = this.textoDoPool(i++);
      const k = f.ttl / f.ttlMax;
      t.visible = true;
      if (t.text !== f.texto) t.text = f.texto;
      if (this.coresTexto.get(t) !== f.cor) {
        t.style.fill = f.cor;
        this.coresTexto.set(t, f.cor);
      }
      t.position.set(f.x, f.y);
      t.alpha = Math.min(1, k * 2);
      t.scale.set(1 + (1 - k) * 0.15);
    }
    for (; i < this.textos.length; i++) this.textos[i].visible = false;

    this.qualidadeAdaptativa();
  }

  /** Se o aparelho não sustenta ~40 fps, desliga bloom e gradação (o jogo continua bonito, só mais leve). */
  private qualidadeAdaptativa(): void {
    const agora = performance.now();
    const d = Math.min(agora - this.ultimo, 100);
    this.ultimo = agora;
    this.ema = this.ema * 0.95 + d * 0.05;
    this.quadros++;
    if (!this.baixa && this.quadros > 240 && this.ema > 27) {
      this.baixa = true;
      this.brilho.filters = [];
      this.brilho.alpha = 0.7;
      this.mundo.filters = [];
    }
  }
}

