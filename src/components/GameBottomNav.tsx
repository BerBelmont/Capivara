import { BottomNav } from "./BottomNav";

type MainTab = "home" | "care" | "games" | "shop";

type GameBottomNavProps = {
  active: MainTab;
  onHome: () => void;
  onGames: () => void;
  onShop: () => void;
};

export function GameBottomNav({
  active,
  onHome,
  onGames,
  onShop
}: GameBottomNavProps) {
  return (
    <BottomNav
      items={[
        {
          icon: "home",
          iconName: "home-variant",
          iconColor: "#5EA333",
          label: "Inicio",
          active: active === "home",
          onPress: onHome
        },
        {
          icon: "care",
          iconName: "heart",
          iconColor: "#E34B5C",
          label: "Cuidados",
          active: active === "care",
          onPress: onHome
        },
        {
          icon: "games",
          iconName: "gamepad-variant",
          iconColor: "#6B4ABC",
          label: "Jogos",
          active: active === "games",
          onPress: onGames
        },
        {
          icon: "shop",
          iconName: "storefront",
          iconColor: "#DB6450",
          label: "Loja",
          active: active === "shop",
          onPress: onShop
        }
      ]}
    />
  );
}
