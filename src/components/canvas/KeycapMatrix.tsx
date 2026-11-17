"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  KEYBOARD_LAYOUT,
  KeyDefinition,
} from "@/lib/keyboardLayout";
import {
  useConfiguratorStore,
  KEYCAP_THEMES,
} from "@/store/useConfiguratorStore";
import {
  getPbtMicrograinTexture,
  getKeycapAtlasTexture,
  getWideKeyTexture,
  ATLAS_COLS,
  ATLAS_ROWS,
} from "./ProceduralTextures";

// Cache for solid keycap geometries to avoid recreating identical shapes
const solidGeomCache = new Map<string, THREE.BufferGeometry>();

/**
 * Creates a watertight solid tapered keycap geometry by safely deforming
 * a BoxGeometry's vertices without changing triangle indices:
 * - Upper vertices (y > 0) are tapered by 0.82 along X and Z.
 * - Dish curvature is carved into upper vertices along X.
 * - Entire geometry translated so bottom sits at y = 0.
 * - Normals recomputed cleanly.
 */
function createSolidKeycapGeometry(
  width: number,
  height: number,
  depth: number
): THREE.BufferGeometry {
  const cacheKey = `${width.toFixed(2)}_${height.toFixed(2)}_${depth.toFixed(2)}`;
  if (solidGeomCache.has(cacheKey)) {
    return solidGeomCache.get(cacheKey)!;
  }

  // 8 width segments and 8 depth segments provide smooth tapering and dish curvature
  const geom = new THREE.BoxGeometry(width, height, depth, 8, 4, 8);
  const posAttr = geom.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // Only taper and dish the top half of the keycap
    if (y > 0) {
      // Symmetrical 0.82 trapezoid tapering
      const newX = x * 0.82;
      const newZ = z * 0.82;

      // Finger rest dish: depression deepest at center X
      const dishFactor = 1 - Math.min(1, Math.abs(newX) / (width * 0.4));
      const newY = y - dishFactor * 0.035;

      posAttr.setXYZ(i, newX, newY, newZ);
    }
  }

  // Translate so the bottom face sits flush at y = 0
  geom.translate(0, height * 0.5, 0);

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();

  solidGeomCache.set(cacheKey, geom);
  return geom;
}

/**
 * Creates a flat legend plane that sits exactly on top of the keycap
 * with UVs mapped to the corresponding keycap legend slot in the atlas
 * (or standard 0-1 UVs for wide keys using a dedicated texture).
 */
function createLegendPlaneGeometry(
  topWidth: number,
  topDepth: number,
  slotIndex: number,
  isWideKey: boolean = false
): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(topWidth, topDepth);
  geom.rotateX(-Math.PI * 0.5);

  if (!isWideKey) {
    const col = slotIndex % ATLAS_COLS;
    const row = Math.floor(slotIndex / ATLAS_COLS);

    const uMin = col / ATLAS_COLS;
    const uMax = (col + 1) / ATLAS_COLS;
    const vMin = 1.0 - (row + 1) / ATLAS_ROWS;
    const vMax = 1.0 - row / ATLAS_ROWS;

    const uvAttr = geom.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      uvAttr.setXY(i, uMin + u * (uMax - uMin), vMin + v * (vMax - vMin));
    }
    uvAttr.needsUpdate = true;
  }

  return geom;
}

interface SingleKeycapProps {
  keyDef: KeyDefinition;
  slotIndex: number;
  atlasTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
  baseColor: string;
  themeKey: import("@/store/useConfiguratorStore").KeycapTheme;
  isPressed: boolean;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

const SingleKeycap: React.FC<SingleKeycapProps> = ({
  keyDef,
  slotIndex,
  atlasTexture,
  bumpTexture,
  baseColor,
  themeKey,
  isPressed,
  onPress,
  onRelease,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentYOffset = useRef(0);

  const isWideKey = keyDef.width >= 3.0; // Spacebar (6.25u)

  // Dedicated aspect-ratio-accurate texture for Spacebar to prevent stretching
  const activeTexture = useMemo(() => {
    if (isWideKey) {
      return getWideKeyTexture(themeKey, keyDef.label, keyDef.width);
    }
    return atlasTexture;
  }, [isWideKey, themeKey, keyDef.label, keyDef.width, atlasTexture]);

  // 1. Watertight solid body
  const bodyGeometry = useMemo(() => {
    return createSolidKeycapGeometry(
      keyDef.physicalWidth,
      keyDef.height,
      keyDef.physicalDepth
    );
  }, [keyDef.physicalWidth, keyDef.height, keyDef.physicalDepth]);

  // 2. Crisp legend plane on top face (tapered size: 0.81x)
  const legendGeometry = useMemo(() => {
    return createLegendPlaneGeometry(
      keyDef.physicalWidth * 0.81,
      keyDef.physicalDepth * 0.81,
      slotIndex,
      isWideKey
    );
  }, [keyDef.physicalWidth, keyDef.physicalDepth, slotIndex, isWideKey]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = isPressed ? -0.16 : 0;
    currentYOffset.current +=
      (targetY - currentYOffset.current) * Math.min(1, delta * 36);
    groupRef.current.position.y = currentYOffset.current;
  });

  return (
    <group
      position={[keyDef.x, 0, keyDef.z]}
      rotation={[keyDef.tilt, 0, 0]}
    >
      <group
        ref={groupRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPress(keyDef.code);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          onRelease(keyDef.code);
        }}
        onPointerOut={() => {
          if (isPressed) onRelease(keyDef.code);
        }}
      >
        {/* Solid Watertight Keycap Body (100% closed, zero holes) */}
        <mesh geometry={bodyGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={baseColor}
            bumpMap={bumpTexture}
            bumpScale={0.002}
            roughness={0.78}
            metalness={0.05}
            envMapIntensity={0.4}
            transparent={false}
            opacity={1.0}
            depthWrite={true}
          />
        </mesh>

        {/* Sharp High-Contrast Legend Printed on Top Dish */}
        <mesh
          geometry={legendGeometry}
          position={[0, keyDef.height + 0.002, 0]}
          receiveShadow
        >
          <meshStandardMaterial
            map={activeTexture}
            roughness={0.78}
            metalness={0.05}
            envMapIntensity={0.4}
            transparent={false}
            opacity={1.0}
            depthWrite={true}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>
    </group>
  );
};

export const KeycapMatrix: React.FC = () => {
  const { keycapTheme, activeKeys, pressKey, releaseKey } =
    useConfiguratorStore();

  const theme = KEYCAP_THEMES[keycapTheme];
  const bumpTexture = useMemo(() => getPbtMicrograinTexture(), []);
  const atlasTexture = useMemo(() => {
    return getKeycapAtlasTexture(keycapTheme);
  }, [keycapTheme]);

  if (!atlasTexture) return null;

  return (
    <group name="keycap-matrix">
      {KEYBOARD_LAYOUT.map((key, index) => {
        let baseColor = theme.alphaColor;
        if (key.category === "accent") {
          baseColor = theme.accentColor;
        } else if (key.category === "mod") {
          baseColor = theme.modColor;
        }

        return (
          <SingleKeycap
            key={key.id}
            keyDef={key}
            slotIndex={index}
            atlasTexture={atlasTexture}
            bumpTexture={bumpTexture}
            baseColor={baseColor}
            themeKey={keycapTheme}
            isPressed={activeKeys.includes(key.code)}
            onPress={pressKey}
            onRelease={releaseKey}
          />
        );
      })}
    </group>
  );
};
