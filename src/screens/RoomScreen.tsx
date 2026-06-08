import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ActionButton } from "../components/ActionButton";
import { CapybaraDisplay } from "../components/CapybaraDisplay";
import { GameBottomNav } from "../components/GameBottomNav";
import { StatusBar } from "../components/StatusBar";
import { loadGameStatus, saveGameStatus } from "../storage/gameStorage";
import {
  CapybaraScene,
  CapybaraStatus,
  CareAction,
  RootStackParamList,
  RoomName
} from "../types/game";
import {
  actionMessages,
  applyCareAction,
  getCapybaraMood,
  initialStatus
} from "../utils/statusRules";

type Props = NativeStackScreenProps<RootStackParamList, RoomName>;

type RoomConfig = {
  title: string;
  subtitle: string;
  scene: CapybaraScene;
  action: CareAction;
  actionLabel: string;
  icon: string;
};

const roomConfigs: Record<RoomName, RoomConfig> = {
  Kitchen: {
    title: "Cozinha",
    subtitle: "Hora de comer com calma.",
    scene: "kitchen",
    action: "feed",
    actionLabel: "Alimentar",
    icon: "🥕"
  },
  Bathroom: {
    title: "Banheiro",
    subtitle: "Um banho gostoso deixa tudo melhor.",
    scene: "bathroom",
    action: "bath",
    actionLabel: "Dar banho",
    icon: "🫧"
  },
  Garden: {
    title: "Jardim",
    subtitle: "Brincar um pouco alegra o dia.",
    scene: "garden",
    action: "play",
    actionLabel: "Brincar",
    icon: "🏖️"
  },
  Bedroom: {
    title: "Quarto",
    subtitle: "Descansar também é cuidado.",
    scene: "bedroom",
    action: "sleep",
    actionLabel: "Dormir",
    icon: "🌙"
  }
};

export function RoomScreen({ navigation, route }: Props) {
  const [status, setStatus] = useState<CapybaraStatus>(initialStatus);
  const [message, setMessage] = useState("Escolha uma ação para cuidar da capivara.");
  const config = roomConfigs[route.name];
  const mood = getCapybaraMood(status);

  useEffect(() => {
    loadGameStatus().then(setStatus);
  }, []);

  function handleCareAction() {
    const updatedStatus = applyCareAction(status, config.action);
    setStatus(updatedStatus);
    setMessage(actionMessages[config.action]);
    saveGameStatus(updatedStatus);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <ActionButton label="Voltar" onPress={() => navigation.navigate("Game")} variant="soft" />
        </View>

        <View style={styles.titleCard}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>

        <CapybaraDisplay mood={mood} scene={config.scene} compact />
        <Text style={styles.message}>{message}</Text>

        <View style={styles.statusGroup}>
          <StatusBar iconColor="#F47B2D" iconName="carrot" label="Fome" value={status.hunger} color="#7CAD32" />
          <StatusBar iconColor="#E94B61" iconName="heart" label="Felicidade" value={status.happiness} color="#9AC447" />
          <StatusBar iconColor="#F28F2E" iconName="flash" label="Energia" value={status.energy} color="#F0A02E" />
          <StatusBar iconColor="#45BADA" iconName="water" label="Higiene" value={status.hygiene} color="#4CB9D6" />
        </View>

        <ActionButton icon={config.icon} label={config.actionLabel} onPress={handleCareAction} />

        <GameBottomNav
          active="care"
          onGames={() => navigation.navigate("MiniGames")}
          onHome={() => navigation.navigate("Game")}
          onProfile={() => navigation.navigate("Profile")}
          onShop={() => navigation.navigate("Shop")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7E2B8"
  },
  container: {
    padding: 14,
    paddingBottom: 24
  },
  topBar: {
    alignSelf: "flex-start",
    width: 130,
    marginBottom: 8
  },
  titleCard: {
    borderRadius: 22,
    backgroundColor: "#8A5428",
    borderWidth: 3,
    borderColor: "#5E351C",
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  title: {
    color: "#FFF5DF",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    color: "#FFE2A9",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
    marginTop: 3,
    textAlign: "center"
  },
  message: {
    minHeight: 54,
    color: "#5B3318",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 8,
    textAlign: "center"
  },
  statusGroup: {
    borderRadius: 20,
    backgroundColor: "#FFF8E7",
    borderWidth: 2,
    borderColor: "#C1843C",
    padding: 12,
    marginBottom: 10
  }
});
