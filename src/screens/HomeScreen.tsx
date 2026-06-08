import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/game";

const capybaraHero = require("../../assets/images/capybara-home-cartoon.png");

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  function showInstructions() {
    Alert.alert(
      "Instruções",
      "Cuide da sua capivara alimentando, dando banho, brincando e descansando."
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phone}>
        <ImageBackground
          accessibilityLabel="Capivara feliz em um jardim perto de um lago"
          resizeMode="cover"
          source={capybaraHero}
          style={styles.hero}
        >
          <View style={styles.notch} />

          <Pressable
            accessibilityRole="button"
            onPress={showInstructions}
            style={({ pressed }) => [styles.gearButton, pressed && styles.pressed]}
          >
            <Text style={styles.gearIcon}>⚙</Text>
          </Pressable>

          <View style={styles.logoSign}>
            <Text style={styles.logoTop}>Capivara</Text>
            <Text style={styles.logoBottom}>Tamagotchi</Text>
            <Text style={styles.logoCapy}>🐹</Text>
          </View>

          <View style={styles.buttonStack}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Game")}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.buttonIcon}>🥚</Text>
              <Text style={styles.primaryLabel}>Começar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("MiniGames")}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.buttonIcon}>🎮</Text>
              <Text style={styles.secondaryLabel}>Minijogos</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7E2B8",
    padding: 12
  },
  phone: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 34,
    backgroundColor: "#9FCB6B",
    borderWidth: 3,
    borderColor: "#1F1D1A",
    shadowColor: "#563619",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8
  },
  hero: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16
  },
  notch: {
    position: "absolute",
    top: 0,
    left: "35%",
    right: "35%",
    height: 22,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    backgroundColor: "#1F1D1A"
  },
  gearButton: {
    position: "absolute",
    top: 24,
    right: 14,
    zIndex: 2,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#FFF4D8",
    borderWidth: 3,
    borderColor: "#8A5428"
  },
  gearIcon: {
    color: "#6A3B1E",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 29
  },
  logoSign: {
    alignItems: "center",
    alignSelf: "center",
    minWidth: "76%",
    borderRadius: 24,
    backgroundColor: "#B87535",
    borderWidth: 3,
    borderColor: "#6F3D1C",
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 14,
    marginTop: 48,
    shadowColor: "#4E2D17",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6
  },
  logoTop: {
    color: "#FFF3D0",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 43,
    textAlign: "center",
    textShadowColor: "#5E351C",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  logoBottom: {
    color: "#7DCA3F",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
    textShadowColor: "#3C611E",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  logoCapy: {
    position: "absolute",
    top: -26,
    fontSize: 44
  },
  buttonStack: {
    gap: 10,
    marginBottom: 18
  },
  primaryButton: {
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#68B52F",
    borderWidth: 4,
    borderColor: "#3E811D",
    shadowColor: "#4E2D17",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 7
  },
  secondaryButton: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#FFC45C",
    borderWidth: 4,
    borderColor: "#A96325",
    shadowColor: "#4E2D17",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6
  },
  buttonIcon: {
    fontSize: 30,
    marginRight: 10
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  secondaryLabel: {
    color: "#5B3318",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  pressed: {
    opacity: 0.74
  }
});
