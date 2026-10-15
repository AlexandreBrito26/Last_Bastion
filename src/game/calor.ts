/**
 * Mapa de calor: acumula, por célula do mapa, quanto tempo os inimigos passaram ali.
 * A lógica só guarda os números; o desenho e o botão ficam na UI.
 */
export const CELULA_CALOR = 24;

let cols = 0;
let rows = 0;
let grade = new Float32Array(0);
let maximo = 0;
let ligado = false;

/** Zera a grade para o tamanho do mapa. Chamado ao começar uma partida. */
export function iniciarCalor(largura: number, altura: number): void {
  cols = Math.ceil(largura / CELULA_CALOR);
  rows = Math.ceil(altura / CELULA_CALOR);
  grade = new Float32Array(cols * rows);
  maximo = 0;
}

/** Soma `dt` segundos na célula onde o inimigo está agora. */
export function registrarCalor(x: number, y: number, dt: number): void {
  const c = Math.floor(x / CELULA_CALOR);
  const r = Math.floor(y / CELULA_CALOR);
  if (c < 0 || r < 0 || c >= cols || r >= rows) return;
  const i = r * cols + c;
  grade[i] += dt;
  if (grade[i] > maximo) maximo = grade[i];
}

export function gradeCalor() {
  return { cols, rows, grade, maximo };
}

export const calorLigado = (): boolean => ligado;

export function alternarCalor(): void {
  ligado = !ligado;
}
