"use client";

import React from "react";
import {
  useConfiguratorStore,
  CHASSIS_FINISHES,
  KEYCAP_THEMES,
  SWITCH_SPECS,
  LED_CONFIGS,
  ChassisColor,
  KeycapTheme,
  SwitchType,
  LedMode,
} from "@/store/useConfiguratorStore";
import { Volume2, VolumeX, Layers, RotateCcw } from "lucide-react";

interface HudHeaderProps {
  cameraCoords: { x: number; y: number; z: number };
}

export const HudHeader: React.FC<HudHeaderProps> = ({ cameraCoords }) => {
  const {
    chassisColor,
    keycapTheme,
    switchType,
    ledMode,
    audioEnabled,
    activeKeys,
    scrollProgress,
    setChassisColor,
    setKeycapTheme,
    setSwitchType,
    setLedMode,
    toggleAudio,
    setScrollProgress,
  } = useConfiguratorStore();

  return (
    <header className="fixed top-0 left-0 w-full z-40 pointer-events-none select-none">
      {/* Primary Top Telemetry Bar */}
      <div className="w-full bg-bg-surface/90 backdrop-blur-md border-b-hairline pointer-events-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Left: Product Codename & Specification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent-safety inline-block" />
            <span className="font-display font-bold tracking-tight text-sm text-text-primary">
              KINETIC-65
            </span>
          </div>
          <span className="text-text-muted hidden sm:inline">//</span>
          <span className="text-text-muted hidden sm:inline">
            REV 2.4 // 68-KEY ANSI
          </span>
          <span className="text-text-muted hidden md:inline">//</span>
          <span className="text-text-muted hidden md:inline">
            CHERRY MX ARCHITECTURE
          </span>
        </div>

        {/* Middle: Real-time Telemetry (Camera & Active Key) */}
        <div className="flex items-center gap-4 text-[11px] tabular-nums text-text-muted">
          <div className="border-l-hairline border-r-hairline px-3 hidden lg:block">
            <span>CAM: [</span>
            <span className="text-text-primary font-medium">
              {cameraCoords.x.toFixed(1)}, {cameraCoords.y.toFixed(1)}, {cameraCoords.z.toFixed(1)}
            </span>
            <span>]</span>
          </div>

          <div className="border-r-hairline pr-3 hidden sm:block">
            <span>ACTIVE KEY: </span>
            <span className="text-accent-safety font-bold">
              {activeKeys.length > 0 ? `[${activeKeys[activeKeys.length - 1]}]` : "[IDLE]"}
            </span>
          </div>
        </div>

        {/* Right: Audio Toggle & Quick Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`px-2.5 py-1 flex items-center gap-1.5 border-hairline transition-colors text-[11px] font-medium ${
              audioEnabled
                ? "bg-bg-dark text-bg-primary hover:bg-black"
                : "bg-bg-surface text-text-muted hover:text-text-primary"
            }`}
            title="Toggle Procedural Audio Acoustics"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-accent-safety" />
                <span>AUDIO: SYNTH_ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>AUDIO: MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Fast Inspection Toolbar (Phase 1 Inspection Controls) */}
      <div className="w-full bg-bg-primary/85 backdrop-blur-sm border-b-hairline pointer-events-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        {/* Chassis Finishes */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-semibold uppercase">Case:</span>
          <div className="flex items-center gap-1">
            {(Object.keys(CHASSIS_FINISHES) as ChassisColor[]).map((key) => {
              const item = CHASSIS_FINISHES[key];
              const isSelected = chassisColor === key;
              return (
                <button
                  key={key}
                  onClick={() => setChassisColor(key)}
                  className={`px-2 py-0.5 border-hairline uppercase transition-all ${
                    isSelected
                      ? "bg-text-primary text-bg-primary font-bold border-text-primary"
                      : "bg-bg-surface text-text-muted hover:text-text-primary hover:border-text-primary"
                  }`}
                >
                  {item.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keycap Colorway */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-semibold uppercase">Keycaps:</span>
          <div className="flex items-center gap-1">
            {(Object.keys(KEYCAP_THEMES) as KeycapTheme[]).map((key) => {
              const item = KEYCAP_THEMES[key];
              const isSelected = keycapTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => setKeycapTheme(key)}
                  className={`px-2 py-0.5 border-hairline uppercase transition-all ${
                    isSelected
                      ? "bg-accent-safety text-white font-bold border-accent-safety"
                      : "bg-bg-surface text-text-muted hover:text-text-primary hover:border-text-primary"
                  }`}
                >
                  {item.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Switches */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-semibold uppercase">Switch:</span>
          <div className="flex items-center gap-1">
            {(Object.keys(SWITCH_SPECS) as SwitchType[]).map((key) => {
              const item = SWITCH_SPECS[key];
              const isSelected = switchType === key;
              return (
                <button
                  key={key}
                  onClick={() => setSwitchType(key)}
                  className={`px-2 py-0.5 border-hairline uppercase transition-all ${
                    isSelected
                      ? "bg-text-primary text-bg-primary font-bold border-text-primary"
                      : "bg-bg-surface text-text-muted hover:text-text-primary hover:border-text-primary"
                  }`}
                >
                  {item.name.split("//")[1]?.trim() || key}
                </button>
              );
            })}
          </div>
        </div>

        {/* LED Mode */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-semibold uppercase">LED:</span>
          <div className="flex items-center gap-1">
            {(Object.keys(LED_CONFIGS) as LedMode[]).map((key) => {
              const isSelected = ledMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setLedMode(key)}
                  className={`px-2 py-0.5 border-hairline uppercase transition-all ${
                    isSelected
                      ? "bg-text-primary text-bg-primary font-bold border-text-primary"
                      : "bg-bg-surface text-text-muted hover:text-text-primary hover:border-text-primary"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exploded Separation Preview Slider (Pre-Phase 2 Verification) */}
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-accent-safety" />
          <span className="text-text-muted font-semibold uppercase">Explode:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scrollProgress}
            onChange={(e) => setScrollProgress(parseFloat(e.target.value))}
            className="w-20 h-1 accent-accent-safety cursor-pointer"
          />
          <span className="w-9 tabular-nums text-text-primary font-medium">
            {(scrollProgress * 100).toFixed(0)}%
          </span>
          {scrollProgress > 0 && (
            <button
              onClick={() => setScrollProgress(0)}
              className="p-1 border-hairline text-text-muted hover:text-text-primary hover:bg-bg-surface"
              title="Reset Assembly"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
