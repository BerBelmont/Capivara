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
        <MaterialCommunityIcons color="#2E2118" name="glasses" size={58} />
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
        <MaterialCommunityIcons color="#65A83E" name="leaf" size={34} />
        <MaterialCommunityIcons color="#8FCB52" name="leaf" size={30} />
        <MaterialCommunityIcons color="#4E8E2D" name="leaf" size={34} />
      </View>
    );
  }

  if (accessory.id === "headphones") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.headphones]}>
        <MaterialCommunityIcons color="#333333" name="headphones" size={78} />
      </View>
    );
  }

  if (accessory.id === "floatRing") {
    return (
      <View pointerEvents="none" style={[styles.layer, styles.floatRing]}>
        <MaterialCommunityIcons color="#E86C78" name="lifebuoy" size={92} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[styles.layer, styles.strawHat]}>
      <MaterialCommunityIcons color="#C98B42" name="hat-fedora" size={82} />
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
    top: 24,
    left: 70,
    width: 82,
    height: 56,
    transform: [{ rotate: "-7deg" }]
  },
  strawHat: {
    top: 18,
    left: 58,
    width: 104,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }]
  },
  glasses: {
    top: 64,
    left: 72,
    width: 76,
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  scarf: {
    top: 138,
    left: 62,
    width: 98,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "8deg" }]
  },
  scarfWrap: {
    width: 76,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#4E9A35",
    borderWidth: 3,
    borderColor: "#2E6F22"
  },
  scarfTail: {
    position: "absolute",
    right: 10,
    top: 28,
    width: 18,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#5FB33F",
    borderWidth: 3,
    borderColor: "#2E6F22"
  },
  leafTiara: {
    top: 42,
    left: 70,
    width: 82,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    transform: [{ rotate: "-4deg" }]
  },
  headphones: {
    top: 48,
    left: 70,
    width: 82,
    height: 88,
    alignItems: "center",
    justifyContent: "center"
  },
  floatRing: {
    top: 188,
    left: 63,
    width: 98,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "5deg" }]
  }
});
