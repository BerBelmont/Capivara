import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type StatusBarProps = {
  label: string;
  value: number;
  icon?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  color?: string;
};

export function StatusBar({
  label,
  value,
  icon,
  iconName,
  iconColor = "#7CAD32",
  color = "#7CAD32"
}: StatusBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          {iconName ? (
            <MaterialCommunityIcons
              color={iconColor}
              name={iconName}
              size={20}
              style={styles.vectorIcon}
            />
          ) : icon ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : null}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5
  },
  labelGroup: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 94
  },
  icon: {
    width: 24,
    fontSize: 18,
    marginRight: 5
  },
  vectorIcon: {
    width: 24,
    marginRight: 5
  },
  label: {
    color: "#50321B",
    fontSize: 14,
    fontWeight: "800"
  },
  value: {
    color: "#5F4326",
    fontSize: 12,
    fontWeight: "800"
  },
  track: {
    height: 14,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#E7D7B7",
    borderWidth: 1,
    borderColor: "#9B7040"
  },
  fill: {
    height: "100%",
    borderRadius: 10
  }
});
