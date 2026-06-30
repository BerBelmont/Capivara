# Capivara Companheira

## O que e o jogo

**Capivara Companheira** e um jogo mobile de cuidado virtual, inspirado em jogos estilo Tamagotchi. O jogador cuida de uma capivara chamada Cacau, acompanhando suas necessidades do dia a dia: comer, brincar, dormir e manter a higiene.

A proposta e criar uma experiencia simples, visual e acolhedora, com interacoes diretas e telas tematicas. O jogo foi pensado para ser facil de entender, com botoes grandes, feedback visual claro e progresso baseado em pequenas acoes de cuidado.

## Objetivo do jogador

O objetivo principal e manter a capivara saudavel e feliz. Para isso, o jogador precisa equilibrar quatro status:

- **Fome**
- **Alegria**
- **Energia**
- **Higiene**

Quando esses status estao bons, a capivara fica mais feliz. Quando algum deles cai demais, ela demonstra cansaco ou tristeza, incentivando o jogador a cuidar dela.

## Como funciona o ciclo do jogo

O jogo acontece em diferentes ambientes da casa da capivara. Cada ambiente tem uma funcao principal:

- **Cozinha:** alimentar a capivara.
- **Banheiro:** limpar a capivara quando ela estiver suja.
- **Quarto:** colocar a capivara para dormir e recuperar energia.
- **Area de lazer/jardim:** brincar e acessar os minigames.
- **Loja:** comprar e equipar acessorios.

O jogador navega entre esses ambientes pela interface e escolhe a acao mais adequada conforme os status atuais.

## Sistema de status

Cada status vai de **0 a 100**. As acoes aumentam ou diminuem esses valores, sempre respeitando esse limite.

### Fome

A fome representa o quanto a capivara esta alimentada.

- Cada alimento aumenta **25% da fome**.
- Alimentar tambem aumenta um pouco a alegria.
- Como consequencia, alimentar reduz a higiene, porque a capivara se suja ao comer.
- Se a fome ja estiver cheia, a acao de alimentar e bloqueada.

### Alegria

A alegria representa o humor da capivara.

- Brincar aumenta bastante a alegria.
- Minigames tambem ajudam a melhorar a alegria como recompensa.
- Se a alegria ja estiver cheia, a acao de brincar e bloqueada.

### Energia

A energia representa o cansaco da capivara.

- Brincar consome energia.
- Dormir recupera energia gradualmente.
- Ao apagar a luz no quarto, a capivara comeca a dormir.
- Enquanto ela dorme, recupera **20% de energia por segundo** ate chegar em 100.
- Se a energia ja estiver cheia, a acao de dormir e bloqueada.

### Higiene

A higiene representa o nivel de limpeza da capivara.

- Comer e brincar reduzem higiene.
- A limpeza so pode ser feita quando a capivara estiver suja.
- A limpeza acontece **somente com a bucha**, no banheiro.
- O jogador precisa passar a bucha nas manchas de sujeira para limpar.
- Se a higiene ja estiver cheia ou a capivara ainda estiver limpa, a acao de limpeza e bloqueada.

## Bloqueios das acoes

O jogo evita que o jogador use acoes sem necessidade. Isso deixa o sistema mais coerente e ajuda o jogador a entender o que a capivara realmente precisa.

Exemplos:

- Nao da para alimentar se a fome ja estiver em 100.
- Nao da para dormir se a energia ja estiver em 100.
- Nao da para brincar se a alegria ja estiver em 100.
- Nao da para limpar se a capivara nao estiver suja.
- Nao da para fazer algumas acoes se o status necessario estiver zerado, como brincar sem energia.

## Humor da capivara

O humor da capivara e calculado a partir dos quatro status principais.

- Se algum status fica muito baixo, ela fica triste.
- Se todos os status estao bons, ela fica feliz.
- Em situacoes intermediarias, ela fica em estado normal.

Esse humor aparece visualmente no rosto e no corpo da capivara, tornando o feedback mais facil de perceber.

## Minigames

Os minigames sao atividades extras dentro do jogo. Eles servem para deixar a experiencia mais divertida e tambem recompensam o jogador com moedas e alegria.

### Pegue a comida

Neste minigame, pinhas caem da arvore e o jogador precisa mover a cesta para coleta-las.

Funcionamento:

- O jogador controla uma cesta.
- As pinhas caem de cima da tela.
- Cada pinha coletada mostra feedback de moeda.
- A fase termina ao coletar 10 pinhas.
- Ao concluir a rodada, o jogador recebe moedas e bonus de alegria.
- A cada nova rodada, a dificuldade aumenta gradualmente, com as pinhas caindo mais rapido.

Esse minigame trabalha atencao, coordenacao e reacao, mas sem ser agressivo ou rapido demais.

### Jogo da memoria

Neste minigame, o jogador precisa encontrar pares de cartas iguais.

Funcionamento:

- As cartas ficam viradas para baixo.
- O jogador toca em duas cartas por vez.
- Se forem iguais, o par fica revelado.
- Se forem diferentes, as cartas voltam a ficar escondidas.
- Cada fase aumenta a quantidade de pares.
- Ao completar uma fase, o jogador acumula moedas.
- Ao finalizar todas as fases, recebe moedas e bonus de alegria.

Esse minigame trabalha memoria visual, reconhecimento de imagens e concentracao.

## Moedas e loja

As moedas sao a recompensa principal dos minigames. Com elas, o jogador pode comprar acessorios para personalizar a capivara.

Na loja, os itens podem ser:

- comprados;
- equipados;
- desequipados.

Isso cria uma sensacao de progresso e personalizacao, mesmo em uma experiencia simples.

## Sons e ambiente

O jogo usa sons para reforcar o clima de cada momento:

- Nas areas principais, ha uma musica relaxante e lenta.
- A musica continua tocando ao trocar entre areas de cuidado, sem reiniciar.
- Ao dormir, o jogo usa um ambiente noturno com som de grilos.
- Nos minigames, existe uma musica relaxante propria.
- Coletar moedas e concluir fases gera feedback sonoro.
- Comer tambem possui um efeito sonoro curto.

## Proposta visual

O jogo utiliza uma identidade visual colorida, simples e amigavel, com cenarios de casa, jardim, cozinha, banheiro e quarto.

A interface prioriza:

- botoes grandes;
- informacoes visuais claras;
- textos curtos;
- icones reconheciveis;
- feedback imediato para cada acao.

## Resumo para slides

1. **Ideia central:** cuidar de uma capivara virtual.
2. **Objetivo:** manter fome, alegria, energia e higiene equilibradas.
3. **Ambientes:** cozinha, banheiro, quarto, lazer e loja.
4. **Acoes principais:** alimentar, brincar, dormir e limpar.
5. **Status:** variam de 0 a 100 e afetam o humor da capivara.
6. **Minigames:** pegador de pinhas e jogo da memoria.
7. **Recompensas:** moedas, alegria e personalizacao.
8. **Diferencial:** experiencia leve, acessivel e relaxante.
