import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";

import { CatchFoodGameScreen } from "./src/screens/CatchFoodGameScreen";
import { MemoryGameScreen } from "./src/screens/MemoryGameScreen";
import { MiniGamesScreen } from "./src/screens/MiniGamesScreen";
import { RoomScreen } from "./src/screens/RoomScreen";
import { ShopScreen } from "./src/screens/ShopScreen";
import { loadLastRoom } from "./src/storage/gameStorage";
import { RoomName, RootStackParamList } from "./src/types/game";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<RoomName>("Kitchen");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadLastRoom().then((room) => {
      if (room) setInitialRoute(room);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const nav = (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8F3E8" }
        }}
      >
        <Stack.Screen name="MiniGames" component={MiniGamesScreen} />
        <Stack.Screen name="CatchFoodGame" component={CatchFoodGameScreen} />
        <Stack.Screen name="MemoryGame" component={MemoryGameScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="Kitchen" component={RoomScreen} />
        <Stack.Screen name="Bathroom" component={RoomScreen} />
        <Stack.Screen name="Garden" component={RoomScreen} />
        <Stack.Screen name="Bedroom" component={RoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  if (Platform.OS !== "web") return nav;

  return (
    <View style={styles.webOuter}>
      <View style={styles.webPhone}>{nav}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  webPhone: {
    width: 390,
    height: 844,
    overflow: "hidden",
    borderRadius: 44,
  },
});
