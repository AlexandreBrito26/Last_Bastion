# Last Bastion
`npm install && npm run dev`

Tower defense 2D (PixiJS + React + Zustand). 4 torres (Arqueiro, Canhão, Gelo, Tesla), 7 tipos de inimigo
(voador, curandeiro, blindado, chefe com fases), 10 ondas.

**Atalhos:** 1-5 escolhem torre · Q meteoro · W congelar · Esc cancela / volta ao menu · Espaço pausa · Enter chama a próxima onda ·
M liga/desliga o som · R reinicia.

## Etapa 7 — fases, gameplay e arte
- **3 fases** (Trilha Inicial, Cânion de Cinzas, Fortaleza Gelada) com tema, obstáculos que bloqueiam construção,
  dificuldade própria (vida/quantidade dos inimigos, ouro, vidas) e ondas geradas por `gerarOndas`. A Fortaleza
  tem 14 ondas e **2 chefes**. Vencer libera a próxima; progresso (até 3 estrelas) salvo em `localStorage`.
- **Nova torre:** Morteiro (alcance enorme, área grande, lento, só terrestres) com dois caminhos de upgrade.
- **Habilidades ativas:** ☄ Meteoro (**Q**, mira no mapa, 40 s de recarga) e ❄ Congelar (**W**, 55 s).
- **Arte procedural:** terreno gerado em canvas por fase (ruído em camadas, detalhes, trilha texturizada com
  sombra e seixos, árvores/rochas/lagos/lava/cristais), vinheta, gradação de cor por tema (`ColorMatrixFilter`),
  **bloom** aditivo com `BlurFilter`, luzes dinâmicas (projéteis, explosões, lava, torres), atmosfera animada
  (vagalumes, brasas, neve), torres com mira rotativa e recuo, inimigos com sombreamento, olhos que seguem a
  direção, asas animadas e chefe com aura. **Qualidade adaptativa:** se o FPS cai, bloom e gradação são desligados.

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
