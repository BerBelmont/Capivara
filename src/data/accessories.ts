import { ImageSourcePropType } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { hatAssets } from "../assets/capySprites";
import { AccessoryId } from "../types/game";

export type AccessoryItem = {
  id: AccessoryId;
  name: string;
  price: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  image?: ImageSourcePropType;
};

export const accessoryItems: AccessoryItem[] = [
  {
    id: "strawHat",
    name: "Chapeu de Palha",
    price: 200,
    iconName: "hat-fedora",
    iconColor: "#C98B42"
  },
  {
    id: "roundGlasses",
    name: "Oculos Redondo",
    price: 150,
    iconName: "glasses",
    iconColor: "#5D351C"
  },
  {
    id: "greenScarf",
    name: "Cachecol Verde",
    price: 180,
    iconName: "tshirt-crew",
    iconColor: "#5C9E38"
  },
  {
    id: "beret",
    name: "Boina",
    price: 160,
    iconName: "hat-fedora",
    iconColor: "#8A4A28",
    image: hatAssets.boina
  },
  {
    id: "leafTiara",
    name: "Tiara de Folhas",
    price: 150,
    iconName: "leaf",
    iconColor: "#65A83E"
  },
  {
    id: "headphones",
    name: "Fone de Ouvido",
    price: 200,
    iconName: "headphones",
    iconColor: "#4B4B4B"
  },
  {
    id: "floatRing",
    name: "Boia Colorida",
    price: 250,
    iconName: "lifebuoy",
    iconColor: "#E86C78"
  }
];

export function getAccessoryById(id: AccessoryId | null) {
  if (!id) return undefined;
  return accessoryItems.find((item) => item.id === id);
}
