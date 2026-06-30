export type AccessoryId =
  | "strawHat"
  | "roundGlasses"
  | "greenScarf"
  | "beret"
  | "leafTiara"
  | "headphones"
  | "floatRing";

export type CapybaraStatus = {
  coins: number;
  hunger: number;
  happiness: number;
  energy: number;
  hygiene: number;
  lightOn: boolean;
  ownedAccessories: AccessoryId[];
  equippedAccessory: AccessoryId | null;
};

export type CapybaraMood = "feliz" | "normal" | "triste";

export type CareAction = "feed" | "bath" | "sleep" | "play";

export type RoomName = "Kitchen" | "Bathroom" | "Garden" | "Bedroom";

export type CapybaraScene = "home" | "kitchen" | "bathroom" | "garden" | "bedroom";

export type RootStackParamList = {
  MiniGames: undefined;
  CatchFoodGame: undefined;
  MemoryGame: undefined;
  Shop: undefined;
  Kitchen: undefined;
  Bathroom: undefined;
  Garden: undefined;
  Bedroom: undefined;
};
