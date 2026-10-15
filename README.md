# Last Bastion
`npm install && npm run dev`

Tower defense 2D (PixiJS + React + Zustand). 5 torres de ataque (Arqueiro, Canhão, Gelo, Tesla, Balista), 9 tipos de inimigo
(voador, curandeiro, blindado, espectro, sapador, chefe com fases e dragão), 10 ondas por fase.

**Atalhos:** 1-8 escolhem torre · Q meteoro · W congelar · E escudo · U melhora e V vende a torre selecionada · Esc cancela / volta ao menu · Espaço pausa · Enter chama a próxima onda ·
M liga/desliga o som · F tela cheia · H mapa de calor · R reinicia.

## Novidades
- **Tutorial**: dicas na primeira partida, fechadas com "Entendi" (salvo no navegador).
- **Prévia de upgrade**: cada melhoria mostra o efeito em dano, cadência, alcance e outros atributos.
- **Formas da torre**: a cada 3 nós comprados a torre evolui. Cada forma tem nome próprio, ornamento (pontas, asas e coroa) e cor que parte da skin escolhida e vai ficando mais parecida com a cor da forma. Cada forma também tem efeitos animados: brilho pulsante (forma 2), faíscas orbitando (forma 3) e aura dourada com luz (forma 4). Com mais dano e cadência. Por exemplo, o Arqueiro vai de Batedor a Franco-atirador e Sentinela Celeste.
- **Árvore de evolução**: cada torre tem três ramos com três nós. Um nó só fica disponível depois do anterior do mesmo ramo, então dá para escolher um foco ou combinar ramos. A cor da torre segue o ramo com mais nós.
- **Venda em lote**: com várias torres do mesmo tipo, o painel da torre selecionada oferece vender todas de uma vez, com confirmação.
- **Mapa de calor (H)**: mostra em amarelo a vermelho por onde os inimigos passam mais, para planejar onde posicionar as torres.
- **Atalhos U e V**: melhora e vende a torre selecionada.
- **Balista** e a fase **Pântano Profundo**.
- **Modo sem fim (∞):** depois de vencer uma fase, o botão *Modo sem fim* gera ondas infinitas. A composição gira
  pelos inimigos, a quantidade cresce devagar e a cada 5 ondas aparece um grupo extra de tanques ou sapadores.
  Ondas sem fim não contam para as estrelas.
- **Modo desafio:** versão mais difícil da fase, com estrelas separadas.
- **Torre de suporte (Totem):** não ataca, mas dá +15% de dano e +10% de cadência às torres próximas. A aura não acumula entre totens.
- **Skins:** em *Opções* escolha entre Padrão, Ouro, Sombra e Neon (com prévia desenhada em canvas). Cada skin também muda a cor e o formato dos projéteis (bola, losango ou estrela). A skin muda as cores das torres, dos inimigos (chefes mantêm o efeito de dano) e o bastião no fim da trilha (torre de pedra com bandeira na cor da skin). A escolha é salva no navegador.
- **Nova fase — Dunas Douradas:** areia quente com tema próprio, obstáculos de rocha e cristal e levas grandes de inimigos.
- **Escudo (E):** por 6 s, inimigos que chegam ao fim não tiram vidas. Recarga de 30 s.

- **Moedas e loja:** vencer uma fase rende moedas (10 + 10 por estrela; o modo desafio dobra). As moedas são
  guardadas no navegador e gastas na **Loja**, no menu, para desbloquear skins: Ouro (150), Sombra (200) e Neon (250).
  Só skins compradas podem ser equipadas.

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
