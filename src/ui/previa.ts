import type { Skin } from '../game/data/skins';

/** Desenha uma prévia da skin num canvas: torres, um inimigo e o bastião, na mesma paleta do jogo. */
export function desenharPrevia(canvas: HTMLCanvasElement, skin: Skin): void {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 260;
  const h = canvas.clientHeight || 64;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
  const torres = ['arqueiro', 'canhao', 'gelo', 'tesla', 'alquimista', 'totem', 'morteiro', 'ballista', 'cristal', 'lanca', 'runica', 'arcabuz', 'foguete'];
  const cor = (id: string, padrao: number) => hex(skin.cores[id] ?? padrao);

  // torres (quadrados com borda escura)
  const padroes: Record<string, number> = { arqueiro: 0x4cc9f0, canhao: 0x4361ee, gelo: 0xcaf0f8, tesla: 0x9d4edd, alquimista: 0x7cff6b, totem: 0xffd166, morteiro: 0xf8961e, ballista: 0x8d6e63, cristal: 0xb388ff, lanca: 0xffb703, runica: 0x80ed99, arcabuz: 0x6c757d, foguete: 0xe76f51 };
  torres.forEach((id, i) => {
    const x = 18 + i * 26;
    const y = 30;
    ctx.fillStyle = cor(id, padroes[id]);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 9, y - 9, 18, 18, 4);
    ctx.fill();
    ctx.stroke();
  });

  // projétil: mesma forma que o jogo usa (bola, losango ou estrela)
  const px = w - 74;
  const py = 22;
  ctx.fillStyle = hex(skin.projetil ?? 0xffd166);
  ctx.beginPath();
  if (skin.projetilForma === 'losango') {
    ctx.moveTo(px, py - 5);
    ctx.lineTo(px + 3.5, py);
    ctx.lineTo(px, py + 5);
    ctx.lineTo(px - 3.5, py);
  } else if (skin.projetilForma === 'estrela') {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const x = px + Math.cos(a) * 5.5;
      const y = py + Math.sin(a) * 5.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  }
  ctx.fill();

  // inimigo básico
  ctx.fillStyle = hex(skin.inimigos?.basico ?? 0xf72585);
  ctx.beginPath();
  ctx.arc(w - 50, 40, 9, 0, Math.PI * 2);
  ctx.fill();

  // bastião: torre de pedra com bandeira
  const bx = w - 22;
  const by = 36;
  ctx.fillStyle = '#3a3350';
  ctx.fillRect(bx - 7, by - 6, 14, 16);
  ctx.strokeStyle = hex(skin.bastiao ?? 0xff477e);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, by - 6);
  ctx.lineTo(bx, by - 22);
  ctx.lineTo(bx + 9, by - 19);
  ctx.lineTo(bx, by - 16);
  ctx.stroke();
  ctx.fillStyle = hex(skin.bastiao ?? 0xff477e);
  ctx.fill();
}
