"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { HudHeader } from "@/components/ui/HudHeader";

// Dynamically import Three.js canvas to avoid SSR hydration mismatches
const KeyboardCanvas = dynamic(
  () =>
    import("@/components/canvas/KeyboardCanvas").then(
      (mod) => mod.KeyboardCanvas
    ),
  { ssr: false }
);

export default function HomePage() {
  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 6.5, z: 7.5 });

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary text-text-primary select-none">
      {/* Swiss Grid HUD Header */}
      <HudHeader cameraCoords={cameraCoords} />

      {/* 3D Viewport */}
      <div className="w-full h-full pt-20">
        <KeyboardCanvas onCameraMove={setCameraCoords} />
      </div>

      {/* Technical Telemetry Bottom Footer Strip */}
      <footer className="fixed bottom-0 left-0 w-full z-30 pointer-events-none px-4 py-2 border-t-hairline bg-bg-surface/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-text-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-accent-safety inline-block animate-pulse" />
            <span className="font-semibold text-text-primary">
              65% GASKET-MOUNTED ARCHITECTURE
            </span>
          </div>
          <span className="hidden sm:inline">//</span>
          <span className="hidden sm:inline">
            WEIGHT: 1,640G // ANGLE: 6.5°
          </span>
          <span className="hidden md:inline">//</span>
          <span className="hidden md:inline">
            100% PROCEDURAL SHADERS & MESHES
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-wider uppercase text-text-muted hidden lg:inline">
            [L-CLICK]: TYPE KEY // [DRAG]: ORBIT // [SCROLL]: ZOOM
          </span>
          <span className="border-l-hairline pl-3 font-bold text-text-primary">
            PHASE 1 // POLISHED
          </span>
        </div>
      </footer>
    </main>
  );
}
