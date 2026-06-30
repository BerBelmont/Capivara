import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  PanResponder,
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
import { GardenBall } from "../components/GardenBall";
import { KitchenFood } from "../components/KitchenFood";
import { PageNav, ROOM_PAGES } from "../components/PageNav";
import { TopBar } from "../components/TopBar";
import { playAmbient, playSoundEffect } from "../audio/gameAudio";
import { ballAssets, capyBody, capyEyes, capyMouth, closetAssets, fridgeAsset, helpIcon, joystickAsset, lampAssets, overlayAssets, roomBackgrounds, shopAssets, soapAssets, uiAssets } from "../assets/capySprites";
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
  applyLampToggle,
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
  image?: ImageSourcePropType;
  backgroundImage?: ImageSourcePropType;
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
const CRITICAL_THRESHOLD = 10;
const WARNING_THRESHOLD = 25;

function getStatusFillColor(value: number): string {
  if (value <= CRITICAL_THRESHOLD) return "#E94B61";
  if (value <= WARNING_THRESHOLD)  return "#E94B61";
  if (value <= 50)                 return "#FFC107";
  if (value <= 75)                 return "#9BC43A";
  return "#4CAF50";
}


const SPRITE_WIDTH = 220;
const SPRITE_HEIGHT = 330;
const BATH_HYGIENE_GAIN = 35;
const LOW_STATUS_THRESHOLD = 30;
const SPONGE_SIZE = 54;
const SPONGE_TOUCH_RADIUS = 34;
const SLEEP_ENERGY_GAIN_PER_SECOND = 20;

const actionCosts: Record<CareAction, ActionCost[]> = {
  feed:  [{ key: "hygiene", label: "higiene" }],
  bath:  [{ key: "energy",  label: "energia" }],
  sleep: [{ key: "hunger",  label: "fome" }],
  play:  [{ key: "energy",  label: "energia" }]
};

const dirtSpots = [
  { id: "head", top: 82, left: 80, width: 48, height: 38, rotate: "-9deg" },
  { id: "belly", top: 168, left: 92, width: 58, height: 46, rotate: "7deg" },
  { id: "back", top: 142, left: 38, width: 48, height: 38, rotate: "12deg" },
  { id: "leg", top: 238, left: 118, width: 50, height: 40, rotate: "-13deg" },
  { id: "side", top: 202, left: 48, width: 44, height: 34, rotate: "5deg" }
] as const;

type DirtSpotId = (typeof dirtSpots)[number]["id"];

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
    action:      "play",
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

const ROOM_HELP: Record<RoomName, { title: string; body: string }> = {
  Kitchen:  {
    title: "Como alimentar a Capy?",
    body:  "Pressione e arraste o alimento até a boca da Capy para ela comer!\n\nUse as setas < > para trocar o alimento.",
  },
  Garden:   {
    title: "Como brincar com a Capy?",
    body:  "Arraste a bola e solte para jogá-la!\n\nQuanto mais rápido você arrastar, mais longe a bola vai.",
  },
  Bedroom:  {
    title: "Como a Capy dorme?",
    body:  "Toque no abajur para apagar a luz e a Capy vai dormir.\n\nToque novamente para acordá-la.",
  },
  Bathroom: {
    title: "Como dar banho na Capy?",
    body:  "Arraste a esponja sobre as manchas de sujeira no corpo da Capy para limpá-las.\n\nQuando todas as manchas sumirem ela ficará limpinha!",
  },
};

const roomBarConfigs: Record<RoomName, RoomBottomBarConfig> = {
  Kitchen:  {
    left:   { iconName: "fridge",              label: "Geladeira", image: fridgeAsset },
    center: { iconName: "food-apple",         label: "Alimentar", hasArrows: false },
    right:  { label: "Loja" }
  },
  Bathroom: {
    left:   { iconName: "shower-head",        label: "Chuveiro", image: soapAssets.chuveiro },
    center: { iconName: "hand-wash",          label: "Sabão",    hasArrows: false, image: soapAssets.sabao },
    right:  { label: "Loja" }
  },
  Garden:   {
    left:   { iconName: "controller-classic", label: "Mini-jogos", image: joystickAsset },
    center: { iconName: "controller-classic", label: "",           hasArrows: false },
    right:  { label: "Loja" }
  },
  Bedroom:  {
    left:   { iconName: "wardrobe",           label: "Guarda-roupa", image: closetAssets.closet },
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
  const [isCleaning, setIsCleaning] = useState(false);
  const [visibleDirtIds, setVisibleDirtIds] = useState<DirtSpotId[]>([]);
  const [spongePosition, setSpongePosition] = useState({ x: 88, y: 138 });
  const statusRef = useRef<CapybaraStatus>(initialStatus);
  const visibleDirtIdsRef = useRef<DirtSpotId[]>([]);
  const isCleaningRef = useRef(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const spriteContainerRef = useRef<View>(null);
  const [mouthCenter, setMouthCenter] = useState({ x: 0, y: 0 });
  const [eatingPhase, setEatingPhase] = useState<"idle" | "eating" | "happy">("idle");
  const eatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const config = roomConfigs[route.name];
  const barConfig = roomBarConfigs[route.name];
  const face = ROOM_FACE[route.name];
  const mood = getCapybaraMood(status);

  const pageIndex = ROOM_PAGES.findIndex((p) => p.room === route.name);
  const prevPage = ROOM_PAGES[pageIndex - 1];
  const nextPage = ROOM_PAGES[pageIndex + 1];

  useFocusEffect(
    useCallback(() => {
      loadGameStatus().then((loaded) => {
        setStatus(loaded);
        if (!loaded.lightOn && route.name !== "Bedroom") {
          setMessage("A Capy está dormindo! Vá ao quarto e acenda a luz para acordá-la. 🌙");
        } else {
          setMessage("");
        }
      });
      saveLastRoom(route.name);
      setShowSleepAnimation(false);
      setIsCleaning(false);
      setSpongePosition({ x: 88, y: 138 });
    }, [route.name])
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    visibleDirtIdsRef.current = visibleDirtIds;
  }, [visibleDirtIds]);

  useEffect(() => {
    isCleaningRef.current = isCleaning;
  }, [isCleaning]);

  useEffect(() => {
    if (route.name !== "Bedroom") {
      setShowSleepAnimation(false);
    }
  }, [route.name]);

  useEffect(() => {
    void playAmbient(route.name === "Bedroom" && !status.lightOn ? "sleep" : "leisure");
  }, [route.name, status.lightOn]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blinkAnim]);

  useEffect(() => {
    if (status.hygiene <= LOW_STATUS_THRESHOLD) {
      setVisibleDirtIds((current) => (
        current.length > 0 ? current : dirtSpots.map((spot) => spot.id)
      ));
      return;
    }

    setVisibleDirtIds([]);
    setIsCleaning(false);
  }, [status.hygiene]);

  function getSpongePositionForSpot(spotId: DirtSpotId | undefined) {
    const spot = dirtSpots.find((item) => item.id === spotId) ?? dirtSpots[0];
    return {
      x: Math.min(SPRITE_WIDTH - SPONGE_SIZE, spot.left + spot.width - 18),
      y: Math.max(0, spot.top - 10)
    };
  }

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

  function getFullStatusActionMessage(action: CareAction) {
    if (action === "feed" && status.hunger >= 100) return "A fome ja esta cheia.";
    if (action === "bath" && status.hygiene >= 100) return "A higiene ja esta cheia.";
    if (action === "sleep" && status.energy >= 100) return "A energia ja esta cheia.";
    if (action === "play" && status.happiness >= 100) return "A alegria ja esta cheia.";
    return null;
  }

  useEffect(() => {
    if (status.lightOn) return undefined;

    const sleepTimer = setInterval(() => {
      setStatus((current) => {
        if (current.lightOn || current.energy >= 100) return current;

        const nextStatus: CapybaraStatus = {
          ...current,
          energy: keepStatusValueInRange(current.energy + SLEEP_ENERGY_GAIN_PER_SECOND)
        };

        statusRef.current = nextStatus;
        void saveGameStatus(nextStatus);
        return nextStatus;
      });
    }, 1000);

    return () => clearInterval(sleepTimer);
  }, [status.lightOn]);

  function handleBathAction() {
    const blockedMessage = getBlockedActionMessage("bath");
    if (blockedMessage) {
      setMessage(blockedMessage);
      return;
    }

    const fullStatusMessage = getFullStatusActionMessage("bath");
    if (fullStatusMessage) {
      setMessage(fullStatusMessage);
      setShowSleepAnimation(false);
      return;
    }

    if (status.hygiene > LOW_STATUS_THRESHOLD) {
      setMessage("A Capy ainda esta limpa. Use a bucha somente quando ela estiver suja.");
      setShowSleepAnimation(false);
      return;
    }

    const nextDirtIds = visibleDirtIds.length > 0
      ? visibleDirtIds
      : dirtSpots.map((spot) => spot.id);

    setVisibleDirtIds(nextDirtIds);
    setIsCleaning(true);
    setSpongePosition(getSpongePositionForSpot(nextDirtIds[0]));
    setMessage("Arraste a bucha por cima das sujeirinhas para limpar.");
    setShowSleepAnimation(false);
  }

  function finishManualCleaning() {
    const currentStatus = statusRef.current;
    const cleanedStatus: CapybaraStatus = {
      ...currentStatus,
      energy: keepStatusValueInRange(currentStatus.energy - 5),
      hygiene: keepStatusValueInRange(currentStatus.hygiene + BATH_HYGIENE_GAIN)
    };

    setStatus(cleanedStatus);
    setIsCleaning(false);
    setMessage(actionMessages.bath);
    saveGameStatus(cleanedStatus);
  }

  function removeDirtSpot(spotId: DirtSpotId) {
    if (!isCleaningRef.current) {
      setMessage("Clique em Sabao para pegar a bucha primeiro.");
      return;
    }

    const remainingDirt = visibleDirtIdsRef.current.filter((id) => id !== spotId);
    visibleDirtIdsRef.current = remainingDirt;
    setVisibleDirtIds(remainingDirt);

    if (remainingDirt.length > 0) {
      setMessage("Boa! Continue limpando as manchas.");
      return;
    }

    finishManualCleaning();
  }

  function cleanDirtAtPosition(x: number, y: number) {
    if (!isCleaningRef.current) return;

    const spongeCenterX = x + SPONGE_SIZE / 2;
    const spongeCenterY = y + SPONGE_SIZE / 2;
    const touchedSpot = dirtSpots.find((spot) => {
      if (!visibleDirtIdsRef.current.includes(spot.id)) return false;

      const spotCenterX = spot.left + spot.width / 2;
      const spotCenterY = spot.top + spot.height / 2;
      const distance = Math.hypot(spongeCenterX - spotCenterX, spongeCenterY - spotCenterY);

      return distance <= SPONGE_TOUCH_RADIUS;
    });

    if (touchedSpot) {
      removeDirtSpot(touchedSpot.id);
    }
  }

  const cleaningPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isCleaningRef.current,
      onMoveShouldSetPanResponder: () => isCleaningRef.current,
      onPanResponderGrant: (event) => {
        const x = Math.min(
          SPRITE_WIDTH - SPONGE_SIZE,
          Math.max(0, event.nativeEvent.locationX - SPONGE_SIZE / 2)
        );
        const y = Math.min(
          SPRITE_HEIGHT - SPONGE_SIZE,
          Math.max(0, event.nativeEvent.locationY - SPONGE_SIZE / 2)
        );

        setSpongePosition({ x, y });
        cleanDirtAtPosition(x, y);
      },
      onPanResponderMove: (event) => {
        const x = Math.min(
          SPRITE_WIDTH - SPONGE_SIZE,
          Math.max(0, event.nativeEvent.locationX - SPONGE_SIZE / 2)
        );
        const y = Math.min(
          SPRITE_HEIGHT - SPONGE_SIZE,
          Math.max(0, event.nativeEvent.locationY - SPONGE_SIZE / 2)
        );

        setSpongePosition({ x, y });
        cleanDirtAtPosition(x, y);
      }
    })
  ).current;

  function handleEat() {
    if (eatingTimerRef.current) clearTimeout(eatingTimerRef.current);
    const fullStatusMessage = getFullStatusActionMessage("feed");
    if (fullStatusMessage) {
      setMessage(fullStatusMessage);
      setEatingPhase("idle");
      return;
    }

    void playSoundEffect("eat");
    const updated = applyCareAction(statusRef.current, "feed");
    statusRef.current = updated;
    setStatus(updated);
    saveGameStatus(updated);
    setEatingPhase("eating");
    eatingTimerRef.current = setTimeout(() => {
      setEatingPhase("happy");
      eatingTimerRef.current = setTimeout(() => {
        setEatingPhase("idle");
        setMessage("A Capy adorou a comida!");
      }, 800);
    }, 500);
  }

  function handleLampToggle() {
    if (status.lightOn) {
      const fullStatusMessage = getFullStatusActionMessage("sleep");
      if (fullStatusMessage) {
        setMessage(fullStatusMessage);
        setShowSleepAnimation(false);
        return;
      }
    }

    const updated = applyLampToggle(status);
    setStatus(updated);
    setMessage(updated.lightOn ? "Bom dia! A Capy acordou!" : "Boa noite! A Capy foi dormir!");
    void playAmbient(updated.lightOn ? "leisure" : "sleep");
    saveGameStatus(updated);
  }

  const lastPlayRef = useRef(0);
  function handlePlay() {
    if (!status.lightOn) {
      setMessage("A Capy esta dormindo! Va ao quarto e acenda a luz para acorda-la.");
      return;
    }

    const blockedMessage = getBlockedActionMessage("play");
    if (blockedMessage) {
      setMessage(blockedMessage);
      return;
    }

    const fullStatusMessage = getFullStatusActionMessage("play");
    if (fullStatusMessage) {
      setMessage(fullStatusMessage);
      return;
    }

    const now = Date.now();
    if (now - lastPlayRef.current < 1000) return;
    lastPlayRef.current = now;

    const updated = applyCareAction(statusRef.current, "play");
    statusRef.current = updated;
    setStatus(updated);
    saveGameStatus(updated);
  }

  function handleCareAction() {
    if (route.name === "Bedroom") {
      handleLampToggle();
      return;
    }

    if (!status.lightOn) {
      setMessage("A Capy está dormindo! Vá ao quarto e acenda a luz para acordá-la. 🌙");
      return;
    }

    if (config.action === "bath") {
      handleBathAction();
      return;
    }

    const action = config.action;
    if (!action) return;

    const blockedMessage = getBlockedActionMessage(action);
    if (blockedMessage) {
      setMessage(blockedMessage);
      setShowSleepAnimation(false);
      return;
    }

    const fullStatusMessage = getFullStatusActionMessage(action);
    if (fullStatusMessage) {
      setMessage(fullStatusMessage);
      setShowSleepAnimation(false);
      return;
    }

    const updatedStatus = applyCareAction(status, action);
    setStatus(updatedStatus);
    setMessage(actionMessages[action]);
    setShowSleepAnimation(action === "sleep");
    saveGameStatus(updatedStatus);
  }

  const statusBars = [
    { iconName: "carrot" as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#F47B2D", label: "Fome",    value: status.hunger,    warning: "Com fome" },
    { iconName: "heart"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#E94B61", label: "Alegria", value: status.happiness, warning: "Tristinha" },
    { iconName: "flash"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#F28F2E", label: "Energia", value: status.energy,    warning: "Cansada" },
    { iconName: "water"  as keyof typeof MaterialCommunityIcons.glyphMap, iconColor: "#45BADA", label: "Higiene", value: status.hygiene,   warning: "Suja" },
  ];

  return (
    <View style={styles.background}>
      <Image
        resizeMode="cover"
        source={config.background}
        style={StyleSheet.absoluteFillObject}
      />
      {!status.lightOn ? (
        <View style={styles.darkOverlay} />
      ) : null}
<SafeAreaView style={styles.safeArea}>

        {/* Barra superior: moedas à esquerda, perfil à direita */}
        <TopBar coins={status.coins} />

        {/* Barras de status flutuantes */}
        <View style={styles.statusBarsRow}>
          {statusBars.map((bar) => {
            const isCritical = bar.value <= CRITICAL_THRESHOLD;
            const isWarning  = bar.value <= WARNING_THRESHOLD;
            const fillColor  = getStatusFillColor(bar.value);
            const fillHeight = (bar.value / 100) * COMPACT_BAR_HEIGHT;
            const fillStyle  = [styles.vBarFill, { height: fillHeight, backgroundColor: fillColor }];
            return (
              <View key={bar.label} style={styles.vBarWidget}>
                <MaterialCommunityIcons color={bar.iconColor} name={bar.iconName} size={18} />
                <View style={styles.vBarTrack}>
                  {isCritical ? (
                    <Animated.View style={[...fillStyle, { opacity: blinkAnim }]} />
                  ) : (
                    <View style={fillStyle} />
                  )}
                </View>
                <Text style={styles.vBarLabel}>{bar.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Paginação de cômodos */}
        <View style={{ overflow: "visible" }}>
          <PageNav
            currentPage={pageIndex}
            onPrev={prevPage ? handlePrev : undefined}
            onNext={nextPage ? handleNext : undefined}
          />
          <Pressable onPress={() => setShowHelp(true)} style={styles.helpNavBtn}>
            <MaterialCommunityIcons name="help-circle-outline" size={44} color="#FFFFFF" style={styles.helpIcon} />
          </Pressable>
        </View>

        <Modal visible={showHelp} transparent animationType="fade">
          <View style={styles.helpOverlay}>
            <View style={styles.helpCard}>
              <Text style={styles.helpCardTitle}>{ROOM_HELP[route.name].title}</Text>
              <Text style={styles.helpCardText}>{ROOM_HELP[route.name].body}</Text>
              <Pressable onPress={() => setShowHelp(false)} style={styles.helpCardBtn}>
                <Text style={styles.helpCardBtnText}>Entendi!</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Capy composta por camadas */}
        <View style={styles.spriteArea}>
          <View
            ref={spriteContainerRef}
            style={styles.spriteContainer}
            onLayout={() => {
              spriteContainerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
                setMouthCenter({
                  x: pageX + face.mouthLeft + face.mouthW / 2,
                  y: pageY + face.mouthTop + face.mouthH / 2,
                });
              });
            }}
            {...cleaningPanResponder.panHandlers}
          >
            <Image
              resizeMode="contain"
              source={getBodySprite(mood, route.name)}
              style={styles.spriteBase}
            />
            <Image
              resizeMode="contain"
              source={!status.lightOn ? capyEyes.closed : eatingPhase === "eating" ? capyEyes.closed : getEyeSprite(mood)}
              style={[styles.absoluteLayer, { top: face.eyeTop, left: face.eyeLeft, width: face.eyeW, height: face.eyeH }]}
            />
            <Image
              resizeMode="contain"
              source={
                !status.lightOn ? capyMouth.faceTired
                : eatingPhase === "eating" ? capyMouth.uau
                : eatingPhase === "happy"  ? capyMouth.veryHappy
                : getMouthSprite(mood)
              }
              style={[styles.absoluteLayer, { top: face.mouthTop, left: face.mouthLeft, width: face.mouthW, height: face.mouthH }]}
            />
            <DirtLayer
              visibleDirtIds={visibleDirtIds}
            />
            <AccessoryLayer accessoryId={status.equippedAccessory} />
            {!status.lightOn && route.name === "Bedroom" ? <SleepBubbles /> : null}
            {isCleaning && route.name === "Bathroom" ? (
              <BathSponge position={spongePosition} />
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
          <Pressable
            accessibilityLabel={barConfig.left.label}
            accessibilityRole="button"
            onPress={route.name === "Garden" ? () => navigation.navigate("MiniGames") : undefined}
            style={({ pressed }) => [styles.barSlot, pressed && route.name === "Garden" && styles.pressed, route.name === "Kitchen" && { marginRight: 40 }]}
          >
            {barConfig.left.image ? (
              <View style={styles.centerActionIcon}>
                <Image source={barConfig.left.image} style={styles.centerActionIconAbsolute} resizeMode="contain" />
              </View>
            ) : (
              <>
                <MaterialCommunityIcons color="#8A5428" name={barConfig.left.iconName} size={44} />
                <Text style={styles.barLabel}>{barConfig.left.label}</Text>
              </>
            )}
          </Pressable>

          {route.name === "Kitchen" ? (
            <View style={[styles.barSlot, styles.barSlotCenter, { marginTop: -5, marginRight: 30 }]}>
              <KitchenFood
                mouthCenterX={mouthCenter.x}
                mouthCenterY={mouthCenter.y}
                onEat={handleEat}
              />
            </View>
          ) : (
          <Pressable
            accessibilityLabel={config.actionLabel}
            accessibilityRole="button"
            onPress={handleCareAction}
            style={({ pressed }) => [styles.barSlot, styles.barSlotCenter, pressed ? styles.pressed : undefined]}
          >
            {barConfig.center.hasArrows ? (
              <View style={styles.selectorRow}>
                <MaterialCommunityIcons color="#C49A52" name="chevron-left" size={26} />
                <MaterialCommunityIcons color="#5D351C" name={barConfig.center.iconName} size={44} />
                <MaterialCommunityIcons color="#C49A52" name="chevron-right" size={26} />
              </View>
            ) : route.name === "Bedroom" ? (
              <View style={styles.centerActionIcon}>
                <Image source={lampAssets.red} style={styles.centerActionIconAbsolute} resizeMode="contain" />
                <Image
                  source={status.lightOn ? lampAssets.on : lampAssets.off}
                  style={styles.centerActionIconAbsolute}
                  resizeMode="contain"
                />
              </View>
            ) : barConfig.center.image ? (
              <View style={styles.centerActionIcon}>
                {barConfig.center.backgroundImage ? (
                  <Image source={barConfig.center.backgroundImage} style={styles.centerActionIconAbsolute} resizeMode="contain" />
                ) : null}
                <Image
                  source={barConfig.center.image}
                  style={styles.centerActionIconInner}
                  resizeMode="contain"
                />
              </View>
            ) : route.name === "Garden" ? null : (
              <MaterialCommunityIcons color="#5D351C" name={barConfig.center.iconName} size={44} />
            )}
            {barConfig.center.image || route.name === "Bedroom" || route.name === "Garden" ? null : <Text style={styles.barLabel}>{barConfig.center.label}</Text>}
          </Pressable>
          )}

          {route.name !== "Kitchen" && (
            <Pressable
              accessibilityLabel="Loja"
              accessibilityRole="button"
              onPress={() => navigation.navigate("Shop")}
              style={({ pressed }) => [styles.barSlot, pressed && styles.pressed]}
            >
              <Image source={shopAssets.shop} style={styles.shopIcon} resizeMode="contain" />
            </Pressable>
          )}
        </View>

      </SafeAreaView>
      {route.name === "Garden" ? (
        <GardenBall onPlay={handlePlay} />
      ) : null}
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

function DirtLayer({
  visibleDirtIds
}: {
  visibleDirtIds: DirtSpotId[];
}) {
  if (visibleDirtIds.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={styles.dirtLayer}>
      {dirtSpots
        .filter((spot) => visibleDirtIds.includes(spot.id))
        .map((spot) => (
          <View
            key={spot.id}
            style={[
              styles.dirtSpot,
              {
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                transform: [{ rotate: spot.rotate }]
              }
            ]}
          >
            <Image
              resizeMode="cover"
              source={overlayAssets.dirtSplats}
              style={styles.dirtImage}
            />
          </View>
        ))}
    </View>
  );
}

function BathSponge({ position }: { position: { x: number; y: number } }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08]
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sponge,
        {
          top: position.y,
          left: position.x,
          transform: [{ rotate: "-12deg" }, { scale }]
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
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 30, 0.55)"
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
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 12
  },
  helpNavBtn: {
    position: "absolute",
    right: 0,
    top: -4,
    padding: 4,
    zIndex: 20,
  },
  helpIcon: {
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 12,
  },
  helpNavIcon: {
    width: 34,
    height: 34,
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  helpCard: {
    backgroundColor: "#FFF8E7",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#C49A52",
    padding: 28,
    marginHorizontal: 32,
    alignItems: "center",
    gap: 16,
  },
  helpCardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#5D351C",
    textAlign: "center",
  },
  helpCardText: {
    fontSize: 18,
    color: "#5D351C",
    textAlign: "center",
    lineHeight: 26,
  },
  helpCardBold: {
    fontWeight: "900",
  },
  helpCardBtn: {
    backgroundColor: "#8BBB31",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  helpCardBtnText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
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
    paddingBottom: 14,
    backgroundColor: "transparent",
    marginBottom: 10
  },
  barSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    gap: 4
  },
  barSlotCenter: {
    flex: 1.4
  },
  barLabel: {
    color: "#5D351C",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase"
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  shopIcon: {
    width: 80,
    height: 80
  },
  centerActionIcon: {
    width: 80,
    height: 80
  },
  centerActionIconAbsolute: {
    position: "absolute",
    width: 80,
    height: 80
  },
  centerActionIconInner: {
    position: "absolute",
    width: 60,
    height: 60,
    top: 10,
    left: 10
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
  dirtLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT,
    zIndex: 4
  },
  dirtSpot: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 999
  },
  dirtImage: {
    width: "100%",
    height: "100%",
    opacity: 0.88
  },
  sponge: {
    position: "absolute",
    zIndex: 12,
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
