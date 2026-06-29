import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AccessoryLayer } from "../components/AccessoryLayer";
import { PageNav, ROOM_PAGES } from "../components/PageNav";
import { TopBar } from "../components/TopBar";
import { capyBody, capyEyes, capyMouth, roomBackgrounds, shopAssets } from "../assets/capySprites";
import { loadGameStatus, saveGameStatus, saveLastRoom } from "../storage/gameStorage";
import {
  CapybaraMood,
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
  background: ImageSourcePropType;
  action?: CareAction;
  actionLabel: string;
  icon: string;
};

type BarItem = {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
};

type RoomBottomBarConfig = {
  left: BarItem;
  center: BarItem & { hasArrows: boolean };
  right: { label: string };
};

type StatusKey = "hunger" | "happiness" | "energy" | "hygiene";

type ActionCost = {
  key: StatusKey;
  label: string;
};

const COMPACT_BAR_HEIGHT = 44;

const SPRITE_WIDTH = 220;
const SPRITE_HEIGHT = 330;
const BATH_HYGIENE_GAIN = 30;
const BATH_STEPS = 6;
const LOW_STATUS_THRESHOLD = 30;

const actionCosts: Record<CareAction, ActionCost[]> = {
  feed: [{ key: "hygiene", label: "higiene" }],
  bath: [{ key: "energy", label: "energia" }],
  sleep: [{ key: "hunger", label: "fome" }]
};

// Posições das camadas de rosto sobrepostas ao corpo.
// Cada cômodo pode sobrescrever os valores padrão individualmente.
type FaceLayout = {
  eyeTop: number; eyeLeft: number; eyeW: number; eyeH: number;
  mouthTop: number; mouthLeft: number; mouthW: number; mouthH: number;
};

const DEFAULT_FACE: FaceLayout = {
  eyeW: 121, eyeH: 35, eyeTop: 75, eyeLeft: 48,
  mouthW: 150, mouthH: 74, mouthTop: 90, mouthLeft: 35,
};

const ROOM_FACE: Record<RoomName, FaceLayout> = {
  Kitchen:  { ...DEFAULT_FACE },
  Bathroom: { ...DEFAULT_FACE },
  Garden:   { ...DEFAULT_FACE },
  Bedroom:  { ...DEFAULT_FACE },
};

const roomConfigs: Record<RoomName, RoomConfig> = {
  Kitchen:  {
    background:  roomBackgrounds.kitchen,
    action:      "feed",
    actionLabel: "Alimentar",
    icon:        "🥕"
  },
  Bathroom: {
    background:  roomBackgrounds.bathroom,
    action:      "bath",
    actionLabel: "Dar banho",
    icon:        "🫧"
  },
  Garden:   {
    background:  roomBackgrounds.garden,
    actionLabel: "Brincar",
    icon:        "🏖️"
  },
  Bedroom:  {
    background:  roomBackgrounds.bedroom,
    action:      "sleep",
    actionLabel: "Dormir",
    icon:        "🌙"
  }
};

const roomBarConfigs: Record<RoomName, RoomBottomBarConfig> = {
  Kitchen:  {
    left:   { iconName: "fridge",              label: "Geladeira"                  },
    center: { iconName: "food-apple",         label: "Alimentar", hasArrows: false },
    right:  { label: "Loja" }
  },
  Bathroom: {
    left:   { iconName: "shower-head",        label: "Chuveiro"                   },
    center: { iconName: "hand-wash",          label: "Sabão",    hasArrows: false },
    right:  { label: "Loja" }
  },
  Garden:   {
    left:   { iconName: "controller-classic", label: "Mini-jogos"                 },
    center: { iconName: "controller-classic", label: "Brincar",  hasArrows: false },
    right:  { label: "Loja" }
  },
  Bedroom:  {
    left:   { iconName: "wardrobe",           label: "Guarda-roupa"               },
    center: { iconName: "floor-lamp",         label: "Abajur",   hasArrows: false },
    right:  { label: "Loja" }
  }
};

function getBodySprite(mood: CapybaraMood, room: RoomName) {
  if (mood === "triste") return capyBody.sad;
  return capyBody.normal;
}

function getEyeSprite(mood: CapybaraMood) {
  if (mood === "triste") return capyEyes.tired;
  return capyEyes.openNormal;
}

function getMouthSprite(mood: CapybaraMood) {
  if (mood === "triste") return capyMouth.sick;
  if (mood === "feliz") return capyMouth.veryHappy;
  return capyMouth.normal;
}

export function RoomScreen({ navigation, route }: Props) {
  const [status, setStatus] = useState<CapybaraStatus>(initialStatus);
  const [message, setMessage] = useState("");
  const [showSleepAnimation, setShowSleepAnimation] = useState(false);
  const [isBathing, setIsBathing] = useState(false);
  const bathProgress = useRef(new Animated.Value(0)).current;
  const bathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = roomConfigs[route.name];
  const barConfig = roomBarConfigs[route.name];
  const face = ROOM_FACE[route.name];
  const mood = getCapybaraMood(status);

  const pageIndex = ROOM_PAGES.findIndex((p) => p.room === route.name);
  const prevPage = ROOM_PAGES[pageIndex - 1];
  const nextPage = ROOM_PAGES[pageIndex + 1];

  useFocusEffect(
    useCallback(() => {
      loadGameStatus().then(setStatus);
      saveLastRoom(route.name);
      setShowSleepAnimation(false);
      setIsBathing(false);
      bathProgress.stopAnimation();
      bathProgress.setValue(0);
      if (bathIntervalRef.current) {
        clearInterval(bathIntervalRef.current);
        bathIntervalRef.current = null;
      }

      return () => {
        bathProgress.stopAnimation();
        if (bathIntervalRef.current) {
          clearInterval(bathIntervalRef.current);
          bathIntervalRef.current = null;
        }
      };
    }, [route.name])
  );

  useEffect(() => {
    if (route.name !== "Bedroom") {
      setShowSleepAnimation(false);
    }
  }, [route.name]);

  function handlePrev() {
    if (!prevPage) return;
    navigation.replace(prevPage.room);
  }

  function handleNext() {
    if (!nextPage?.room) return;
    navigation.replace(nextPage.room);
  }

  function keepStatusValueInRange(value: number) {
    return Math.min(100, Math.max(0, value));
  }

  function getBlockedActionMessage(action: CareAction) {
    const blockedCost = actionCosts[action].find((cost) => status[cost.key] <= 0);
    if (!blockedCost) return null;

    return `Nao da para usar agora: ${blockedCost.label} esta zerada.`;
  }

  function handleBathAction() {
    if (isBathing) return;

    const blockedMessage = getBlockedActionMessage("bath");
    if (blockedMessage) {
      setMessage(blockedMessage);
      return;
    }

    setMessage("Esfregando com carinho...");
    setShowSleepAnimation(false);
    setIsBathing(true);
    bathProgress.setValue(0);

    const energyAdjustedStatus: CapybaraStatus = {
      ...status,
      energy: keepStatusValueInRange(status.energy - 5)
    };
    let nextBathStatus = energyAdjustedStatus;
    setStatus(energyAdjustedStatus);

    let step = 0;
    const hygienePerStep = BATH_HYGIENE_GAIN / BATH_STEPS;

    Animated.sequence([
      Animated.timing(bathProgress, {
        toValue: 1,
        duration: 1300,
        useNativeDriver: true
      }),
      Animated.timing(bathProgress, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsBathing(false);
      setMessage(actionMessages.bath);
    });

    bathIntervalRef.current = setInterval(() => {
      step += 1;
      nextBathStatus = {
        ...nextBathStatus,
        hygiene: keepStatusValueInRange(nextBathStatus.hygiene + hygienePerStep)
      };
      setStatus(nextBathStatus);

      if (step >= BATH_STEPS) {
        if (bathIntervalRef.current) {
          clearInterval(bathIntervalRef.current);
          bathIntervalRef.current = null;
        }
        saveGameStatus(nextBathStatus);
      }
    }, 190);
  }

  function handleCareAction() {
    if (!config.action) {
      navigation.navigate("MiniGames");
      return;
    }

    if (config.action === "bath") {
      handleBathAction();
      return;
    }

    const blockedMessage = getBlockedActionMessage(config.action);
    if (blockedMessage) {
      setMessage(blockedMessage);
      setShowSleepAnimation(false);
      return;
    }

    const updatedStatus = applyCareAction(status, config.action);
    setStatus(updatedStatus);
    setMessage(actionMessages[config.action]);
    setShowSleepAnimation(config.action === "sleep");
    saveGameStatus(updatedStatus);
  }

  const statusBars = [
    { iconName: "carrot" as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#F47B2D", label: "Fome",    value: status.hunger,    fillColor: "#8BBB31", warning: "Com fome" },
    { iconName: "heart"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#E94B61", label: "Alegria", value: status.happiness, fillColor: "#F06292", warning: "Tristinha" },
    { iconName: "flash"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#F28F2E", label: "Energia", value: status.energy,    fillColor: "#FFC107", warning: "Cansada" },
    { iconName: "water"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#45BADA", label: "Higiene", value: status.hygiene,   fillColor: "#45BADA", warning: "Suja" },
  ];

  return (
    <View style={styles.background}>
      <Image
        resizeMode="cover"
        source={config.background}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>

        {/* Barra superior: moedas à esquerda, perfil à direita */}
        <TopBar coins={status.coins} onProfile={() => navigation.navigate("Profile")} />

        {/* Barras de status flutuantes */}
        <View style={styles.statusBarsRow}>
          {statusBars.map((bar) => {
            const isLow = bar.value <= LOW_STATUS_THRESHOLD;
            const fillColor = isLow ? "#E94B61" : bar.fillColor;
            const fillHeight = (bar.value / 100) * COMPACT_BAR_HEIGHT;
            return (
              <View key={bar.label} style={styles.vBarWidget}>
                <MaterialCommunityIcons color={bar.iconColor} name={bar.iconName} size={18} />
                <View style={[styles.statusWarningBubble, !isLow && styles.hiddenStatusWarning]}>
                  <Text style={styles.statusWarningText}>
                    {bar.value <= 0 ? "Zerou" : bar.warning}
                  </Text>
                </View>
                <View style={styles.vBarTrack}>
                  <View style={[styles.vBarFill, { height: fillHeight, backgroundColor: fillColor }]} />
                </View>
                <Text style={styles.vBarLabel}>{bar.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Paginação de cômodos */}
        <PageNav
          currentPage={pageIndex}
          onPrev={prevPage ? handlePrev : undefined}
          onNext={nextPage ? handleNext : undefined}
        />

        {/* Capy composta por camadas */}
        <View style={styles.spriteArea}>
          <View style={styles.spriteContainer}>
            <Image
              resizeMode="contain"
              source={getBodySprite(mood, route.name)}
              style={styles.spriteBase}
            />
            <Image
              resizeMode="contain"
              source={getEyeSprite(mood)}
              style={[styles.absoluteLayer, { top: face.eyeTop, left: face.eyeLeft, width: face.eyeW, height: face.eyeH }]}
            />
            <Image
              resizeMode="contain"
              source={getMouthSprite(mood)}
              style={[styles.absoluteLayer, { top: face.mouthTop, left: face.mouthLeft, width: face.mouthW, height: face.mouthH }]}
            />
            <AccessoryLayer accessoryId={status.equippedAccessory} />
            {showSleepAnimation && route.name === "Bedroom" ? <SleepBubbles /> : null}
            {isBathing && route.name === "Bathroom" ? (
              <BathSponge bathProgress={bathProgress} />
            ) : null}
          </View>
        </View>

        {/* Mensagem de feedback */}
        <View style={styles.messageArea}>
          <View style={[styles.messageBubble, !message && styles.hiddenMessageBubble]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>

        {/* Barra inferior do cômodo */}
        <View style={styles.roomBar}>
          <View style={styles.barSlot}>
            <MaterialCommunityIcons color="#8A5428" name={barConfig.left.iconName} size={30} />
            <Text style={styles.barLabel}>{barConfig.left.label}</Text>
          </View>

          <Pressable
            accessibilityLabel={config.actionLabel}
            accessibilityRole="button"
            onPress={handleCareAction}
            style={({ pressed }) => [styles.barSlot, styles.barSlotCenter, pressed && styles.pressed]}
          >
            {barConfig.center.hasArrows ? (
              <View style={styles.selectorRow}>
                <MaterialCommunityIcons color="#C49A52" name="chevron-left" size={26} />
                <MaterialCommunityIcons color="#5D351C" name={barConfig.center.iconName} size={36} />
                <MaterialCommunityIcons color="#C49A52" name="chevron-right" size={26} />
              </View>
            ) : (
              <MaterialCommunityIcons color="#5D351C" name={barConfig.center.iconName} size={38} />
            )}
            <Text style={styles.barLabel}>{barConfig.center.label}</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Loja"
            accessibilityRole="button"
            onPress={() => navigation.navigate("Shop")}
            style={({ pressed }) => [styles.barSlot, pressed && styles.pressed]}
          >
            <Image source={shopAssets.shop} style={styles.shopIcon} resizeMode="contain" />
            <Text style={styles.barLabel}>Loja</Text>
          </Pressable>
        </View>

      </SafeAreaView>
    </View>
  );
}

function SleepBubbles() {
  const bubbleOne = useRef(new Animated.Value(0)).current;
  const bubbleTwo = useRef(new Animated.Value(0)).current;
  const bubbleThree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    function makeLoop(value: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2100,
            useNativeDriver: true
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true
          })
        ])
      );
    }

    const loops = [
      makeLoop(bubbleOne, 0),
      makeLoop(bubbleTwo, 360),
      makeLoop(bubbleThree, 720)
    ];

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [bubbleOne, bubbleTwo, bubbleThree]);

  const bubbles = [
    { value: bubbleOne, label: "Z", style: styles.sleepBubbleLarge },
    { value: bubbleTwo, label: "z", style: styles.sleepBubbleMedium },
    { value: bubbleThree, label: "z", style: styles.sleepBubbleSmall }
  ];

  return (
    <View pointerEvents="none" style={styles.sleepLayer}>
      {bubbles.map((bubble, index) => {
        const translateY = bubble.value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -76]
        });
        const translateX = bubble.value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 42]
        });
        const opacity = bubble.value.interpolate({
          inputRange: [0, 0.2, 0.72, 1],
          outputRange: [0, 0.88, 0.7, 0]
        });
        const scale = bubble.value.interpolate({
          inputRange: [0, 0.45, 0.8, 1],
          outputRange: [0.74, 1.08, 0.94, 0.65]
        });

        return (
          <Animated.View
            key={`${bubble.label}-${index}`}
            style={[
              styles.sleepBubble,
              bubble.style,
              {
                opacity,
                transform: [{ translateX }, { translateY }, { scale }]
              }
            ]}
          >
            <Text style={styles.sleepText}>{bubble.label}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

function BathSponge({ bathProgress }: { bathProgress: Animated.Value }) {
  const translateX = bathProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [18, 116, 54, 128, 38]
  });
  const translateY = bathProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [158, 138, 210, 248, 188]
  });
  const rotate = bathProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["-16deg", "13deg", "-10deg", "17deg", "-8deg"]
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sponge,
        {
          transform: [{ translateX }, { translateY }, { rotate }]
        }
      ]}
    >
      <View style={styles.spongeFoamOne} />
      <View style={styles.spongeFoamTwo} />
      <View style={styles.spongeHoleOne} />
      <View style={styles.spongeHoleTwo} />
      <View style={styles.spongeHoleThree} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    backgroundColor: "transparent"
  },
  statusBarsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 245, 217, 0.80)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(169, 99, 37, 0.45)",
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 6,
    marginBottom: 6
  },
  vBarWidget: {
    alignItems: "center",
    width: 72,
    gap: 3
  },
  statusWarningBubble: {
    minWidth: 56,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(255, 248, 231, 0.96)",
    borderWidth: 1.5,
    borderColor: "#E94B61",
    paddingHorizontal: 6
  },
  hiddenStatusWarning: {
    opacity: 0,
    borderColor: "transparent"
  },
  statusWarningText: {
    color: "#8D2435",
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center"
  },
  vBarTrack: {
    width: 22,
    height: COMPACT_BAR_HEIGHT,
    backgroundColor: "rgba(231, 215, 183, 0.70)",
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#C49A52",
    overflow: "hidden",
    justifyContent: "flex-end"
  },
  vBarFill: {
    width: "100%"
  },
  vBarLabel: {
    color: "#4E2D17",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center"
  },
  spriteArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  spriteContainer: {
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT,
    flexShrink: 0
  },
  spriteBase: {
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT
  },
  absoluteLayer: {
    position: "absolute"
  },
  messageArea: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  messageBubble: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 245, 217, 0.92)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C49A52",
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  hiddenMessageBubble: {
    opacity: 0
  },
  messageText: {
    color: "#5B3318",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  pressed: {
    opacity: 0.72
  },
  roomBar: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "rgba(248, 230, 188, 0.92)",
    borderTopWidth: 2,
    borderTopColor: "#C1843C"
  },
  barSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    borderRadius: 18,
    backgroundColor: "rgba(255, 245, 217, 0.88)",
    borderWidth: 2,
    borderColor: "#A96325",
    gap: 4
  },
  barSlotCenter: {
    flex: 1.4
  },
  barLabel: {
    color: "#5D351C",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  shopIcon: {
    width: 40,
    height: 40
  },
  sleepLayer: {
    position: "absolute",
    top: 4,
    left: 118,
    width: 110,
    height: 120,
    zIndex: 10
  },
  sleepBubble: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255, 250, 232, 0.86)",
    borderWidth: 1.5,
    borderColor: "rgba(177, 130, 68, 0.38)"
  },
  sleepBubbleLarge: {
    left: 0,
    bottom: 6,
    width: 42,
    height: 42
  },
  sleepBubbleMedium: {
    left: 28,
    bottom: 22,
    width: 34,
    height: 34
  },
  sleepBubbleSmall: {
    left: 54,
    bottom: 38,
    width: 28,
    height: 28
  },
  sleepText: {
    color: "#6A4A82",
    fontSize: 18,
    fontWeight: "900"
  },
  sponge: {
    position: "absolute",
    zIndex: 11,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#FFE08A",
    borderWidth: 3,
    borderColor: "#C9943A"
  },
  spongeFoamOne: {
    position: "absolute",
    top: -14,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.86)"
  },
  spongeFoamTwo: {
    position: "absolute",
    top: 2,
    right: -16,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.78)"
  },
  spongeHoleOne: {
    position: "absolute",
    left: 12,
    top: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D89F3B"
  },
  spongeHoleTwo: {
    position: "absolute",
    right: 13,
    top: 19,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D89F3B"
  },
  spongeHoleThree: {
    position: "absolute",
    left: 22,
    bottom: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#D89F3B"
  }
});
