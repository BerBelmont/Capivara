import { Image, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getAccessoryById } from "../data/accessories";
import { AccessoryId } from "../types/game";

type AccessoryLayerProps = {
  accessoryId: AccessoryId | null;
};

export function AccessoryLayer({ accessoryId }: AccessoryLayerProps) {
  const accessory = getAccessoryById(accessoryId);
  if (!accessory) return null;

  if (accessory.image) {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.beretImage]}>
        <Image
          resizeMode="contain"
          source={accessory.image}
          style={styles.fullImage}
        />
      </View>
    );
  }

  if (accessory.id === "roundGlasses") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.glasses]}>
        <MaterialCommunityIcons color="#2E2118" name="glasses" size={36} />
      </View>
    );
  }

  if (accessory.id === "greenScarf") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.scarf]}>
        <View style={styles.scarfWrap} />
        <View style={styles.scarfTail} />
      </View>
    );
  }

  if (accessory.id === "leafTiara") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.leafTiara]}>
        <MaterialCommunityIcons color="#65A83E" name="leaf" size={22} />
        <MaterialCommunityIcons color="#8FCB52" name="leaf" size={20} />
        <MaterialCommunityIcons color="#4E8E2D" name="leaf" size={22} />
      </View>
    );
  }

  if (accessory.id === "headphones") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.headphones]}>
        <MaterialCommunityIcons color="#333333" name="headphones" size={52} />
      </View>
    );
  }

  if (accessory.id === "floatRing") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.floatRing]}>
        <MaterialCommunityIcons color="#E86C78" name="lifebuoy" size={64} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[styles.layer, styles.strawHat]}>
      <MaterialCommunityIcons color="#C98B42" name="hat-fedora" size={56} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    zIndex: 5
  },
  fullImage: {
    width: "100%",
    height: "100%"
  },
  beretImage: {
    top: 28,
    left: 72,
    width: 72,
    height: 48,
    transform: [{ rotate: "-7deg" }]
  },
  strawHat: {
    top: 22,
    left: 62,
    width: 88,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }]
  },
  glasses: {
    top: 76,
    left: 62,
    width: 90,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  scarf: {
    top: 148,
    left: 66,
    width: 88,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "8deg" }]
  },
  scarfWrap: {
    width: 68,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#4E9A35",
    borderWidth: 2,
    borderColor: "#2E6F22"
  },
  scarfTail: {
    position: "absolute",
    right: 10,
    top: 22,
    width: 14,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#5FB33F",
    borderWidth: 2,
    borderColor: "#2E6F22"
  },
  leafTiara: {
    top: 48,
    left: 72,
    width: 76,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    transform: [{ rotate: "-4deg" }]
  },
  headphones: {
    top: 52,
    left: 66,
    width: 80,
    height: 64,
    alignItems: "center",
    justifyContent: "center"
  },
  floatRing: {
    top: 200,
    left: 68,
    width: 86,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "5deg" }]
  }
});
