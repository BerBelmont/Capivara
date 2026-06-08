import { BottomNav } from "./BottomNav";

type MainTab = "home" | "care" | "games" | "shop" | "profile";

type GameBottomNavProps = {
  active: MainTab;
  onHome: () => void;
  onGames: () => void;
  onShop: () => void;
  onProfile: () => void;
};

export function GameBottomNav({
  active,
  onHome,
  onGames,
  onShop,
  onProfile
}: GameBottomNavProps) {
  return (
    <BottomNav
      items={[
        {
          icon: "🏠",
          iconName: "home-variant",
          iconColor: "#5EA333",
          label: "Início",
          active: active === "home",
          onPress: onHome
        },
        {
          icon: "❤️",
          iconName: "heart",
          iconColor: "#E34B5C",
          label: "Cuidados",
          active: active === "care",
          onPress: onHome
        },
        {
          icon: "🎮",
          iconName: "gamepad-variant",
          iconColor: "#6B4ABC",
          label: "Jogos",
          active: active === "games",
          onPress: onGames
        },
        {
          icon: "🏪",
          iconName: "storefront",
          iconColor: "#DB6450",
          label: "Loja",
          active: active === "shop",
          onPress: onShop
        },
        {
          icon: "🐹",
          iconName: "face-man-profile",
          iconColor: "#C98036",
          label: "Perfil",
          active: active === "profile",
          onPress: onProfile
        }
      ]}
    />
  );
}
