import type { Graphics } from 'pixi.js';

/**
 * Primitivas de desenho compartilhadas pelos sprites (torres e inimigos).
 * Centralizar aqui faz contorno e brilho de borda terem o mesmo acabamento
 * em todo o jogo; quem desenha só escolhe forma, cor e posição.
 */

/** Contorno escuro fino, para o corpo se separar do fundo. */
export function contorno(g: Graphics, x: number, y: number, rx: number, ry: number, alfa = 0.55): void {
  g.ellipse(x, y, rx, ry).stroke({ width: 1.2, color: 0x14080c, alpha: alfa });
}

/** Arco de luz no quadrante superior-direito: dá volume sem gradiente. */
export function brilhoBorda(g: Graphics, x: number, y: number, r: number, cor: number, alfa: number): void {
  g.arc(x, y, r * 0.9, -Math.PI * 0.95, -Math.PI * 0.4).stroke({ width: Math.max(1, r * 0.12), color: cor, alpha: alfa });
}

/** Corpo elíptico que respira: `esticar` > 0 alonga na vertical e encurta na horizontal. */
export function corpoRespirando(g: Graphics, x: number, y: number, r: number, esticar: number, cor: number): void {
  const rx = r * (1 - 0.05 * esticar);
  const ry = r * (1 + 0.07 * esticar);
  g.ellipse(x, y, rx, ry).fill(cor);
  contorno(g, x, y, rx, ry);
}
