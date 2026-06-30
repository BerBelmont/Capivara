import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { ActionButton } from "../components/ActionButton";
import { playAmbient, playSoundEffect } from "../audio/gameAudio";
import {
  araucariaAssets,
  ballAssets,
  capyBody,
  foodAssets,
  fridgeAsset,
  joystickAsset,
  lampAssets,
  pinhaAssets,
  soapAssets
} from "../assets/capySprites";
import { loadGameStatus, saveGameStatus } from "../storage/gameStorage";
import { RootStackParamList } from "../types/game";
import { addCoinsBonus, addHappinessBonus } from "../utils/statusRules";

type Props = NativeStackScreenProps<RootStackParamList, "MemoryGame">;

type MemoryImage = {
  key: string;
  label: string;
  source: ImageSourcePropType;
};

type Card = MemoryImage & {
  id: number;
  pairKey: string;
};

type MemoryLevel = {
  title: string;
  pairCount: number;
};

const memoryImages: MemoryImage[] = [
  { key: "capy", label: "Capy", source: capyBody.normal },
  { key: "pinha", label: "Pinha", source: pinhaAssets.pinha },
  { key: "araucaria", label: "Arvore", source: araucariaAssets.normal },
  { key: "apple", label: "Maca", source: foodAssets[0].image },
  { key: "banana", label: "Banana", source: foodAssets[1].image },
  { key: "watermelon", label: "Melancia", source: foodAssets[2].image },
  { key: "soap", label: "Sabao", source: soapAssets.sabao },
  { key: "lamp", label: "Abajur", source: lampAssets.on },
  { key: "ball", label: "Bola", source: ballAssets.red },
  { key: "joystick", label: "Jogo", source: joystickAsset },
  { key: "fridge", label: "Geladeira", source: fridgeAsset }
];

const memoryLevels: MemoryLevel[] = [
  { title: "Fase 1", pairCount: 2 },
  { title: "Fase 2", pairCount: 3 },
  { title: "Fase 3", pairCount: 4 },
  { title: "Fase 4", pairCount: 5 },
  { title: "Fase 5", pairCount: 6 },
  { title: "Fase 6", pairCount: 7 }
];

function getLevelCoinsReward(levelIndex: number) {
  return (levelIndex + 1) * 5;
}

function shuffleCards(cards: Card[]) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createLevelCards(pairCount: number) {
  const pairs = memoryImages.slice(0, pairCount);
  const cards = pairs.flatMap((item, index) => ([
    { ...item, id: index * 2 + 1, pairKey: item.key },
    { ...item, id: index * 2 + 2, pairKey: item.key }
  ]));

  return shuffleCards(cards);
}

export function MemoryGameScreen({ navigation }: Props) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("Toque em duas cartas iguais.");
  const [roundSeed, setRoundSeed] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [rewardOverlay, setRewardOverlay] = useState<{
    coins: number;
    happiness: number;
    completedAllLevels: boolean;
  } | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const level = memoryLevels[levelIndex];
  const cards = useMemo(
    () => createLevelCards(level.pairCount),
    [level.pairCount, roundSeed]
  );

  const completed = matchedIds.length === cards.length;
  const isLastLevel = levelIndex === memoryLevels.length - 1;
  const cardSize = level.pairCount <= 3 ? 102 : level.pairCount <= 5 ? 82 : 72;
  const levelCoinsReward = getLevelCoinsReward(levelIndex);

  useFocusEffect(
    useCallback(() => {
      void playAmbient("minigame");
    }, [])
  );

  function isCardVisible(cardId: number) {
    return selectedIds.includes(cardId) || matchedIds.includes(cardId);
  }

  function resetSelectionLater() {
    setTimeout(() => setSelectedIds([]), 850);
  }

  function handleCardPress(card: Card) {
    if (completed || isCardVisible(card.id) || selectedIds.length === 2) {
      return;
    }

    const nextSelectedIds = [...selectedIds, card.id];
    setSelectedIds(nextSelectedIds);

    if (nextSelectedIds.length === 2) {
      const firstCard = cards.find((item) => item.id === nextSelectedIds[0]);
      const hasPair = firstCard?.pairKey === card.pairKey;

      if (hasPair) {
        const nextMatchedIds = [...matchedIds, ...nextSelectedIds];
        setMatchedIds(nextMatchedIds);
        setFeedback("Par encontrado! Muito bem.");
        setSelectedIds([]);

        if (nextMatchedIds.length === cards.length) {
          void playSoundEffect("coin");
          setPendingCoins((current) => current + levelCoinsReward);
          setFeedback(
            isLastLevel
              ? `Todas as fases completas! +${levelCoinsReward} moedas guardadas.`
              : `Fase completa! +${levelCoinsReward} moedas guardadas.`
          );
        }
        return;
      }

      setFeedback("Nao foi dessa vez. Tente novamente com calma.");
      resetSelectionLater();
    }
  }

  function nextLevel() {
    setLevelIndex((current) => current + 1);
    setSelectedIds([]);
    setMatchedIds([]);
    setFeedback("Nova fase: encontre os pares.");
    setRoundSeed((current) => current + 1);
  }

  function restartLevel() {
    setSelectedIds([]);
    setMatchedIds([]);
    setFeedback("Fase reiniciada. Toque em duas cartas iguais.");
    setRoundSeed((current) => current + 1);
  }

  async function finishGame() {
    if (rewardClaimed) return;

    const current = await loadGameStatus();
    const rewardedStatus = addHappinessBonus(
      addCoinsBonus(current, pendingCoins),
      30
    );
    await saveGameStatus(rewardedStatus);
    setRewardClaimed(true);
    setRewardOverlay({
      coins: pendingCoins,
      happiness: 30,
      completedAllLevels: true
    });
  }

  async function stopPlaying() {
    if (rewardClaimed) return;

    if (pendingCoins > 0) {
      const current = await loadGameStatus();
      await saveGameStatus(addCoinsBonus(current, pendingCoins));
    }
    setRewardClaimed(true);
    setRewardOverlay({
      coins: pendingCoins,
      happiness: 0,
      completedAllLevels: false
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.woodHeader}>
          <Text style={styles.title}>Memoria</Text>
          <Text style={styles.levelText}>
            {level.title} - {level.pairCount} pares
          </Text>
        </View>

        <View style={styles.rewardRow}>
          <Text style={styles.rewardText}>Fase: +{levelCoinsReward} moedas</Text>
          <Text style={styles.rewardText}>Guardado: {pendingCoins}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((levelIndex + 1) / memoryLevels.length) * 100}%` }
            ]}
          />
        </View>

        <Text style={styles.feedback}>{feedback}</Text>

        <View style={styles.grid}>
          {cards.map((card) => {
            const visible = isCardVisible(card.id);

            return (
              <Pressable
                accessibilityLabel={visible ? card.label : "Carta virada"}
                accessibilityRole="button"
                key={card.id}
                onPress={() => handleCardPress(card)}
                style={({ pressed }) => [
                  styles.card,
                  { width: cardSize, height: cardSize },
                  visible && styles.visibleCard,
                  pressed && styles.pressed
                ]}
              >
                {visible ? (
                  <Image
                    resizeMode="contain"
                    source={card.source}
                    style={styles.cardImage}
                  />
                ) : (
                  <Text style={styles.cardBack}>?</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          {completed && !isLastLevel ? (
            <ActionButton label="Proxima fase" onPress={nextLevel} />
          ) : null}

          {completed && isLastLevel ? (
            <ActionButton label="Finalizar e receber" onPress={finishGame} />
          ) : null}

          {!completed ? (
            <ActionButton label="Reiniciar fase" onPress={restartLevel} variant="soft" />
          ) : null}

          <ActionButton
            label="Parar de jogar"
            onPress={stopPlaying}
            variant="soft"
          />
        </View>

        {rewardOverlay ? (
          <View style={styles.completionOverlay}>
            <View style={styles.completionCard}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>
                  {rewardOverlay.completedAllLevels ? "Jogo completo" : "Parabens"}
                </Text>
              </View>

              <Text style={styles.completionMessage}>
                {rewardOverlay.coins > 0
                  ? "Moedas recolhidas com sucesso."
                  : "Nenhuma moeda guardada desta vez."}
              </Text>

              <View style={styles.rewardContainer}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>$</Text>
                  <Text style={styles.rewardValue}>+{rewardOverlay.coins} moedas</Text>
                </View>

                {rewardOverlay.happiness > 0 ? (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>♥</Text>
                    <Text style={styles.rewardValue}>+{rewardOverlay.happiness}% alegria</Text>
                  </View>
                ) : null}
              </View>

              <ActionButton
                label="Continuar"
                onPress={() => navigation.goBack()}
                variant="primary"
              />
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7E2B8"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  woodHeader: {
    alignSelf: "center",
    minWidth: 230,
    borderRadius: 18,
    backgroundColor: "#8A5428",
    borderWidth: 3,
    borderColor: "#5E351C",
    paddingVertical: 9,
    paddingHorizontal: 22,
    marginBottom: 10
  },
  title: {
    color: "#FFF5DF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center"
  },
  levelText: {
    color: "#FFE7B7",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center"
  },
  progressTrack: {
    alignSelf: "center",
    width: "78%",
    height: 12,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E8C987",
    borderWidth: 1,
    borderColor: "#A96325",
    marginBottom: 10
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#77B936"
  },
  rewardRow: {
    alignSelf: "center",
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "#FFF8E7",
    borderWidth: 2,
    borderColor: "#C1843C",
    paddingHorizontal: 12,
    marginBottom: 8
  },
  rewardText: {
    color: "#5B3318",
    fontSize: 12,
    fontWeight: "900"
  },
  feedback: {
    minHeight: 58,
    color: "#5B3318",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 10,
    textAlign: "center"
  },
  grid: {
    minHeight: 330,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: 9,
    marginBottom: 12
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#93C94B",
    borderWidth: 3,
    borderColor: "#5F8E22",
    shadowColor: "#6D4322",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 5
  },
  visibleCard: {
    backgroundColor: "#FFF8E7",
    borderColor: "#C1843C"
  },
  cardImage: {
    width: "78%",
    height: "78%"
  },
  cardBack: {
    color: "#FFF8E7",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  actions: {
    gap: 8
  },
  completionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    paddingHorizontal: 20
  },
  completionCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 26,
    backgroundColor: "#FFF8E7",
    borderWidth: 3,
    borderColor: "#A96325",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12
  },
  completionHeader: {
    borderRadius: 18,
    backgroundColor: "#8A5428",
    borderWidth: 3,
    borderColor: "#5E351C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14
  },
  completionTitle: {
    color: "#FFF5DF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  completionMessage: {
    color: "#5B3318",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 16
  },
  rewardContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  rewardItem: {
    flex: 1,
    minHeight: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFF0C5",
    borderWidth: 2,
    borderColor: "#C98B42",
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  rewardIcon: {
    color: "#F5A623",
    fontSize: 28,
    fontWeight: "900"
  },
  rewardValue: {
    color: "#5B3318",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center"
  },
  pressed: {
    opacity: 0.75
  }
});
