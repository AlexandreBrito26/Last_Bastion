import { formaEscolhida, corDoItem } from '../game/data/skins';

/**
 * Preview animado de um item em Canvas 2D: a torre, o inimigo, o projétil ou o bastião
 * desenhados na cor do tema escolhido. Só desenho; não mexe no estado do jogo.
 */
export interface PreviaInfo {
  /** chave do item (ex.: 'torre:arqueiro', 'inimigo:voador', 'projetil', 'bastiao') */
  chave: string;
  /** tema (id em SKINS) cuja cor é aplicada */
  tema: string;
  /** cor base do item, usada quando o tema não tem cor para ele */
  corBase: number;
  /** cor de apoio para o brilho */
  escolhas: Record<string, string>;
}

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

/** Desenha um quadro do preview. `t` é o tempo em segundos. */
export function desenharPreviaItem(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: PreviaInfo): void {
  ctx.clearRect(0, 0, w, h);
  // fundo: gradiente escuro com um halo na cor do item
  const cor = corDoItem(p.chave, p.tema, p.corBase);
  const fundo = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, Math.max(w, h) / 1.6);
  fundo.addColorStop(0, '#2a1f4d');
  fundo.addColorStop(1, '#0c0a1d');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  const halo = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, 60);
  halo.addColorStop(0, hex(cor) + '66');
  halo.addColorStop(1, hex(cor) + '00');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2 + 6;
  ctx.save();
  ctx.translate(cx, cy);

  if (p.chave.startsWith('torre:')) desenharTorre(ctx, p.chave.slice(6), cor, t);
  else if (p.chave.startsWith('inimigo:')) desenharInimigo(ctx, p.chave.slice(8), cor, t);
  else if (p.chave === 'projetil') desenharProjetil(ctx, cor, t, formaEscolhida({ ...p.escolhas, projetil: p.tema }), w);
  else desenharBastiao(ctx, cor, t);

  ctx.restore();
}

function contornoEsc(ctx: CanvasRenderingContext2D) {
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
}

function desenharTorre(ctx: CanvasRenderingContext2D, id: string, cor: number, t: number) {
  // base de pedra octogonal
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    const x = Math.cos(a) * 30;
    const y = Math.sin(a) * 30 * 0.55 + 16;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#41555f';
  ctx.fill();
  contornoEsc(ctx);
  ctx.stroke();

  const pulso = 0.5 + 0.5 * Math.sin(t * 3);
  const ang = Math.sin(t * 1.4) * 0.5 - Math.PI / 2 + 0.6;
  // corpo colorido
  ctx.beginPath();
  ctx.arc(0, -4, 14, 0, Math.PI * 2);
  ctx.fillStyle = hex(cor);
  ctx.fill();
  contornoEsc(ctx);
  ctx.stroke();
  // brilho
  ctx.beginPath();
  ctx.arc(-4, -9, 4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.2 * pulso})`;
  ctx.fill();

  // canhão/arco que gira, com cara de cada tipo
  ctx.save();
  ctx.translate(0, -4);
  ctx.rotate(ang);
  if (id === 'arqueiro') {
    ctx.strokeStyle = '#e8d4a0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(4, 0, 14, -Math.PI / 2.4, Math.PI / 2.4);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1d2a3a';
    ctx.fillRect(4, -3, 18, 6);
    ctx.fillStyle = hex(cor);
    ctx.fillRect(18, -5, 4, 10);
  }
  ctx.restore();

  // marcas de nível
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-8 + i * 8, 24, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = i < 2 ? '#ffd166' : '#222';
    ctx.fill();
  }
}

function desenharInimigo(ctx: CanvasRenderingContext2D, id: string, cor: number, t: number) {
  const voador = id === 'voador' || id === 'espectro' || id === 'corvo' || id === 'ceifador';
  const bob = voador ? Math.sin(t * 6) * 4 : Math.sin(t * 8) * 1.5;
  const r = id === 'tanque' || id === 'ogro' ? 22 : 16;
  if (voador) {
    const asa = Math.abs(Math.sin(t * 14));
    ctx.fillStyle = hex(cor) + 'cc';
    ctx.beginPath();
    ctx.moveTo(-6, bob);
    ctx.lineTo(-r * 1.6, bob - 6 - asa * 10);
    ctx.lineTo(-r * 0.9, bob + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, bob);
    ctx.lineTo(r * 1.6, bob - 6 - asa * 10);
    ctx.lineTo(r * 0.9, bob + 4);
    ctx.closePath();
    ctx.fill();
  } else {
    // sombra no chão
    ctx.beginPath();
    ctx.ellipse(0, 22, r * 0.9, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
  }
  // corpo
  ctx.beginPath();
  ctx.arc(0, bob, r, 0, Math.PI * 2);
  ctx.fillStyle = hex(cor);
  ctx.fill();
  contornoEsc(ctx);
  ctx.stroke();
  // brilho
  ctx.beginPath();
  ctx.arc(-r * 0.35, bob - r * 0.35, r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  // olhos que piscam
  const piscando = Math.sin(t * 2.3) > 0.97;
  ctx.fillStyle = '#fff';
  for (const ox of [-r * 0.35, r * 0.35]) {
    ctx.beginPath();
    ctx.ellipse(ox, bob - 1, r * 0.2, piscando ? 0.6 : r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!piscando) {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(ox + Math.cos(t) * 1.5, bob - 1, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
    }
  }
}

function desenharProjetil(ctx: CanvasRenderingContext2D, cor: number, t: number, forma: 'bola' | 'losango' | 'estrela', w: number) {
  // trilha e projétil andando da esquerda para a direita, em loop
  const span = w * 0.7;
  const x = ((t * 60) % span) - span / 2;
  for (let i = 1; i <= 6; i++) {
    ctx.globalAlpha = 0.5 * (1 - i / 7);
    ctx.fillStyle = hex(cor);
    ctx.beginPath();
    ctx.arc(x - i * 7, 0, 4 - i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = hex(cor);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (forma === 'losango') {
    ctx.moveTo(x, -8);
    ctx.lineTo(x + 6, 0);
    ctx.lineTo(x, 8);
    ctx.lineTo(x - 6, 0);
  } else if (forma === 'estrela') {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const px = x + Math.cos(a) * 8;
      const py = Math.sin(a) * 8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.arc(x, 0, 6, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
}

function desenharBastiao(ctx: CanvasRenderingContext2D, cor: number, t: number) {
  // torre de pedra com merlões e bandeira na cor do tema
  ctx.fillStyle = '#3a3350';
  ctx.fillRect(-16, -10, 32, 40);
  contornoEsc(ctx);
  ctx.strokeRect(-16, -10, 32, 40);
  for (let i = -16; i < 16; i += 8) {
    ctx.fillStyle = '#3a3350';
    ctx.fillRect(i, -16, 5, 7);
  }
  ctx.fillStyle = '#1b1530';
  ctx.fillRect(-4, 6, 8, 14);
  // mastro e bandeira ondulando
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, -40);
  ctx.stroke();
  ctx.fillStyle = hex(cor);
  ctx.beginPath();
  ctx.moveTo(0, -40);
  for (let i = 0; i <= 12; i++) {
    const x = i * 1.5;
    const y = -40 + Math.sin(t * 5 + i * 0.6) * 1.6 * (i / 12);
    ctx.lineTo(x, y);
  }
  for (let i = 12; i >= 0; i--) {
    const x = i * 1.5;
    const y = -40 + 9 + Math.sin(t * 5 + i * 0.6) * 1.6 * (i / 12);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
