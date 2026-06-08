import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type BottomNavItem = {
  label: string;
  icon: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  active?: boolean;
  onPress: () => void;
};

type BottomNavProps = {
  items: BottomNavItem[];
};

export function BottomNav({ items }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={item.label}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            item.active && styles.activeItem,
            pressed && styles.pressed
          ]}
        >
          {item.iconName ? (
            <MaterialCommunityIcons
              color={item.iconColor ?? "#875326"}
              name={item.iconName}
              size={24}
            />
          ) : (
            <Text style={styles.icon}>{item.icon}</Text>
          )}
          <Text style={[styles.label, item.active && styles.activeLabel]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 22,
    backgroundColor: "#FFF8E8",
    borderWidth: 2,
    borderColor: "#CF8732",
    paddingHorizontal: 7,
    paddingVertical: 6,
    shadowColor: "#6D4322",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5
  },
  item: {
    width: 62,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16
  },
  activeItem: {
    backgroundColor: "#DDF4B9"
  },
  pressed: {
    opacity: 0.72
  },
  icon: {
    fontSize: 23,
    lineHeight: 26
  },
  label: {
    color: "#5B351A",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center"
  },
  activeLabel: {
    color: "#47751F"
  }
});
