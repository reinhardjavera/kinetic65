"use client";

import React, { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { KeyboardAssembly } from "./KeyboardAssembly";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

interface KeyboardCanvasProps {
  onCameraMove?: (coords: { x: number; y: number; z: number }) => void;
}

export const KeyboardCanvas: React.FC<KeyboardCanvasProps> = ({
  onCameraMove,
}) => {
  const { pressKey, releaseKey } = useConfiguratorStore();

  // Listen to physical keyboard events to trigger 3D key animations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      pressKey(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      releaseKey(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressKey, releaseKey]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 6.5, 7.5], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ camera }) => {
          if (onCameraMove) {
            onCameraMove({
              x: Number(camera.position.x.toFixed(2)),
              y: Number(camera.position.y.toFixed(2)),
              z: Number(camera.position.z.toFixed(2)),
            });
          }
        }}
      >
        {/* Soft Ambient Fill */}
        <ambientLight intensity={0.65} color="#F7F7F4" />

        {/* Studio Key Light (Directional Light with Anti-Acne Biases) */}
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
          shadow-camera-near={1}
          shadow-camera-far={45}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Fill Light for subtle contrast softening */}
        <directionalLight
          position={[-10, 10, -6]}
          intensity={0.5}
          color="#E6ECF2"
        />

        {/* 100% Procedural Studio Lightformer Environment (Zero External HDR) */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 4, -0.4, 0]}>
            {/* Large Overhead Softbox */}
            <Lightformer
              form="rect"
              intensity={2.8}
              position={[0, 12, 0]}
              scale={[20, 14, 1]}
              target={[0, 0, 0]}
            />
            {/* Key Side Softbox */}
            <Lightformer
              form="rect"
              intensity={1.8}
              position={[14, 4, 8]}
              scale={[14, 8, 1]}
              color="#FFFFFF"
            />
            {/* Rim Highlight Lightformer */}
            <Lightformer
              form="ring"
              intensity={2.2}
              position={[-12, 6, -8]}
              scale={[10, 10, 1]}
              color="#EEF4FA"
            />
            {/* Ground bounce illumination */}
            <Lightformer
              form="rect"
              intensity={0.9}
              position={[0, -6, 0]}
              scale={[24, 12, 1]}
              color="#E6E6E3"
            />
          </group>
        </Environment>

        {/* Soft Contact Shadows beneath the Keyboard */}
        <ContactShadows
          position={[0, -0.9, 0]}
          opacity={0.4}
          scale={26}
          blur={2.2}
          far={4.5}
          resolution={512}
          color="#000000"
        />

        {/* Main Keyboard 3D Assembly */}
        <Suspense fallback={null}>
          <KeyboardAssembly />
        </Suspense>

        {/* OrbitControls for Inspection */}
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
          minDistance={4}
          maxDistance={28}
          maxPolarAngle={Math.PI / 2 + 0.05}
          onChange={(e) => {
            if (onCameraMove && e?.target?.object) {
              const cam = e.target.object;
              onCameraMove({
                x: Number(cam.position.x.toFixed(2)),
                y: Number(cam.position.y.toFixed(2)),
                z: Number(cam.position.z.toFixed(2)),
              });
            }
          }}
        />
      </Canvas>
    </div>
  );
};
