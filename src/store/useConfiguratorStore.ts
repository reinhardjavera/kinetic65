import { create } from "zustand";

export type ChassisColor =
  | "anodized-silver"
  | "matte-obsidian"
  | "industrial-cream"
  | "olive-drab";

export type KeycapTheme = "monochrome" | "dolch" | "botanical";

export type SwitchType = "linear" | "tactile" | "clicky";

export type LedMode = "off" | "warm-white" | "amber" | "cyber-red";

export interface ConfiguratorState {
  chassisColor: ChassisColor;
  keycapTheme: KeycapTheme;
  switchType: SwitchType;
  ledMode: LedMode;
  audioEnabled: boolean;
  activeKeys: string[];
  scrollProgress: number; // 0 (assembled) -> 1 (fully exploded)

  setChassisColor: (color: ChassisColor) => void;
  setKeycapTheme: (theme: KeycapTheme) => void;
  setSwitchType: (switchType: SwitchType) => void;
  setLedMode: (mode: LedMode) => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  pressKey: (code: string) => void;
  releaseKey: (code: string) => void;
  setScrollProgress: (progress: number) => void;
}

export const CHASSIS_FINISHES: Record<
  ChassisColor,
  { name: string; hex: string; metalness: number; roughness: number; desc: string }
> = {
  "anodized-silver": {
    name: "ANODIZED RAW SILVER",
    hex: "#C8C8C4",
    metalness: 0.85,
    roughness: 0.25,
    desc: "Bead-blasted 6063 Aluminum with clear anodization",
  },
  "matte-obsidian": {
    name: "MATTE OBSIDIAN",
    hex: "#1E1E1E",
    metalness: 0.2,
    roughness: 0.52,
    desc: "Deep carbon black with microscopic surface texture",
  },
  "industrial-cream": {
    name: "INDUSTRIAL CREAM",
    hex: "#E8E2D5",
    metalness: 0.12,
    roughness: 0.42,
    desc: "1980s laboratory instrumentation baked enamel finish",
  },
  "olive-drab": {
    name: "OLIVE DRAB",
    hex: "#444C3F",
    metalness: 0.25,
    roughness: 0.48,
    desc: "Mil-spec powder coat with low specularity",
  },
};

export const KEYCAP_THEMES: Record<
  KeycapTheme,
  {
    name: string;
    alphaColor: string;
    modColor: string;
    accentColor: string;
    legendAlpha: string;
    legendMod: string;
    desc: string;
  }
> = {
  monochrome: {
    name: "MONOCHROME INDUSTRIAL",
    alphaColor: "#F2F2EE",
    modColor: "#262624",
    accentColor: "#FF4D00",
    legendAlpha: "#141413",
    legendMod: "#EAEAE6",
    desc: "High contrast warm alabaster, dark carbon, and safety orange accents",
  },
  dolch: {
    name: "DOLCH RETRO",
    alphaColor: "#8E8D88",
    modColor: "#343332",
    accentColor: "#D03B29",
    legendAlpha: "#FFFFFF",
    legendMod: "#D03B29",
    desc: "Classic 1980s workstation palette with terracotta highlights",
  },
  botanical: {
    name: "BOTANICAL FIELD",
    alphaColor: "#EAEFE7",
    modColor: "#2C3D34",
    accentColor: "#749377",
    legendAlpha: "#2C3D34",
    legendMod: "#EAEFE7",
    desc: "Deep forest evergreen modifiers with herbaceous sage accents",
  },
};

export const SWITCH_SPECS: Record<
  SwitchType,
  {
    name: string;
    stemColor: string;
    actuationForce: string;
    travelDistance: string;
    soundProfile: string;
  }
> = {
  linear: {
    name: "KINETIC RED // LINEAR",
    stemColor: "#E53935",
    actuationForce: "45g",
    travelDistance: "3.8mm",
    soundProfile: "Deep Thock",
  },
  tactile: {
    name: "KINETIC BROWN // TACTILE",
    stemColor: "#8D5B4C",
    actuationForce: "55g",
    travelDistance: "3.6mm",
    soundProfile: "Crisp Mid Pop",
  },
  clicky: {
    name: "KINETIC BLUE // CLICKY",
    stemColor: "#1E88E5",
    actuationForce: "60g",
    travelDistance: "4.0mm",
    soundProfile: "Transient Snap",
  },
};

export const LED_CONFIGS: Record<
  LedMode,
  { name: string; hex: string; intensity: number }
> = {
  off: { name: "OFF", hex: "#000000", intensity: 0 },
  "warm-white": { name: "3000K WARM WHITE", hex: "#FFE1B4", intensity: 1.4 },
  amber: { name: "LAB AMBER", hex: "#FF9800", intensity: 1.6 },
  "cyber-red": { name: "ALERT RED", hex: "#FF1744", intensity: 1.8 },
};

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  chassisColor: "anodized-silver",
  keycapTheme: "monochrome",
  switchType: "linear",
  ledMode: "warm-white",
  audioEnabled: true,
  activeKeys: [],
  scrollProgress: 0,

  setChassisColor: (chassisColor) => set({ chassisColor }),
  setKeycapTheme: (keycapTheme) => set({ keycapTheme }),
  setSwitchType: (switchType) => set({ switchType }),
  setLedMode: (ledMode) => set({ ledMode }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  pressKey: (code) =>
    set((state) => ({
      activeKeys: state.activeKeys.includes(code)
        ? state.activeKeys
        : [...state.activeKeys, code],
    })),
  releaseKey: (code) =>
    set((state) => ({
      activeKeys: state.activeKeys.filter((k) => k !== code),
    })),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
}));
