/** Áudio 100% sintetizado (WebAudio): sem arquivos, sem carregamento. */
type Onda = OscillatorType;

interface OpcoesTom {
  tipo?: Onda;
  vol?: number;
  para?: number; // frequência final (glissando)
  atraso?: number;
  ataque?: number;
  destino?: 'sfx' | 'musica';
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

class Audio {
  private ctx: AudioContext | null = null;
  private mestre!: GainNode;
  private sfx!: GainNode;
  private musica!: GainNode;
  private ruidoBuf!: AudioBuffer;
  private ultimo = new Map<string, number>();
  private timer = 0;
  private proxNota = 0;
  private passo = 0;
  /** 0 = calmo (menu / entre ondas), 1 = intenso (onda em andamento). */
  intensidade = 0.25;
  private volSfx = 0.7;
  private volMusica = 0.35;
  private mudo = false;

  get pronto(): boolean {
    return this.ctx !== null;
  }

  /** Navegadores só liberam áudio após um gesto do usuário. */
  destravar(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return;
    const ctx = new C();
    this.ctx = ctx;
    this.mestre = ctx.createGain();
    this.sfx = ctx.createGain();
    this.musica = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    this.sfx.connect(this.mestre);
    this.musica.connect(this.mestre);
    this.mestre.connect(comp).connect(ctx.destination);
    this.ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.ruidoBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.aplicar(this.volSfx, this.volMusica, this.mudo);
    this.iniciarMusica();
  }

  aplicar(sfx: number, musica: number, mudo: boolean): void {
    this.volSfx = sfx;
    this.volMusica = musica;
    this.mudo = mudo;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.mestre.gain.setTargetAtTime(mudo ? 0 : 1, t, 0.03);
    this.sfx.gain.setTargetAtTime(sfx, t, 0.03);
    this.musica.gain.setTargetAtTime(musica * 0.6, t, 0.1);
  }

  // ---------- síntese ----------

  private tom(freq: number, dur: number, o: OpcoesTom = {}): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + (o.atraso ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.tipo ?? 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.para) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.para), t0 + dur);
    const vol = o.vol ?? 0.2;
    const ataque = o.ataque ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(o.destino === 'musica' ? this.musica : this.sfx);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private ruido(dur: number, filtro: BiquadFilterType, freq: number, vol = 0.2, para?: number, atraso = 0, destino: 'sfx' | 'musica' = 'sfx'): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + atraso;
    const src = ctx.createBufferSource();
    src.buffer = this.ruidoBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filtro;
    f.frequency.setValueAtTime(freq, t0);
    if (para) f.frequency.exponentialRampToValueAtTime(Math.max(20, para), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(destino === 'musica' ? this.musica : this.sfx);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  }

  /** Evita empilhar o mesmo som (ex.: 10 torres atirando no mesmo quadro). */
  private livre(nome: string, intervaloMs: number): boolean {
    const agora = performance.now();
    if (agora - (this.ultimo.get(nome) ?? -1e9) < intervaloMs) return false;
    this.ultimo.set(nome, agora);
    return true;
  }

  // ---------- efeitos ----------

  tocar(nome: string, variacao = 0): void {
    if (!this.ctx || this.mudo) return;
    const v = 1 + variacao;
    switch (nome) {
      case 'tiro_arqueiro':
        if (!this.livre(nome, 45)) return;
        this.ruido(0.07, 'highpass', 2500, 0.07);
        this.tom(640 * v, 0.09, { tipo: 'triangle', para: 280, vol: 0.09 });
        break;
      case 'tiro_canhao':
        if (!this.livre(nome, 90)) return;
        this.tom(150, 0.22, { para: 45, vol: 0.32 });
        this.ruido(0.18, 'lowpass', 900, 0.18, 150);
        break;
      case 'tiro_gelo':
        if (!this.livre(nome, 60)) return;
        this.tom(950 * v, 0.14, { para: 1500, vol: 0.07, ataque: 0.02 });
        this.tom(1900 * v, 0.1, { vol: 0.03, ataque: 0.02 });
        break;
      case 'tiro_tesla':
        if (!this.livre(nome, 70)) return;
        this.tom(180, 0.14, { tipo: 'sawtooth', para: 900 * v, vol: 0.07 });
        this.ruido(0.12, 'bandpass', 2200, 0.1);
        break;
      case 'acerto':
        if (!this.livre(nome, 35)) return;
        this.tom(260 * v, 0.045, { tipo: 'square', vol: 0.04 });
        break;
      case 'explosao':
        if (!this.livre(nome, 70)) return;
        this.ruido(0.38, 'lowpass', 1400, 0.3, 90);
        this.tom(95, 0.3, { para: 38, vol: 0.3 });
        break;
      case 'morte':
        if (!this.livre(nome, 40)) return;
        this.tom(420 * v, 0.13, { para: 140, vol: 0.12, tipo: 'triangle' });
        this.ruido(0.06, 'highpass', 3000, 0.05);
        break;
      case 'morte_chefe':
        this.ruido(1.1, 'lowpass', 2200, 0.5, 60);
        this.tom(110, 0.9, { para: 28, vol: 0.5, tipo: 'sawtooth' });
        this.tom(55, 1.0, { para: 25, vol: 0.4 });
        break;
      case 'vazou':
        this.tom(230, 0.45, { tipo: 'sawtooth', para: 90, vol: 0.2 });
        this.tom(244, 0.45, { tipo: 'sawtooth', para: 95, vol: 0.15 });
        this.ruido(0.25, 'lowpass', 700, 0.2, 120);
        break;
      case 'construir':
        this.tom(210, 0.1, { tipo: 'square', para: 120, vol: 0.12 });
        this.tom(420, 0.09, { tipo: 'square', vol: 0.07, atraso: 0.07 });
        this.ruido(0.08, 'bandpass', 1200, 0.12);
        break;
      case 'melhorar':
        [0, 4, 7, 12].forEach((s, i) => this.tom(midi(64 + s), 0.18, { tipo: 'triangle', vol: 0.13, atraso: i * 0.07 }));
        break;
      case 'vender':
        this.tom(1175, 0.08, { tipo: 'square', vol: 0.07 });
        this.tom(1568, 0.16, { tipo: 'square', vol: 0.07, atraso: 0.07 });
        break;
      case 'onda':
        this.tom(196, 0.7, { tipo: 'sawtooth', vol: 0.12, ataque: 0.08 });
        this.tom(294, 0.7, { tipo: 'sawtooth', vol: 0.09, ataque: 0.08 });
        break;
      case 'onda_chefe':
        this.tom(98, 1.3, { tipo: 'sawtooth', vol: 0.2, ataque: 0.15 });
        this.tom(104, 1.3, { tipo: 'sawtooth', vol: 0.16, ataque: 0.15 });
        this.tom(147, 1.3, { tipo: 'sawtooth', vol: 0.12, ataque: 0.15 });
        break;
      case 'fase_chefe':
        this.tom(70, 0.8, { tipo: 'sawtooth', para: 35, vol: 0.3 });
        this.ruido(0.6, 'lowpass', 1500, 0.35, 80);
        break;
      case 'vitoria':
        [0, 4, 7, 12, 16].forEach((s, i) => this.tom(midi(60 + s), 0.45, { tipo: 'triangle', vol: 0.18, atraso: i * 0.13 }));
        break;
      case 'derrota':
        [0, -3, -7, -12].forEach((s, i) => this.tom(midi(57 + s), 0.6, { tipo: 'sawtooth', vol: 0.12, atraso: i * 0.25, para: midi(57 + s) * 0.97 }));
        break;
      case 'erro':
        if (!this.livre(nome, 120)) return;
        this.tom(130, 0.14, { tipo: 'square', vol: 0.12 });
        break;
      case 'clique':
        this.tom(720, 0.05, { vol: 0.1 });
        break;
    }
  }

  // ---------- música gerada ----------

  private iniciarMusica(): void {
    if (!this.ctx || this.timer) return;
    this.proxNota = this.ctx.currentTime + 0.15;
    this.passo = 0;
    this.timer = window.setInterval(() => this.agendar(), 100);
  }

  private agendar(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    while (this.proxNota < ctx.currentTime + 0.35) {
      this.notaMusica(this.passo, this.proxNota - ctx.currentTime);
      const bpm = 76 + this.intensidade * 38;
      this.proxNota += 60 / bpm / 2;
      this.passo++;
    }
  }

  private notaMusica(p: number, atraso: number): void {
    const raizes = [57, 53, 48, 55]; // Am F C G
    const compasso = Math.floor(p / 8) % 4;
    const passo = p % 8;
    const raiz = raizes[compasso];
    const arp = [0, 3, 7, 12, 7, 3, 10, 7][passo];
    const forte = this.intensidade > 0.5;
    this.tom(midi(raiz + 12 + arp), 0.28, { tipo: 'triangle', vol: forte ? 0.1 : 0.07, atraso, destino: 'musica' });
    if (passo === 0 || passo === 4) this.tom(midi(raiz - 12), 0.55, { vol: 0.22, atraso, destino: 'musica' });
    if (passo === 0) {
      this.tom(midi(raiz), 2.2, { tipo: 'sawtooth', vol: 0.025, atraso, ataque: 0.5, destino: 'musica' });
      this.tom(midi(raiz + 7) * 1.004, 2.2, { tipo: 'sawtooth', vol: 0.02, atraso, ataque: 0.5, destino: 'musica' });
    }
    if (forte && passo % 2 === 1) this.ruido(0.05, 'highpass', 6000, 0.05, undefined, atraso, 'musica');
    if (forte && (passo === 2 || passo === 6)) this.tom(150, 0.12, { para: 50, vol: 0.2, atraso, destino: 'musica' });
  }
}

export const audio = new Audio();
