import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: "primary" | "secondary" | "soft";
};

export function ActionButton({
  label,
  onPress,
  icon,
  variant = "primary"
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "soft" && styles.softButton,
        pressed && styles.pressed
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconCircle,
            variant !== "primary" && styles.secondaryIconCircle
          ]}
        >
          <Text
            style={[
              styles.icon,
              variant !== "primary" && styles.secondaryIcon
            ]}
          >
            {icon}
          </Text>
        </View>
      ) : null}
      <Text
        style={[
          styles.label,
          variant !== "primary" && styles.secondaryLabel
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 66,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 22,
    backgroundColor: "#6BB52F",
    borderWidth: 3,
    borderColor: "#3F7D1F",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginVertical: 7,
    shadowColor: "#5F3B1D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 5
  },
  secondaryButton: {
    backgroundColor: "#FFC857",
    borderColor: "#A05A22"
  },
  softButton: {
    backgroundColor: "#FFF1D1",
    borderColor: "#C98B42",
    shadowOpacity: 0.12
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    marginRight: 14
  },
  secondaryIconCircle: {
    backgroundColor: "#FFF6E4"
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800"
  },
  secondaryIcon: {
    color: "#7A431D"
  },
  pressed: {
    opacity: 0.75
  },
  label: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryLabel: {
    color: "#3F3423"
  }
});
