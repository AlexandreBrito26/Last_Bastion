/** Loop com timestep fixo: lógica a 60 Hz, render livre. */
export const PASSO = 1 / 60;

export class LoopFixo {
  private acc = 0;
  private ultimo = 0;
  private raf = 0;
  velocidade = 1;
  pausado = false;

  constructor(
    private atualizar: (dt: number) => void,
    private desenhar: () => void,
  ) {}

  iniciar(): void {
    this.ultimo = performance.now();
    const quadro = (agora: number) => {
      const delta = Math.min((agora - this.ultimo) / 1000, 0.25);
      this.ultimo = agora;
      if (!this.pausado) {
        this.acc += delta * this.velocidade;
        while (this.acc >= PASSO) {
          this.atualizar(PASSO);
          this.acc -= PASSO;
        }
      }
      this.desenhar();
      this.raf = requestAnimationFrame(quadro);
    };
    this.raf = requestAnimationFrame(quadro);
  }

  parar(): void {
    cancelAnimationFrame(this.raf);
  }
}
