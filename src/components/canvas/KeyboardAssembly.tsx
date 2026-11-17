"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  KEYBOARD_LAYOUT,
  KEYBOARD_DIMENSIONS,
  KeyDefinition,
} from "@/lib/keyboardLayout";
import {
  useConfiguratorStore,
  CHASSIS_FINISHES,
  SWITCH_SPECS,
  LED_CONFIGS,
} from "@/store/useConfiguratorStore";
import { KeycapMatrix } from "./KeycapMatrix";
import {
  getPcbProceduralTexture,
  getBrushedBrassTexture,
} from "./ProceduralTextures";

// Shared geometries for switches to minimize memory allocation
const switchLowerGeom = new THREE.BoxGeometry(0.72, 0.12, 0.72);
const switchUpperGeom = new THREE.BoxGeometry(0.68, 0.12, 0.68);
const switchStemPostGeom = new THREE.BoxGeometry(0.16, 0.26, 0.16);
const switchStemCrossXGeom = new THREE.BoxGeometry(0.32, 0.10, 0.09);
const switchStemCrossZGeom = new THREE.BoxGeometry(0.09, 0.10, 0.32);

interface SingleSwitchProps {
  keyDef: KeyDefinition;
  stemColor: string;
  isPressed: boolean;
}

const SingleSwitch: React.FC<SingleSwitchProps> = ({
  keyDef,
  stemColor,
  isPressed,
}) => {
  const stemRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);

  useFrame((_, delta) => {
    if (!stemRef.current) return;
    const targetY = isPressed ? -0.16 : 0;
    currentY.current += (targetY - currentY.current) * Math.min(1, delta * 36);
    stemRef.current.position.y = currentY.current;
  });

  return (
    <group position={[keyDef.x, 0, keyDef.z]}>
      {/* Lower Housing (Nylon Base inside plate cutouts) */}
      <mesh geometry={switchLowerGeom} position={[0, -0.05, 0]} castShadow>
        <meshStandardMaterial
          color="#161618"
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Upper Housing (Semi-Transparent Polycarbonate - Opacity 0.35) */}
      <mesh geometry={switchUpperGeom} position={[0, 0.07, 0]} castShadow>
        <meshPhysicalMaterial
          color="#BAC0C6"
          transparent
          opacity={0.35}
          roughness={0.25}
          transmission={0.3}
          ior={1.45}
          thickness={0.15}
        />
      </mesh>

      {/* Moving MX Stem */}
      <group ref={stemRef} position={[0, 0.14, 0]}>
        <mesh geometry={switchStemPostGeom} castShadow>
          <meshStandardMaterial
            color={stemColor}
            roughness={0.38}
            metalness={0.05}
          />
        </mesh>
        <mesh geometry={switchStemCrossXGeom} position={[0, 0.04, 0]} castShadow>
          <meshStandardMaterial
            color={stemColor}
            roughness={0.38}
            metalness={0.05}
          />
        </mesh>
        <mesh geometry={switchStemCrossZGeom} position={[0, 0.04, 0]} castShadow>
          <meshStandardMaterial
            color={stemColor}
            roughness={0.38}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
};

export const KeyboardAssembly: React.FC = () => {
  const {
    chassisColor,
    switchType,
    ledMode,
    activeKeys,
    scrollProgress,
  } = useConfiguratorStore();

  const chassisFinish = CHASSIS_FINISHES[chassisColor];
  const switchSpec = SWITCH_SPECS[switchType];
  const ledConfig = LED_CONFIGS[ledMode];

  // Group references for vertical explosion
  const keycapsGroupRef = useRef<THREE.Group>(null);
  const switchesGroupRef = useRef<THREE.Group>(null);
  const plateGroupRef = useRef<THREE.Group>(null);
  const pcbGroupRef = useRef<THREE.Group>(null);
  const chassisGroupRef = useRef<THREE.Group>(null);

  // Textures
  const pcbTexture = useMemo(() => getPcbProceduralTexture(), []);
  const brassTexture = useMemo(() => getBrushedBrassTexture(), []);

  // CNC Plate Geometry with 68 Switch Cutouts
  const plateGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const pw = KEYBOARD_DIMENSIONS.plateWidth;
    const pd = KEYBOARD_DIMENSIONS.plateDepth;

    // Outer perimeter
    shape.moveTo(-pw * 0.5, -pd * 0.5);
    shape.lineTo(pw * 0.5, -pd * 0.5);
    shape.lineTo(pw * 0.5, pd * 0.5);
    shape.lineTo(-pw * 0.5, pd * 0.5);
    shape.closePath();

    // 68 Switch Mounting Holes
    const holeHalf = 0.36;
    KEYBOARD_LAYOUT.forEach((k) => {
      const hole = new THREE.Path();
      hole.moveTo(k.x - holeHalf, k.z - holeHalf);
      hole.lineTo(k.x + holeHalf, k.z - holeHalf);
      hole.lineTo(k.x + holeHalf, k.z + holeHalf);
      hole.lineTo(k.x - holeHalf, k.z + holeHalf);
      hole.closePath();
      shape.holes.push(hole);
    });

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Align with X-Z ground plane
    geom.rotateX(Math.PI * 0.5);
    return geom;
  }, []);

  // Update exploded vertical separation smoothly based on scrollProgress
  // Tight resting positions (p=0): keycaps=0.14, switches=0.02, plate=0.0, pcb=-0.09, chassis=-0.28
  useFrame(() => {
    const p = scrollProgress; // 0 (assembled) -> 1 (fully exploded)

    if (keycapsGroupRef.current) {
      keycapsGroupRef.current.position.y = 0.14 + p * 1.8;
    }
    if (switchesGroupRef.current) {
      switchesGroupRef.current.position.y = 0.02 + p * 1.0;
    }
    if (plateGroupRef.current) {
      plateGroupRef.current.position.y = 0.0 + p * 0.3;
    }
    if (pcbGroupRef.current) {
      pcbGroupRef.current.position.y = -0.09 - p * 0.4;
    }
    if (chassisGroupRef.current) {
      chassisGroupRef.current.position.y = -0.28 - p * 1.2;
    }
  });

  return (
    <group name="keyboard-assembly" rotation={[0.08, 0, 0]}>
      {/* ============================================================== */}
      {/* LAYER 01 // SCULPTED PBT KEYCAPS (68 KEYS)                    */}
      {/* ============================================================== */}
      <group ref={keycapsGroupRef} position={[0, 0.14, 0]}>
        <KeycapMatrix />
      </group>

      {/* ============================================================== */}
      {/* LAYER 02 // MECHANICAL SWITCH MATRIX (68 MX SWITCHES)         */}
      {/* ============================================================== */}
      <group ref={switchesGroupRef} position={[0, 0.02, 0]}>
        {KEYBOARD_LAYOUT.map((key) => (
          <SingleSwitch
            key={`sw_${key.id}`}
            keyDef={key}
            stemColor={switchSpec.stemColor}
            isPressed={activeKeys.includes(key.code)}
          />
        ))}
      </group>

      {/* ============================================================== */}
      {/* LAYER 03 // CNC SWITCH PLATE (ANODIZED 6063 ALUMINUM)         */}
      {/* ============================================================== */}
      <group ref={plateGroupRef} position={[0, 0.0, 0]}>
        <mesh geometry={plateGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#D4D4D2"
            metalness={0.88}
            roughness={0.24}
          />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* LAYER 04 // HOT-SWAP PCB (1.6MM FR-4 MATTE BLACK + GOLD PADS) */}
      {/* ============================================================== */}
      <group ref={pcbGroupRef} position={[0, -0.09, 0]}>
        {/* PCB Board substrate */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry
            args={[
              KEYBOARD_DIMENSIONS.plateWidth - 0.05,
              0.06,
              KEYBOARD_DIMENSIONS.plateDepth - 0.05,
            ]}
          />
          <meshStandardMaterial
            map={pcbTexture}
            roughness={0.65}
            metalness={0.15}
          />
        </mesh>

        {/* SMD LED Lighting Array */}
        {ledMode !== "off" && (
          <group name="led-lighting-array">
            {KEYBOARD_LAYOUT.map((key) => (
              <group key={`led_${key.id}`} position={[key.x, 0.04, key.z]}>
                <mesh>
                  <boxGeometry args={[0.08, 0.02, 0.06]} />
                  <meshBasicMaterial color={ledConfig.hex} />
                </mesh>
              </group>
            ))}
            <pointLight
              color={ledConfig.hex}
              intensity={ledConfig.intensity * 2.2}
              distance={7}
              decay={2}
              position={[0, 0.15, 0]}
            />
          </group>
        )}
      </group>

      {/* ============================================================== */}
      {/* LAYER 05 // CNC ALUMINUM CHASSIS + BRASS WEIGHT BLOCK         */}
      {/* ============================================================== */}
      <group ref={chassisGroupRef} position={[0, -0.28, 0]}>
        {/* Main Lower CNC Casing Body */}
        <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
          <boxGeometry
            args={[
              KEYBOARD_DIMENSIONS.chassisWidth,
              0.48,
              KEYBOARD_DIMENSIONS.chassisDepth,
            ]}
          />
          <meshStandardMaterial
            color={chassisFinish.hex}
            metalness={chassisFinish.metalness}
            roughness={chassisFinish.roughness}
            envMapIntensity={0.65}
          />
        </mesh>

        {/* Perimeter Chamfered Top Rim (Tightly framing the plate) */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry
            args={[
              KEYBOARD_DIMENSIONS.chassisWidth,
              0.10,
              KEYBOARD_DIMENSIONS.chassisDepth,
            ]}
          />
          <meshStandardMaterial
            color={chassisFinish.hex}
            metalness={chassisFinish.metalness}
            roughness={chassisFinish.roughness}
            envMapIntensity={0.65}
          />
        </mesh>

        {/* Internal Acoustic Dampening Sheet */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry
            args={[
              KEYBOARD_DIMENSIONS.plateWidth + 0.04,
              0.03,
              KEYBOARD_DIMENSIONS.plateDepth + 0.04,
            ]}
          />
          <meshStandardMaterial color="#121214" roughness={0.92} metalness={0} />
        </mesh>

        {/* Heavy Solid Brass Weight Block (Recessed underneath) */}
        <mesh position={[0, -0.41, 0]} castShadow receiveShadow>
          <boxGeometry
            args={[
              KEYBOARD_DIMENSIONS.weightWidth,
              0.06,
              KEYBOARD_DIMENSIONS.weightDepth,
            ]}
          />
          <meshStandardMaterial
            map={brassTexture}
            color="#D8AC4F"
            metalness={0.92}
            roughness={0.2}
          />
        </mesh>

        {/* Rear USB-C Port Cutout Housing */}
        <group position={[-5.2, 0.06, -KEYBOARD_DIMENSIONS.chassisDepth * 0.5 - 0.015]}>
          <mesh>
            <boxGeometry args={[0.55, 0.18, 0.06]} />
            <meshStandardMaterial color="#1E1E22" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.34, 0.10, 0.04]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>

        {/* 4 Rubber Acoustic Bumper Feet on Bottom */}
        {[
          [-KEYBOARD_DIMENSIONS.chassisWidth * 0.42, -0.42, -KEYBOARD_DIMENSIONS.chassisDepth * 0.4],
          [KEYBOARD_DIMENSIONS.chassisWidth * 0.42, -0.42, -KEYBOARD_DIMENSIONS.chassisDepth * 0.4],
          [-KEYBOARD_DIMENSIONS.chassisWidth * 0.42, -0.42, KEYBOARD_DIMENSIONS.chassisDepth * 0.4],
          [KEYBOARD_DIMENSIONS.chassisWidth * 0.42, -0.42, KEYBOARD_DIMENSIONS.chassisDepth * 0.4],
        ].map(([fx, fy, fz], idx) => (
          <mesh key={`foot_${idx}`} position={[fx, fy, fz]}>
            <cylinderGeometry args={[0.28, 0.32, 0.06, 16]} />
            <meshStandardMaterial color="#151515" roughness={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
