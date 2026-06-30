import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { foodAssets, navArrows } from "../assets/capySprites";

const FOOD_SIZE = 90;
const EAT_RADIUS = 65;

type Props = {
  mouthCenterX: number;
  mouthCenterY: number;
  onEat: () => void;
};

export function KitchenFood({ mouthCenterX, mouthCenterY, onEat }: Props) {
  const [foodIndex, setFoodIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const pan = useRef(new Animated.ValueXY()).current;
  const mouthXRef = useRef(mouthCenterX);
  const mouthYRef = useRef(mouthCenterY);
  const onEatRef = useRef(onEat);

  useEffect(() => { mouthXRef.current = mouthCenterX; }, [mouthCenterX]);
  useEffect(() => { mouthYRef.current = mouthCenterY; }, [mouthCenterY]);
  useEffect(() => { onEatRef.current = onEat; }, [onEat]);

  const food = foodAssets[foodIndex];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        const dist = Math.hypot(gs.moveX - mouthXRef.current, gs.moveY - mouthYRef.current);
        if (dist < EAT_RADIUS) {
          onEatRef.current();
          setVisible(false);
          pan.setValue({ x: 0, y: 0 });
          setTimeout(() => setVisible(true), 1400);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  function prev() {
    setFoodIndex((i) => (i - 1 + foodAssets.length) % foodAssets.length);
  }

  function next() {
    setFoodIndex((i) => (i + 1) % foodAssets.length);
  }

  return (
    <View style={styles.container}>
      <View style={styles.carousel}>
        <Pressable onPress={prev} style={styles.arrow} disabled={!visible}>
          <Image source={navArrows.previous} style={styles.arrowImage} resizeMode="contain" />
        </Pressable>

        <Animated.View
          style={[styles.foodWrapper, { transform: pan.getTranslateTransform(), opacity: visible ? 1 : 0 }]}
          {...(visible ? panResponder.panHandlers : {})}
        >
          <Image source={food.image} style={styles.foodImage} resizeMode="contain" />
        </Animated.View>

        <Pressable onPress={next} style={styles.arrow} disabled={!visible}>
          <Image source={navArrows.next} style={styles.arrowImage} resizeMode="contain" />
        </Pressable>
      </View>

      <Text style={styles.foodName}>{food.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  arrow: {
    padding: 4,
  },
  arrowImage: {
    width: 44,
    height: 44,
  },
  foodWrapper: {
    width: FOOD_SIZE,
    height: FOOD_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  foodImage: {
    width: FOOD_SIZE,
    height: FOOD_SIZE,
  },
  foodName: {
    marginTop: -16,
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 12,
  },
});
