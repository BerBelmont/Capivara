import { Image, StyleSheet, Text, View } from "react-native";
import { coinAssets } from "../assets/capySprites";

type TopBarProps = {
  coins: number;
};

export function TopBar({ coins }: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.coinPill}>
        <Image source={coinAssets.coin} style={styles.coinIcon} resizeMode="contain" />
        <Text style={styles.coinText}>{coins}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8
  },
  coinIcon: {
    width: 26,
    height: 26,
  },
  coinPill: {
    height: 42,
    minWidth: 82,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 22,
    backgroundColor: "#FFF5D9",
    borderWidth: 2,
    borderColor: "#A96325",
    paddingLeft: 7,
    paddingRight: 12
  },
  coinText: {
    color: "#4E2D17",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 4
  },
  pressed: {
    opacity: 0.75
  }
});
