import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ActionButton } from "../components/ActionButton";
import { RootStackParamList } from "../types/game";

type Props = NativeStackScreenProps<RootStackParamList, "MemoryGame">;

type Card = {
  id: number;
  symbol: string;
};

const cards: Card[] = [
  { id: 1, symbol: "🐾" },
  { id: 2, symbol: "🥕" },
  { id: 3, symbol: "🐾" },
  { id: 4, symbol: "🥕" }
];

export function MemoryGameScreen({ navigation }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("Toque em duas cartas iguais.");

  function isCardVisible(cardId: number) {
    return selectedIds.includes(cardId) || matchedIds.includes(cardId);
  }

  function handleCardPress(card: Card) {
    if (isCardVisible(card.id) || selectedIds.length === 2) {
      return;
    }

    const nextSelectedIds = [...selectedIds, card.id];
    setSelectedIds(nextSelectedIds);

    if (nextSelectedIds.length === 2) {
      const firstCard = cards.find((item) => item.id === nextSelectedIds[0]);
      const hasPair = firstCard?.symbol === card.symbol;

      if (hasPair) {
        const nextMatchedIds = [...matchedIds, ...nextSelectedIds];
        setMatchedIds(nextMatchedIds);
        setFeedback("Par encontrado! Muito bem.");
        setSelectedIds([]);

        if (nextMatchedIds.length === cards.length) {
          setFeedback("Jogo completo! A capivara ganhou felicidade.");
        }
        return;
      }

      setFeedback("Não foi dessa vez. Tente novamente com calma.");
      setTimeout(() => setSelectedIds([]), 900);
    }
  }

  function finishGame() {
    navigation.navigate("Game", { happinessBonus: 15 });
  }

  const completed = matchedIds.length === cards.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.woodHeader}>
          <Text style={styles.title}>Memória</Text>
        </View>
        <Text style={styles.feedback}>{feedback}</Text>

        <View style={styles.grid}>
          {cards.map((card) => (
            <Pressable
              accessibilityRole="button"
              key={card.id}
              onPress={() => handleCardPress(card)}
              style={({ pressed }) => [
                styles.card,
                isCardVisible(card.id) && styles.visibleCard,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.cardText}>
                {isCardVisible(card.id) ? card.symbol : "?"}
              </Text>
            </Pressable>
          ))}
        </View>

        {completed ? (
          <ActionButton label="Voltar com prêmio" onPress={finishGame} />
        ) : (
          <ActionButton
            label="Voltar"
            onPress={() => navigation.goBack()}
            variant="soft"
          />
        )}
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
    padding: 20
  },
  woodHeader: {
    alignSelf: "center",
    minWidth: 210,
    borderRadius: 18,
    backgroundColor: "#8A5428",
    borderWidth: 3,
    borderColor: "#5E351C",
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginBottom: 14
  },
  title: {
    color: "#FFF5DF",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center"
  },
  feedback: {
    minHeight: 68,
    color: "#5B3318",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 16,
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginBottom: 24
  },
  card: {
    width: 130,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#93C94B",
    borderWidth: 3,
    borderColor: "#5F8E22",
    shadowColor: "#6D4322",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5
  },
  visibleCard: {
    backgroundColor: "#FFF8E7",
    borderColor: "#C1843C"
  },
  pressed: {
    opacity: 0.75
  },
  cardText: {
    color: "#5B3318",
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center"
  }
});
