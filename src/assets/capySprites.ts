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
  shop: require("../../assets/images/shop/shop.png"),
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

// -----------------------------------------------------------------------------
// Overlays — efeitos aplicados por cima da Capy
// -----------------------------------------------------------------------------

/** Manchas de sujeira usadas na limpeza manual */
export const overlayAssets = {
  dirtSplats: require("../../assets/images/overlays/dirt-splats.png"),
} as const;
