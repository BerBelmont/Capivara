# Capivara Companheira

Jogo mobile estilo Tamagotchi para o público **idoso**. O jogador cuida de uma
capivara virtual (a "Capy"): alimenta, dá banho, brinca e a coloca para dormir,
mantendo seus status equilibrados. Inclui minijogos, loja e navegação por
cômodos de uma casa.

O público-alvo idoso é o princípio que orienta todas as decisões de design e
código. Em caso de dúvida entre simplicidade/clareza e sofisticação, escolha
sempre simplicidade e clareza.

## Stack

- React Native `0.81.5` com Expo SDK `~54` (gerenciado, sem código nativo custom)
- TypeScript em modo `strict`
- Navegação: React Navigation v7 (native-stack)
- Persistência local: `@react-native-async-storage/async-storage`
- Sem backend: todo o estado vive no dispositivo
- Só orientação retrato (portrait)

> O Expo Go do dispositivo alvo suporta SDK 54. Não atualizar o SDK sem
> confirmar antes qual versão o Expo Go do celular de testes suporta.

## Comandos

- Instalar: `npm install`
- Rodar no celular: `npx expo start --tunnel` (use sempre `--tunnel` — funciona em qualquer rede)
- Rodar no navegador: `npx expo start --web`
- Verificar tipos: `npx tsc --noEmit`

No Windows com PowerShell, substituir `npx` por `npx.cmd` se o comando travar ou aparecer o erro
`não pode ser carregado porque a execução de scripts foi desabilitada neste sistema` (PSSecurityException).

Sempre rode `npx tsc --noEmit` após mudanças e garanta que passa sem erros antes
de considerar uma tarefa concluída.

## Estrutura do projeto

- `App.tsx` — ponto de entrada; carrega último cômodo visitado e registra telas no stack
- `src/types/` — definições de tipo TypeScript (vocabulário do jogo). Comece por aqui.
- `src/screens/` — telas completas (uma por arquivo)
- `src/components/` — peças de UI reutilizáveis montadas pelas telas
- `src/storage/` — leitura e escrita de estado no AsyncStorage
- `src/utils/` — lógica pura do jogo (regras de status, cálculos)
- `src/assets/capySprites.ts` — constantes `require()` de todos os sprites da Capy e itens

Mantenha essa separação de responsabilidades. Lógica de jogo vai em `utils`,
não dentro de telas. Acesso a armazenamento vai em `storage`, não espalhado.
Novos assets de imagem devem ser exportados de `src/assets/capySprites.ts`.

## Modelo do jogo (ver src/types/game.ts)

- A Capy tem 4 status numéricos: `hunger`, `happiness`, `energy`, `hygiene`.
  Convencionalmente na faixa de 0 a 100 — sempre faça "clamp" para manter os
  valores dentro desses limites.
- `coins` também faz parte de `CapybaraStatus` — moeda do jogo, sem faixa
  máxima, nunca negativa. Use `addCoinsBonus` em `statusRules` para alterá-la.
- O humor (`CapybaraMood`: feliz/normal/triste) é **derivado** dos status, não
  armazenado separadamente.
- 4 ações de cuidado (`CareAction`): `feed`, `bath`, `play`, `sleep`.
- As ações têm trade-offs (definidos em `src/utils/statusRules`): por exemplo,
  comer reduz higiene e brincar reduz energia. Esse equilíbrio é o núcleo da
  jogabilidade — preserve-o ao mexer nas regras.
- Telas: MiniGames, MemoryGame, CatchFoodGame, Shop, Profile, e 4 cômodos
  (Kitchen, Bathroom, Garden, Bedroom) que reutilizam o mesmo `RoomScreen`.
  Não existe mais GameScreen/HomeScreen — o app abre diretamente no último cômodo visitado.

### Navegação por cômodos (PageNav)

A navegação entre cômodos usa paginação com setas e bolinhas (`PageNav`),
sem tiles/botões individuais. A ordem fixa é:

```
Alimentar (Kitchen) → Brincar (Garden) → Dormir (Bedroom) → Banho (Bathroom)
```

- O componente `PageNav` vive em `src/components/PageNav.tsx` e exporta
  também a constante `ROOM_PAGES` com a ordem canônica — use ela em qualquer
  lugar que precise da ordem dos cômodos.
- Navegação entre cômodos usa `navigation.replace()` para não empilhar telas.
- O último cômodo visitado é salvo via `saveLastRoom` e restaurado ao abrir
  o app (lógica em `App.tsx` com `useState`/`useEffect`).

### TopBar

O componente `src/components/TopBar.tsx` exibe moedas (esquerda) e botão de
perfil (direita). É usado em todos os cômodos. Aceita `coins: number` e
`onProfile: () => void`.

### Layout do RoomScreen

Cada cômodo tem:
- `TopBar` (moedas + perfil) no topo
- Barras de status compactas (altura 44px) flutuantes
- `PageNav` para trocar de cômodo
- Capy composta por camadas de sprites (`capyBody` + `capyEyes` + `capyMouth`)
  sobre o background de cena, com animação de bounce
- **Barra inferior fixa** com 3 slots (esquerda / centro / direita):
  - Centro: `Pressable` que dispara a ação de cuidado do cômodo
  - Direita: sempre a loja
  - Esquerda: visual por ora

Não há mais `ActionButton` separado no corpo da tela — a ação fica exclusivamente
no slot central da barra inferior.

## Sistema de sprites da Capy (`src/assets/capySprites.ts`)

A Capy é composta por camadas de imagens PNG transparentes sobrepostas.
Todas as imagens estão em `assets/images/` e exportadas de `capySprites.ts`.

| Exportação | Camada | Conteúdo |
|---|---|---|
| `capyBody` | Base | Corpo inteiro: `normal`, `cesta`, `pipoca`, `sad` |
| `capyEyes` | Olhos | `openNormal`, `openSick`, `tired`, `closed` |
| `capyMouth` | Boca/bochechas | `normal`, `happy`, `veryHappy`, `joke`, `sick`, `uau`, `faceTired` |
| `capyWalk` | Animação | Capy andando com cesta: `center`, `right`, `left` |
| `cestaPinhas` | Item | Array[5]: cesta com 1–5 pinhas (índice = quantidade − 1) |
| `shopAssets` | UI | `loja` (fachada da loja), `hatBoina` (acessório) |
| `statusIcons` | UI | `sleep` (ícone Zzz para o quarto) |

**Regra:** não use `require("../../assets/images/...")` diretamente nas telas —
importe de `capySprites.ts` para manter os paths centralizados.

### Posicionamento das camadas de rosto (ROOM_FACE)

As camadas de olhos e boca são posicionadas via `top/left/width/height` absolutos
sobre o `capyBody` (220×330px). Os valores ficam em `DEFAULT_FACE` em
`RoomScreen.tsx` e se aplicam a todos os cômodos. Cada cômodo pode sobrescrever
via `ROOM_FACE[roomName]`.

Valores calibrados e aprovados:
```typescript
const DEFAULT_FACE = {
  eyeW: 121, eyeH: 35, eyeTop: 75, eyeLeft: 48,
  mouthW: 150, mouthH: 74, mouthTop: 90, mouthLeft: 35,
};
```

## Imagens de background dos cômodos

As imagens de cena (`capybara-kitchen.png` etc.) devem estar em `assets/images/`
e ter **390 × 844 px** — proporção exata da tela lógica do celular alvo.

Para redimensionar novas imagens preservando o conteúdo (usa `sharp`):
```bash
node -e "
const sharp = require('sharp');
sharp('input.png')
  .resize(390, 844, { fit: 'cover', position: 'centre' })
  .toFile('output.png');
"
```

### Padrão correto para background de tela cheia

**Nunca use `ImageBackground` com `flex: 1` sozinho** — não funciona de forma
confiável em todos os dispositivos Android.

O padrão correto é:
```tsx
<View style={{ flex: 1 }}>
  <Image
    source={config.background}
    resizeMode="cover"
    style={StyleSheet.absoluteFillObject}
  />
  {/* conteúdo da tela por cima */}
</View>
```

`StyleSheet.absoluteFillObject` (`top/left/right/bottom: 0`) garante que a
imagem preenche o pai exatamente, independente das dimensões do dispositivo.
`Dimensions.get("window")` **não deve** ser usado para dimensionar o background
— retorna valores que não correspondem à área real do View em alguns dispositivos.

## Acessibilidade (requisito central, não opcional)

O jogo é para idosos. Toda UI nova deve seguir estes princípios por padrão:

- **Texto grande e legível.** Fontes amplas; nunca texto pequeno ou cinza-claro
  sobre fundo claro. Alto contraste sempre.
- **Não depender só de cor.** Status crítico ou feedback nunca pode ser
  indicado apenas por cor — use também texto, ícone ou forma.
- **Alvos de toque grandes e espaçados.** Botões generosos, com espaço entre
  eles para evitar toques acidentais.
- **Sem gestos complexos.** Nada de arrastar, pinçar ou multitoque. Toques
  simples apenas.
- **Sem pressão de tempo.** Nenhuma ação deve exigir reação rápida.
- **Feedback óbvio.** Toda ação dá retorno visual claro e imediato.
- **Telas simples.** Um objetivo por tela; evite poluição visual e menus
  escondidos.

A paleta atual usa tons creme/bege quentes (ex.: `#F8F3E8`, `#F5E8D0`).
Mantenha a coerência com ela.

## Convenções de código

- TypeScript `strict` — tipos explícitos, sem `any`.
- Componentes em arquivos separados; reutilize componentes de `components/`
  em vez de duplicar UI.
- Mantenha lógica pura (sem efeitos colaterais) em `utils/` para facilitar
  testes e leitura.

## Como trabalhar comigo neste projeto

- Antes de implementar mudanças não triviais, descreva o plano e espere
  aprovação.
- Para qualquer alteração, mostre o que mudou e explique o porquê das decisões
  — este projeto também é de aprendizado.
- Não reescreva partes que já funcionam sem necessidade.
- Ao tocar nas regras de status, explique o impacto no equilíbrio do jogo.
