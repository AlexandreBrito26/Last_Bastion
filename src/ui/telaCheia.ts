/** Alterna a tela cheia do documento. Sem suporte, não faz nada. */
export function alternarTelaCheia(): void {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
    return;
  }
  document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
}
