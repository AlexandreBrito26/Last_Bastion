/** Preferências de layout da HUD (salvas no navegador). */
export interface PrefsHud {
  /** fontes e botões menores, para caber em celular */
  fina: boolean;
  /** mostra o tutorial "Como jogar" na primeira partida */
  tutorial: boolean;
  /** mostra os nomes das torres na barra de baixo */
  nomes: boolean;
}

const CHAVE = 'last-bastion:hud';
export const PREFS_PADRAO: PrefsHud = { fina: true, tutorial: true, nomes: false };

export function lerHud(): PrefsHud {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Partial<PrefsHud> | null;
    return { ...PREFS_PADRAO, ...(v ?? {}) };
  } catch {
    return PREFS_PADRAO;
  }
}

export function gravarHud(p: PrefsHud): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

/** Reflete as preferências em classes no <html>; o CSS faz o resto. */
export function aplicarHud(p: PrefsHud): void {
  const el = document.documentElement.classList;
  el.toggle('hud-fina', p.fina);
  el.toggle('hud-sem-tutorial', !p.tutorial);
  el.toggle('hud-com-nomes', p.nomes);
}
