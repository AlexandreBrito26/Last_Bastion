import { Application, Container, Graphics, Text } from 'pixi.js';
import { COR } from '../core/cores';
import { INIMIGOS } from '../game/data/inimigos';
import { statsTorre, TORRES } from '../game/data/torres';
import { custoTorre, posicaoValida } from '../game/construcao';
import { fx } from '../game/feedback';
import { entrada, ref } from '../game/ref';
import { useUI } from '../store/ui';
import type { Mapa } from '../game/data/mapas';
import type { Mundo } from '../game/estado';

/** Entrada com leve "salto" para a animação de construção. */
const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export class Renderizador {
  app = new Application();
  private chao = new Container();
  private entidades = new Graphics();
  private particulas = new Graphics();
  private camadaTexto = new Container();
  private textos: Text[] = [];
  private coresTexto = new WeakMap<Text, number>();

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
    this.app.stage.addChild(this.chao, this.entidades, this.particulas, this.camadaTexto);
    this.desenharChao(mapa);
  }

  private desenharChao(mapa: Mapa): void {
    const g = new Graphics();
    const pts = mapa.waypoints;
    const tracar = () => {
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    };
    tracar();
    g.stroke({ width: mapa.larguraTrilha + 8, color: COR.trilhaBorda, join: 'round', cap: 'round' });
    tracar();
    g.stroke({ width: mapa.larguraTrilha, color: COR.trilha, join: 'round', cap: 'round' });
    this.chao.addChild(g);
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

  desenhar(m: Mundo): void {
    const g = this.entidades;
    g.clear();
    const ui = useUI.getState();

    // tremor de tela
    const tr = fx.tremor;
    this.app.stage.position.set(tr > 0 ? (Math.random() - 0.5) * tr : 0, tr > 0 ? (Math.random() - 0.5) * tr : 0);

    // torres
    for (const t of m.torres) {
      const def = TORRES[t.defId];
      const k = Math.min(1, t.idade / 0.28);
      const esc = k < 1 ? Math.max(0.05, easeOutBack(k)) : 1;
      const h = 14 * esc;
      g.rect(t.pos.x - h, t.pos.y - h, h * 2, h * 2).fill(def.cor);
      const h2 = 8 * esc;
      g.rect(t.pos.x - h2, t.pos.y - h2, h2 * 2, h2 * 2).fill(t.caminho === 'B' ? COR.inimigoElite : COR.torreArcana);
      if (k >= 1) for (let i = 0; i < t.nivel; i++) g.rect(t.pos.x - 12 + i * 8, t.pos.y + 16, 6, 3).fill(COR.ouro);
      if (t.flash > 0) g.rect(t.pos.x - 16, t.pos.y - 16, 32, 32).stroke({ width: 2, color: 0xffffff, alpha: t.flash / 0.09 });
      if (t.melhoria > 0) {
        const u = 1 - t.melhoria / 0.5;
        g.circle(t.pos.x, t.pos.y, 18 + u * 26).stroke({ width: 3, color: COR.ouro, alpha: 1 - u });
      }
    }
    const sel = m.torres.find((t) => t.id === ui.selecionadaId);
    if (sel) {
      const pulso = 0.5 + 0.2 * Math.sin(m.tempo * 6);
      g.circle(sel.pos.x, sel.pos.y, statsTorre(sel).alcance)
        .fill({ color: COR.ui, alpha: 0.05 })
        .stroke({ width: 1, color: COR.ui, alpha: pulso });
      g.rect(sel.pos.x - 17, sel.pos.y - 17, 34, 34).stroke({ width: 2, color: COR.ui });
    }
    if (ui.construirId && entrada.mouse && ref.mapa) {
      const def = TORRES[ui.construirId];
      const ok = posicaoValida(m, ref.mapa, entrada.mouse) && ui.ouro >= custoTorre(m, def.id);
      const cor = ok ? def.cor : COR.dano;
      const s = 1 + 0.05 * Math.sin(performance.now() / 120);
      g.circle(entrada.mouse.x, entrada.mouse.y, def.alcance).fill({ color: cor, alpha: 0.1 }).stroke({ width: 1, color: cor, alpha: 0.35 });
      g.rect(entrada.mouse.x - 14 * s, entrada.mouse.y - 14 * s, 28 * s, 28 * s).fill({ color: cor, alpha: 0.65 });
    }

    // inimigos
    for (const e of m.inimigos) {
      const def = INIMIGOS[e.defId];
      const bob = def.voador ? Math.sin(m.tempo * 7 + e.id) * 2.5 : 0;
      const ex = e.pos.x;
      const ey = e.pos.y + bob;
      // sombra no chão
      g.ellipse(ex, e.pos.y + (def.voador ? def.raio + 12 : def.raio * 0.75), def.raio * (def.voador ? 0.7 : 1), def.raio * 0.38).fill({ color: 0x000000, alpha: def.voador ? 0.18 : 0.28 });
      if (def.voador) {
        const r = def.raio + 2;
        g.poly([ex, ey - r, ex + r, ey, ex, ey + r, ex - r, ey]).fill(def.cor);
        const bat = Math.sin(m.tempo * 24 + e.id) * 3;
        g.poly([ex - r, ey, ex - r - 6, ey - 4 + bat, ex - r, ey + 2]).fill({ color: def.cor, alpha: 0.7 });
        g.poly([ex + r, ey, ex + r + 6, ey - 4 + bat, ex + r, ey + 2]).fill({ color: def.cor, alpha: 0.7 });
      } else {
        g.circle(ex, ey, def.raio).fill(def.cor);
      }
      if (e.flash > 0) g.circle(ex, ey, def.raio + 1).fill({ color: 0xffffff, alpha: 0.65 * (e.flash / 0.1) });
      if (def.cura) {
        g.rect(ex - 1.5, ey - 5, 3, 10).fill(COR.ui);
        g.rect(ex - 5, ey - 1.5, 10, 3).fill(COR.ui);
        const onda = (m.tempo % def.cura.intervalo) / def.cura.intervalo;
        g.circle(ex, ey, def.cura.raio * onda).stroke({ width: 1, color: COR.vida, alpha: 0.25 * (1 - onda) });
      }
      if (def.armadura > 0) g.circle(ex, ey, def.raio).stroke({ width: 2, color: 0xadb5bd });
      if (def.chefe) g.circle(ex, ey, def.raio + 4 + Math.sin(m.tempo * 5) * 2).stroke({ width: 3, color: COR.inimigoElite });
      if (e.lentTempo > 0) g.circle(ex, ey, def.raio + 3).stroke({ width: 2, color: 0xcaf0f8 });
      if (e.queimaTempo > 0) {
        g.circle(ex + Math.sin(m.tempo * 20) * 3, ey - def.raio, 3).fill(0xf8961e);
        g.circle(ex - Math.sin(m.tempo * 17) * 3, ey - def.raio - 3, 2).fill(0xffd60a);
      }
      if (e.atordTempo > 0) {
        for (let i = 0; i < 3; i++) {
          const a = m.tempo * 8 + (i * Math.PI * 2) / 3;
          g.circle(ex + Math.cos(a) * 8, ey - def.raio - 10 + Math.sin(a) * 2, 2).fill(COR.ouro);
        }
      }
      if (e.vida < e.vidaMax || def.chefe) {
        const w = def.chefe ? 56 : 24;
        const y = ey - def.raio - 8;
        g.rect(ex - w / 2, y, w, 4).fill(0x000000);
        g.rect(ex - w / 2, y, w * Math.max(0, e.vida / e.vidaMax), 4).fill(COR.vida);
      }
    }

    // projéteis com rastro
    for (const p of m.projeteis) {
      const dx = p.alvoPos.x - p.pos.x;
      const dy = p.alvoPos.y - p.pos.y;
      const d = Math.hypot(dx, dy) || 1;
      const cor = p.efeito.lentFator < 1 ? 0xcaf0f8 : p.efeito.area > 0 ? 0xf8961e : COR.ouro;
      g.moveTo(p.pos.x, p.pos.y).lineTo(p.pos.x - (dx / d) * 14, p.pos.y - (dy / d) * 14).stroke({ width: 3, color: cor, alpha: 0.45 });
      g.circle(p.pos.x, p.pos.y, p.efeito.area > 0 ? 5 : 4).fill(cor);
    }

    // efeitos de área e arcos
    for (const f of m.efeitos) {
      const k = Math.max(0, f.ttl / f.ttlMax);
      if (f.tipo === 'explosao') {
        g.circle(f.pontos[0].x, f.pontos[0].y, f.raio * (1.1 - k * 0.3)).fill({ color: f.cor, alpha: 0.35 * k });
      } else {
        g.moveTo(f.pontos[0].x, f.pontos[0].y);
        for (let i = 1; i < f.pontos.length; i++) {
          const a = f.pontos[i - 1];
          const b = f.pontos[i];
          g.lineTo((a.x + b.x) / 2 + (Math.random() - 0.5) * 8, (a.y + b.y) / 2 + (Math.random() - 0.5) * 8).lineTo(b.x, b.y);
        }
        g.stroke({ width: 3, color: f.cor, alpha: k });
      }
    }

    // partículas
    const pg = this.particulas;
    pg.clear();
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
  }
}
