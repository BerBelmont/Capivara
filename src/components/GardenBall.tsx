import { useRef } from "react";
import { Animated, Dimensions, Image, PanResponder, StyleSheet, View } from "react-native";
import { ballAssets } from "../assets/capySprites";

const BALL_SIZE = 55;
const FRICTION = 0.96;
const BOUNCE_DAMPING = 0.65;
const MIN_SPEED = 0.3;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const GAME_TOP = 150;
const GAME_BOTTOM = SCREEN_H - 160;

type Props = {
  onPlay: () => void;
};

export function GardenBall({ onPlay }: Props) {
  const startX = SCREEN_W / 2 - BALL_SIZE / 2;
  const startY = GAME_BOTTOM - BALL_SIZE + 120;

  const posRef  = useRef({ x: startX, y: startY });
  const velRef  = useRef({ x: 0, y: 0 });
  const rotRef  = useRef(0);
  const flyInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const prevTouch = useRef({ x: 0, y: 0, t: 0 });
  const lastTouch = useRef({ x: 0, y: 0, t: 0 });
  const lastHappinessRef = useRef(0);

  const pos       = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const rotAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function stopFlying() {
    if (flyInterval.current) {
      clearInterval(flyInterval.current);
      flyInterval.current = null;
    }
  }

  function squash() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 70,  useNativeDriver: false }),
      Animated.timing(scaleAnim, { toValue: 1,   duration: 110, useNativeDriver: false }),
    ]).start();
  }

  function startFlying(vx: number, vy: number) {
    stopFlying();
    velRef.current = { x: vx, y: vy };

    flyInterval.current = setInterval(() => {
      let { x, y } = posRef.current;
      let { x: dvx, y: dvy } = velRef.current;

      x += dvx;
      y += dvy;

      let bounced = false;
      if (x <= 0) { x = 0; dvx = Math.abs(dvx) * BOUNCE_DAMPING; bounced = true; }
      else if (x >= SCREEN_W - BALL_SIZE) { x = SCREEN_W - BALL_SIZE; dvx = -Math.abs(dvx) * BOUNCE_DAMPING; bounced = true; }
      if (y <= GAME_TOP) { y = GAME_TOP; dvy = Math.abs(dvy) * BOUNCE_DAMPING; bounced = true; }
      else if (y >= GAME_BOTTOM - BALL_SIZE) { y = GAME_BOTTOM - BALL_SIZE; dvy = -Math.abs(dvy) * BOUNCE_DAMPING; bounced = true; }

      if (bounced) squash();

      dvx *= FRICTION;
      dvy *= FRICTION;

      rotRef.current = ((rotRef.current + dvx * 0.8) % 360 + 360) % 360;
      rotAnim.setValue(rotRef.current);

      posRef.current = { x, y };
      velRef.current = { x: dvx, y: dvy };
      pos.setValue({ x, y });

      if (Math.abs(dvx) < MIN_SPEED && Math.abs(dvy) < MIN_SPEED) {
        stopFlying();
      } else {
        const now = Date.now();
        if (now - lastHappinessRef.current > 1000) {
          lastHappinessRef.current = now;
          onPlay();
        }
      }
    }, 16);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        stopFlying();
        const now = Date.now();
        prevTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, t: now };
        lastTouch.current = prevTouch.current;
      },
      onPanResponderMove: (e, gs) => {
        pos.setValue({ x: posRef.current.x + gs.dx, y: posRef.current.y + gs.dy });
        prevTouch.current = lastTouch.current;
        lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, t: Date.now() };
      },
      onPanResponderRelease: (_, gs) => {
        posRef.current = {
          x: posRef.current.x + gs.dx,
          y: posRef.current.y + gs.dy,
        };

        const dt = Math.max(1, lastTouch.current.t - prevTouch.current.t);
        const vx = ((lastTouch.current.x - prevTouch.current.x) / dt) * 16;
        const vy = ((lastTouch.current.y - prevTouch.current.y) / dt) * 16;

        if (Math.hypot(vx, vy) > 0.5) {
          onPlay();
          startFlying(vx, vy);
        }
      },
    })
  ).current;

  const rotateDeg = rotAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.ball,
          {
            left: pos.x,
            top: pos.y,
            transform: [{ rotate: rotateDeg }, { scale: scaleAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image source={ballAssets.red} style={styles.ballImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 20,
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
  },
  ballImage: {
    width: BALL_SIZE,
    height: BALL_SIZE,
  },
});
