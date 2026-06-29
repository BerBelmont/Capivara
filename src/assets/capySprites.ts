// =============================================================================
// capySprites.ts — fonte única de verdade para todos os assets de imagem.
//
// REGRA: nunca use require("../../assets/images/...") diretamente nas telas
// ou componentes. Importe sempre deste arquivo para manter os paths centralizados.
//
// Estrutura de pastas:
//   assets/images/
//   ├── capy/         sprites da Capy (corpo, olhos, boca, animação de andar)
//   ├── backgrounds/  fundos dos cômodos e minijogos
//   ├── items/        pinhas, cestas, araucárias
//   ├── shop/         fachada da loja e acessórios
//   └── icons/        ícones de UI
// =============================================================================

// -----------------------------------------------------------------------------
// Capy — camadas de sprites sobrepostas para compor o personagem dinamicamente
// -----------------------------------------------------------------------------

/** Corpo inteiro da Capy (camada base) */
export const capyBody = {
  normal:  require("../../assets/images/capy/capy-body.png"),
  cesta:   require("../../assets/images/capy/capy-body-cesta.png"),
  pipoca:  require("../../assets/images/capy/capy-body-pipoca.png"),
  sad:     require("../../assets/images/capy/capy-body-sad.png"),
} as const;

/** Olhos da Capy (camada sobre o corpo) */
export const capyEyes = {
  openNormal: require("../../assets/images/capy/capy-eyes-open-normal.png"),
  openSick:   require("../../assets/images/capy/capy-eyes-open-sick.png"),
  tired:      require("../../assets/images/capy/capy-eyes-tired.png"),
  closed:     require("../../assets/images/capy/capy-eyes-closed.png"),
} as const;

/** Boca e bochechas da Capy (camada sobre os olhos) */
export const capyMouth = {
  normal:    require("../../assets/images/capy/capy-mouth-cheeks-normal.png"),
  happy:     require("../../assets/images/capy/capy-mouth-cheeks-happy.png"),
  veryHappy: require("../../assets/images/capy/capy-mouth-very-happy.png"),
  joke:      require("../../assets/images/capy/capy-mouth-cheeks-joke.png"),
  sick:      require("../../assets/images/capy/capy-mouth-cheeks-sick.png"),
  uau:       require("../../assets/images/capy/capy-mouth-cheeks-uau.png"),
  faceTired: require("../../assets/images/capy/capy-face-tired.png"),
} as const;

/** Quadros de animação da Capy andando com a cesta */
export const capyWalk = {
  center: require("../../assets/images/capy/capy-com-cesta-move.png"),
  right:  require("../../assets/images/capy/capy-com-cesta-move-D.png"),
  left:   require("../../assets/images/capy/capy-com-cesta-move-E.png"),
} as const;

// -----------------------------------------------------------------------------
// Backgrounds — fundos de tela cheia (390 × 844 px)
// -----------------------------------------------------------------------------

/** Fundos dos cômodos da casa */
export const roomBackgrounds = {
  kitchen:  require("../../assets/images/backgrounds/capybara-kitchen.png"),
  bathroom: require("../../assets/images/backgrounds/capybara-bathroom.png"),
  bedroom:  require("../../assets/images/backgrounds/capybara-bedroom.png"),
  garden:   require("../../assets/images/backgrounds/capybara-lobby-cartoon.png"),
  home:     require("../../assets/images/backgrounds/capybara-home-cartoon.png"),
} as const;

/** Backgrounds de minijogos e telas especiais */
export const gameBackgrounds = {
  catchFood: require("../../assets/images/backgrounds/capybara-pine-game-bg.png"),
  hero:      require("../../assets/images/backgrounds/capybara-hero.png"),
} as const;

// -----------------------------------------------------------------------------
// Items — objetos coletáveis e de interação no jogo
// -----------------------------------------------------------------------------

/**
 * Cestas de pinhas para o minijogo (índice = quantidade de pinhas − 1).
 * cestaPinhas[0] = cesta vazia/1 pinha, cestaPinhas[4] = cesta cheia/5 pinhas.
 */
export const cestaPinhas = [
  require("../../assets/images/items/cestas-pinhas.png"),
  require("../../assets/images/items/cesta-pinhas-2un.png"),
  require("../../assets/images/items/cesta-pinhas-3un.png"),
  require("../../assets/images/items/cesta-pinhas-4un.png"),
  require("../../assets/images/items/cesta-pinhas-5un.png"),
] as const;

/** Pinha (item que cai no minijogo CatchFood) */
export const pinhaAssets = {
  pinha:        require("../../assets/images/items/pinha.png"),
  pinhaV2:      require("../../assets/images/items/pinha-v2.png"),
  pinhaV2Chroma: require("../../assets/images/items/pinha-v2-chroma.png"),
} as const;

/** Araucária (árvore decorativa no minijogo CatchFood) */
export const araucariaAssets = {
  normal:      require("../../assets/images/items/araucaria.png"),
  wide:        require("../../assets/images/items/araucaria-wide.png"),
  wideChroma:  require("../../assets/images/items/araucaria-wide-chroma.png"),
} as const;

// -----------------------------------------------------------------------------
// Shop — loja e acessórios
// -----------------------------------------------------------------------------

/** Assets da loja */
export const shopAssets = {
  shop: require("../../assets/images/shop/loja-icon.png"),
} as const;

/** Assets de sabão e banho */
export const soapAssets = {
  sabao:    require("../../assets/images/soaps/pou-soap.png"),
  chuveiro: require("../../assets/images/soaps/pou-shower.png"),
} as const;

/** Assets de abajur/lâmpada do quarto */
export const lampAssets = {
  on:  require("../../assets/images/lamps/light-on.png"),
  off: require("../../assets/images/lamps/light-off.png"),
  red: require("../../assets/images/lamps/red.png"),
} as const;

/** Bolas para o jardim */
export const ballAssets = {
  red: require("../../assets/images/balls/100/red.png"),
} as const;

/** Ícone de joystick para mini-jogos */
export const joystickAsset = require("../../assets/images/joystick.png");

/** Ícone de geladeira para a cozinha */
export const fridgeAsset = require("../../assets/images/food/fridge.png");

/** Ícone de ajuda */
export const helpIcon = require("../../assets/images/icons/help.png");

/** Alimentos brasileiros para a cozinha */
export const foodAssets = [
  { name: "Maçã",            image: require("../../assets/images/food/apple.png") },
  { name: "Banana",          image: require("../../assets/images/food/banana.png") },
  { name: "Melancia",        image: require("../../assets/images/food/watermelon.png") },
  { name: "Laranja",         image: require("../../assets/images/food/orange-fruit.png") },
  { name: "Morango",         image: require("../../assets/images/food/strawberry.png") },
  { name: "Manga",           image: require("../../assets/images/food/mango.png") },
  { name: "Abacaxi",         image: require("../../assets/images/food/pineapple.png") },
  { name: "Milho",           image: require("../../assets/images/food/corn.png") },
  { name: "Cenoura",         image: require("../../assets/images/food/carrot.png") },
  { name: "Ovo",             image: require("../../assets/images/food/egg.png") },
  { name: "Frango",          image: require("../../assets/images/food/chicken-leg.png") },
  { name: "Pizza",           image: require("../../assets/images/food/pizza.png") },
  { name: "Hambúrguer",      image: require("../../assets/images/food/burger.png") },
  { name: "Cachorro-quente", image: require("../../assets/images/food/hotdog.png") },
  { name: "Batata Frita",    image: require("../../assets/images/food/fries.png") },
  { name: "Biscoito",        image: require("../../assets/images/food/cookie.png") },
  { name: "Bolo",            image: require("../../assets/images/food/chocolate-cake.png") },
  { name: "Leite",           image: require("../../assets/images/food/milk.png") },
  { name: "Suco",            image: require("../../assets/images/food/orange-juice.png") },
  { name: "Água",            image: require("../../assets/images/food/water.png") },
];

/** Guarda-roupa do quarto */
export const closetAssets = {
  closet: require("../../assets/images/closets/closet.png"),
} as const;

/** Fundo de suporte para ícones sem moldura própria */
export const uiAssets = {
  iconSupport: require("../../assets/images/icon-support.png"),
} as const;

/** Acessórios compráveis (chapéus, etc.) */
export const hatAssets = {
  boina: require("../../assets/images/hats/boinas/hat-boina.png"),
} as const;

// -----------------------------------------------------------------------------
// Icons — ícones de UI e status
// -----------------------------------------------------------------------------

/** Ícones de estado exibidos nos cômodos */
export const statusIcons = {
  sleep: require("../../assets/images/icons/sleep-icon.png"),
} as const;

/** Imagens de moeda (do Pou) */
export const coinAssets = {
  coin:   require("../../assets/images/icons/coin.png"),
  coinSm: require("../../assets/images/icons/coin-sm.png"),
  coinBig: require("../../assets/images/icons/coin-big.png"),
} as const;

// -----------------------------------------------------------------------------
// Overlays — efeitos aplicados por cima da Capy
// -----------------------------------------------------------------------------

/** Manchas de sujeira usadas na limpeza manual */
export const overlayAssets = {
  dirtSplats: require("../../assets/images/overlays/dirt-splats.png"),
} as const;
