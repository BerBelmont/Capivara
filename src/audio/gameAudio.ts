import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

import { audioAssets } from "../assets/capySprites";

type AmbientTrack = "leisure" | "sleep" | "minigame";
type SoundEffect = "eat" | "coin";

const ambientSources: Record<AmbientTrack, number> = {
  leisure: audioAssets.leisureAmbient,
  sleep: audioAssets.sleepAmbient,
  minigame: audioAssets.minigameAmbient,
};

const effectSources: Record<SoundEffect, number> = {
  eat: audioAssets.eatBite,
  coin: audioAssets.coinReward,
};

type AudioPlayer = ReturnType<typeof createAudioPlayer>;

let audioModeReady = false;
let currentAmbient: AmbientTrack | null = null;
let ambientPlayer: AudioPlayer | null = null;
const effectPlayers: Partial<Record<SoundEffect, AudioPlayer>> = {};

async function ensureAudioMode() {
  if (audioModeReady) return;

  audioModeReady = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
  } catch {
    audioModeReady = false;
  }
}

function safelyStop(player: AudioPlayer | null) {
  if (!player) return;

  try {
    player.pause();
    void player.seekTo(0);
  } catch {
    // Audio can fail silently on web before the first user gesture.
  }
}

export async function playAmbient(track: AmbientTrack) {
  await ensureAudioMode();

  if (currentAmbient === track && ambientPlayer) {
    try {
      if (!ambientPlayer.playing) ambientPlayer.play();
    } catch {
      // Keep gameplay resilient if the platform blocks autoplay.
    }
    return;
  }

  safelyStop(ambientPlayer);
  try {
    ambientPlayer?.remove();
  } catch {
    // Ignore cleanup failures from already released native objects.
  }

  currentAmbient = track;
  ambientPlayer = createAudioPlayer(ambientSources[track], {
    keepAudioSessionActive: true,
  });
  ambientPlayer.loop = true;
  ambientPlayer.volume = track === "minigame" ? 0.22 : track === "sleep" ? 0.2 : 0.18;

  try {
    ambientPlayer.play();
  } catch {
    // Browsers may require a touch before starting audio.
  }
}

export function stopAmbient() {
  currentAmbient = null;
  safelyStop(ambientPlayer);
}

export async function playSoundEffect(effect: SoundEffect) {
  await ensureAudioMode();

  try {
    const player = effectPlayers[effect] ?? createAudioPlayer(effectSources[effect], {
      keepAudioSessionActive: true,
    });
    effectPlayers[effect] = player;
    player.volume = effect === "coin" ? 0.55 : 0.45;
    void player.seekTo(0);
    player.play();

    if (ambientPlayer && !ambientPlayer.playing) {
      ambientPlayer.play();
    }
  } catch {
    // Effects are optional feedback; never block the game flow.
  }
}
