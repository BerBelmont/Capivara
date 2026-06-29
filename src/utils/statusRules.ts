import { CapybaraMood, CapybaraStatus, CareAction } from "../types/game";

export const initialStatus: CapybaraStatus = {
  coins: 9999,
  hunger: 70,
  happiness: 70,
  energy: 70,
  hygiene: 70,
  lightOn: true,
  ownedAccessories: [],
  equippedAccessory: null
};

const actionChanges: Record<CareAction, Partial<CapybaraStatus>> = {
  feed:  { hunger: 25, hygiene: -20, happiness: 5 },
  bath:  { hygiene: 40, energy: -15, happiness: 5 },
  sleep: { energy: 40, hunger: -20, hygiene: -10 },
  play:  { happiness: 30, energy: -20, hygiene: -15, hunger: -10 }
};

export const actionMessages: Record<CareAction, string> = {
  feed:  "A capivara comeu bem!",
  bath:  "A capivara ficou limpinha!",
  sleep: "A capivara descansou um pouco!",
  play:  "A capivara adorou brincar!"
};

function keepInRange(value: number) {
  return Math.min(100, Math.max(0, value));
}

// Aplica uma ação de cuidado e garante que nenhum status saia do intervalo 0-100.
export function applyCareAction(
  status: CapybaraStatus,
  action: CareAction
): CapybaraStatus {
  const changes = actionChanges[action];

  return {
    ...status,
    hunger: keepInRange(status.hunger + (changes.hunger ?? 0)),
    happiness: keepInRange(status.happiness + (changes.happiness ?? 0)),
    energy: keepInRange(status.energy + (changes.energy ?? 0)),
    hygiene: keepInRange(status.hygiene + (changes.hygiene ?? 0))
  };
}

export function applyLampToggle(status: CapybaraStatus): CapybaraStatus {
  if (status.lightOn) {
    const sleeping = applyCareAction(status, "sleep");
    return { ...sleeping, lightOn: false };
  }
  return { ...status, lightOn: true };
}

export function addCoinsBonus(
  status: CapybaraStatus,
  coins: number
): CapybaraStatus {
  return {
    ...status,
    coins: Math.max(0, status.coins + coins)
  };
}

// Recompensa usada quando o usuário conclui um minijogo.
export function addHappinessBonus(
  status: CapybaraStatus,
  points: number
): CapybaraStatus {
  return {
    ...status,
    happiness: keepInRange(status.happiness + points)
  };
}

// Define o humor da capivara a partir dos status principais.
export function getCapybaraMood(status: CapybaraStatus): CapybaraMood {
  const values = [status.hunger, status.happiness, status.energy, status.hygiene];

  if (values.some((value) => value < 30)) {
    return "triste";
  }

  if (values.every((value) => value > 60)) {
    return "feliz";
  }

  return "normal";
}
