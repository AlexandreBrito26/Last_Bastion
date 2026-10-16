# Last Bastion
`npm install && npm run dev`

Tower defense 2D (PixiJS + React + Zustand). 6 torres de ataque (Arqueiro, Canhão, Gelo, Tesla, Balista, Cristal Arcano), 9 tipos de inimigo
(voador, curandeiro, blindado, espectro, sapador, chefe com fases e dragão), 10 ondas por fase.

**Atalhos:** 1-9 escolhem torre · Q meteoro · W congelar · E escudo · U melhora e V vende a torre selecionada · Esc cancela / volta ao menu · Espaço pausa · Enter chama a próxima onda ·
M liga/desliga o som · F tela cheia · H mapa de calor · R reinicia.

## Novidades
- **Pico Gélido**: nova fase no alto da montanha, com cutscene de cinco painéis (cerca de 110 s) e ondas de Yetis de Gelo.
- **Templo Esquecido**: nova fase no fim da campanha, com cutscene de cinco painéis (cerca de 110 s) e ondas com Besouros, Escudeiros, Golens, Corvos e Lich.
- **Obelisco de Pedra** (💚): torre antiaérea de pedra, com árvore de três ramos e três formas.
- **Sentinela de Pedra**: inimigo blindado que aparece nas ondas do Templo Esquecido.
- **Loja**: as seções ficam no menu ☰, e itens e skins rolam na horizontal. Cada item tem miniatura em canvas.
- **Painel da torre**: forma com progresso até a próxima, estatísticas em grade, evolução por ramo e Celestial destacada.
- **HUD no celular**: barra superior em uma linha, botão ⚙ com opções (HUD fina, tutorial e nomes das torres).
- **Menu principal**: resumo de fases, estrelas e moedas, e "Sobre" ocupando a linha inteira.
- **Cutscene da primeira fase (O Primeiro Bastião)**: 8 painéis, cerca de 2 minutos e 15 segundos. Cada painel passa sozinho, com barra de progresso. Enter ou Espaço avança, Esc ou "Pular cutscene" encerra.
- **Diário**: no menu principal, guarda a história de cada fase que você já viu, mesmo que tenha pulado. Dá para ler e rever a cutscene de novo.
- **Moeda rubi 🔴**: terceira moeda, cai dos inimigos com 0,5% de chance (1 a 3 por drop).
- **Evolução Celestial do Arqueiro**: desbloqueada com 10 🔴 na Loja; em partida, aplica +150% de dano, +40% de cadência e +25% de alcance (400 🪙) com brilho celeste.
- **Preview animado das skins**: o item aparece desenhado em Canvas 2D, na cor do tema, com animação.
- **Skins por item**: cada torre, inimigo, o projétil e o bastião têm skin própria, comprada e equipada na Loja. A Loja mostra a prévia de cada tema para o item escolhido. Em Opções, "Tema geral" aplica um tema a tudo que você possui.
- **Melhorias da moeda verde**: na Loja, três melhorias com 3 níveis cada (bônus inicial, bônus de vitória e drop de inimigos).
- **Skins premium**: Esmeralda (100 💚), Rubi (250), Safira (350) e Diamante (500).
- **Backup do progresso**: em Opções, exporte o save para um `.json` e importe em outro aparelho. O arquivo tem checksum e não usa nuvem.
- **Moeda verde 💚**: cada inimigo derrotado tem 5% de chance de dropar de 5 a 10 moedas. Usada nas skins premium (ex.: Esmeralda, 100 💚).
- **Skin por torre**: no menu de Opções, cada torre pode ter sua própria skin (entre as compradas). "Skin geral" usa a skin escolhida para o jogo inteiro. A escolha é salva no navegador.
- **Novas skins**: Oceano (azul-marinho, 200 moedas), Pergaminho (sépia, 180) e Aurora (luzes polares, 280). Todas cobrem as 11 torres e os inimigos.
- **Lançador de Foguetes**: torre anti-aérea de dano em área (raio 40), com ramos Explosivo, Salva e Raio.
- **Guardião de Ferro**: chefe terrestre (vida 2000, armadura 9) que invoca ogros. Aparece na Ponte de Ferro.
- **Ogro de Pedra**: inimigo terrestre pesado (vida 500, armadura 5). Aparece na Ponte de Ferro e entra no modo sem fim.
- **Arcabuz**: atirador de longo alcance (260), um tiro lento e muito forte (110 de dano). Só terrestres. Ramos Calibre, Mira e Cadência.
- **Nova fase — Ponte de Ferro**: ponte sobre rio de brasas com 3 ondas extras (blindados, corvos, ceifadores e o Colosso de Areia) e 2 chefes na onda final.
- **Balestra Rúnica**: torre que lentifica qualquer inimigo (voador ou terrestre), com dano baixo e ramos Runas, Ritmo e Selo.
- **Nova fase — Desfiladeiro Solar**: cânion de areia com o Colosso de Areia (chefe que invoca escudeiros) e 2 chefes na onda final, ondas de escudeiros, corvos, golems e sapadores. Fica depois do Coração do Bastião.
- **Novos inimigos**: Escudeiro (blindado, aparece na 5ª onda) e Corvo (voador rápido, aparece na 8ª onda). Ambos entram no modo sem fim.
- **Lança Solar**: nova torre (anti-aérea) com lança de luz, queima solar, 3 formas e árvore de evolução com ramos Radiância, Impulso e Ardor.
- **Skin Crepúsculo**: céu roxo ao entardecer. Todas as skins agora também colorem a Lança Solar.
- **Cemitério Sombrio**: nova fase com trilha em zigue-zague, ondas de Ceifadores e Golems de Cristal, e cutscene própria.
- **Novos inimigos**: Golem de Cristal (lento e muito blindado, aparece na 7ª onda) e Ceifador (voador rápido, aparece antes do chefe). Ambos entram no modo sem fim.
- **Novas skins**: Geada (gelo), Floresta (madeira e musgo) e Brasa (ferro quente e lava), além das já existentes. Todas cobrem a Balista e o Cristal Arcano.
- **História por fase**: cada mapa abre com uma cutscene curta de três painéis. Enter ou Espaço avança, Esc pula.
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
