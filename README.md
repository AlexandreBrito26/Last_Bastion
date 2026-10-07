# Last Bastion
`npm install && npm run dev`

Tower defense 2D (PixiJS + React + Zustand). 4 torres (Arqueiro, Canhão, Gelo, Tesla), 7 tipos de inimigo
(voador, curandeiro, blindado, chefe com fases), 10 ondas.

**Atalhos:** 1-4 escolhem torre · Esc cancela / volta ao menu · Espaço pausa · Enter chama a próxima onda ·
M liga/desliga o som · R reinicia.

## Etapa 6 — polimento
- **Menu principal** com fundo animado, Continuar / Novo jogo, Como jogar, Opções (volumes) e Sobre.
- **Áudio** sintetizado em tempo real (WebAudio, sem arquivos): efeitos por torre, explosões, mortes, vidas
  perdidas, construir/melhorar/vender, fanfarras e música gerada que fica mais rápida durante as ondas.
  Volumes e mudo são salvos em `localStorage`.
- **Partículas e feedback:** faíscas de disparo, explosões, poeira ao construir, brilho ao melhorar, textos
  flutuantes de ouro, rastro dos projéteis, sombras, clarão ao ser atingido, tremor de tela (chefe, explosões,
  vazamentos). Tudo respeita pausa e velocidade do jogo.
- **Animações de UI:** contadores que "saltam", vidas que tremem, aviso de onda, clarão vermelho ao perder vida,
  painéis que deslizam, tela de fim de jogo. Respeita `prefers-reduced-motion`.
- **Balanceamento** (medido com simulação headless, ver abaixo).

## Arquitetura do feedback
A lógica (`game/systems`) só emite eventos (`core/eventos.ts`); `game/feedback.ts` os traduz em som, partículas e
tremor. A lógica não conhece áudio nem render.

## Notas de balanceamento
- Vida dos inimigos +12% por onda (`ESCALA_VIDA`), tanque armadura 6, chefe armadura 8 e dano 7 ao vazar.
- Cada torre repetida do mesmo tipo custa +12% (`ESCALA_CUSTO`), o que torna o spam de arqueiros menos eficiente.
- Upgrades de nível 2 dão +60% de dano; arqueiro 16 de dano base; ouro inicial 180.
- Resultado nas simulações (20 vidas): jogador forte termina com ~11, médio ~7, ingênuo (só arqueiros sem
  upgrades) ~2. O chefe da onda 10 é o clímax.
