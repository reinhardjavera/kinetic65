import * as THREE from "three";
import {
  KEYBOARD_LAYOUT,
  KEYBOARD_TOTAL_U_WIDTH,
  KEYBOARD_TOTAL_U_DEPTH,
} from "@/lib/keyboardLayout";
import {
  KeycapTheme,
  KEYCAP_THEMES,
} from "@/store/useConfiguratorStore";

let cachedPbtTexture: THREE.CanvasTexture | null = null;
let cachedPcbTexture: THREE.CanvasTexture | null = null;
let cachedBrassTexture: THREE.CanvasTexture | null = null;
const cachedAtlasTextures: Record<string, THREE.CanvasTexture> = {};

export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 9;
export const SLOT_SIZE = 256;
export const ATLAS_WIDTH = ATLAS_COLS * SLOT_SIZE;
export const ATLAS_HEIGHT = ATLAS_ROWS * SLOT_SIZE;

/**
 * Creates an off-screen procedural micro-grain bump/roughness texture
 * representing textured, bead-blasted matte PBT plastic.
 */
export function getPbtMicrograinTexture(): THREE.CanvasTexture {
  if (cachedPbtTexture) return cachedPbtTexture;
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Generate high-frequency uniform micro-grain noise
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 32;
    const val = Math.min(255, Math.max(0, 128 + grain));
    data[i] = val; // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    data[i + 3] = 255; // 100% Solid Alpha
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  cachedPbtTexture = texture;
  return texture;
}

/**
 * Procedurally generates a razor-sharp texture atlas containing legends
 * for all 68 keycaps in the active theme.
 * Strictly 100% opaque, high contrast, using JetBrains Mono.
 */
export function getKeycapAtlasTexture(themeKey: KeycapTheme): THREE.CanvasTexture {
  if (cachedAtlasTextures[themeKey]) {
    return cachedAtlasTextures[themeKey];
  }

  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_WIDTH;
  canvas.height = ATLAS_HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const theme = KEYCAP_THEMES[themeKey];

  // Fill entire atlas with solid neutral background first (guarantees zero transparency)
  ctx.fillStyle = theme.alphaColor;
  ctx.fillRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT);

  KEYBOARD_LAYOUT.forEach((key, index) => {
    const col = index % ATLAS_COLS;
    const row = Math.floor(index / ATLAS_COLS);
    const x = col * SLOT_SIZE;
    const y = row * SLOT_SIZE;

    // Determine colors based on key category
    let bg = theme.alphaColor;
    let fg = theme.legendAlpha;

    if (key.category === "accent") {
      bg = theme.accentColor;
      fg = "#FFFFFF";
    } else if (key.category === "mod") {
      bg = theme.modColor;
      fg = theme.legendMod;
    }

    // 1. Draw solid opaque background for keycap top dish
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, SLOT_SIZE, SLOT_SIZE);

    // 2. Micro-grain tactile PBT noise overlay in canvas
    for (let py = 0; py < SLOT_SIZE; py += 3) {
      for (let px = 0; px < SLOT_SIZE; px += 3) {
        if (Math.random() > 0.6) {
          const shade = (Math.random() - 0.5) * 16;
          ctx.fillStyle =
            shade > 0
              ? `rgba(255, 255, 255, ${Math.min(0.08, shade / 100)})`
              : `rgba(0, 0, 0, ${Math.min(0.08, -shade / 100)})`;
          ctx.fillRect(x + px, y + py, 3, 3);
        }
      }
    }

    // 3. Subtle hairline frame inside dish margin
    ctx.strokeStyle =
      key.category === "mod" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, SLOT_SIZE - 16, SLOT_SIZE - 16);

    // 4. Print High-Contrast Razor-Sharp Typography
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const label = key.label;

    if (key.subLabel) {
      // Dual symbol keys (e.g. 1 / !)
      ctx.font = 'bold 44px "JetBrains Mono", monospace';
      ctx.fillText(key.subLabel, x + SLOT_SIZE / 2, y + 78);
      ctx.font = 'bold 56px "JetBrains Mono", monospace';
      ctx.fillText(label, x + SLOT_SIZE / 2, y + 162);
    } else if (label.length === 1) {
      // Single character alpha (Q, W, E, R, etc.)
      ctx.font = 'bold 74px "JetBrains Mono", monospace';
      ctx.fillText(label, x + SLOT_SIZE / 2, y + SLOT_SIZE / 2 + 2);
    } else if (key.code === "Space") {
      // Spacebar
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(label, x + SLOT_SIZE / 2, y + SLOT_SIZE / 2 + 2);
    } else {
      // Text modifiers (TAB, CAPS, SHIFT, ENTER, DEL, etc.)
      const fontSize = label.length > 5 ? 32 : label.length > 4 ? 36 : 42;
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(label, x + SLOT_SIZE / 2, y + SLOT_SIZE / 2 + 2);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  cachedAtlasTextures[themeKey] = texture;
  return texture;
}

/**
 * Creates a high-fidelity procedural PCB canvas texture:
 * - Matte dark solder mask (#121316)
 * - Gold-plated Kailh hot-swap socket contacts (#D4AF37)
 * - Symmetrical 45-degree routed copper traces (#A06235)
 * - Crisp technical silkscreen markings (#E0E0DC & #70706B)
 */
export function getPcbProceduralTexture(): THREE.CanvasTexture {
  if (cachedPcbTexture) return cachedPcbTexture;
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Dark matte solder mask background
  ctx.fillStyle = "#121316";
  ctx.fillRect(0, 0, width, height);

  // Subtle woven fiberglass pattern in solder mask
  ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
  for (let x = 0; x < width; x += 4) {
    ctx.fillRect(x, 0, 1, height);
  }

  // 2. Silkscreen Border & Mechanical Registration
  ctx.strokeStyle = "rgba(235, 235, 230, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Technical typography
  ctx.fillStyle = "#EAEAE6";
  ctx.font = "bold 20px monospace";
  ctx.fillText("KINETIC-65 // HARDWARE REVISION 2.4", 50, 65);
  ctx.fillStyle = "#8E8E88";
  ctx.font = "14px monospace";
  ctx.fillText("SPEC: 1.6MM FR-4 ENIG-GOLD HOT-SWAP ARCHITECTURE", 50, 90);
  ctx.fillText("LAYERS: 4-LAYER MULTILAYER PCB // CHERRY MX G-MOUNT", 50, 110);
  ctx.fillText("QC PASSED: [OK] 68-KEY ANSI MATRIX", width - 420, 65);
  ctx.fillText("MADE IN WORKSPACE // PROCEDURE 01", width - 420, 88);

  // 3. Render 68 Switch Socket Cutouts, Sockets, and Traces
  const marginX = 80;
  const marginY = 140;
  const playableWidth = width - marginX * 2;
  const playableHeight = height - marginY * 2;

  // Draw bus traces along top and bottom
  ctx.strokeStyle = "#B36733";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let t = 0; t < 6; t++) {
    const traceY = 125 + t * 4;
    ctx.moveTo(marginX, traceY);
    ctx.lineTo(width - marginX, traceY);
  }
  ctx.stroke();

  KEYBOARD_LAYOUT.forEach((key, idx) => {
    // Map 3D coordinates to 2D canvas coordinates
    const normX = (key.x + KEYBOARD_TOTAL_U_WIDTH * 0.5) / KEYBOARD_TOTAL_U_WIDTH;
    const normZ = (key.z + KEYBOARD_TOTAL_U_DEPTH * 0.5) / KEYBOARD_TOTAL_U_DEPTH;

    const px = marginX + normX * playableWidth;
    const py = marginY + normZ * playableHeight;

    // Switch central pin hole (Black drill hole)
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#D4AF37"; // Gold ring (ENIG plated hole)
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hot-swap contact pad 1 (Left pin)
    const pad1X = px - 28;
    const pad1Y = py - 18;
    ctx.fillStyle = "#E5B946";
    ctx.fillRect(pad1X - 7, pad1Y - 12, 14, 24);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(pad1X, pad1Y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hot-swap contact pad 2 (Right pin)
    const pad2X = px + 24;
    const pad2Y = py - 26;
    ctx.fillStyle = "#E5B946";
    ctx.fillRect(pad2X - 7, pad2Y - 12, 14, 24);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(pad2X, pad2Y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Kailh socket housing outline
    ctx.strokeStyle = "#25272B";
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 38, py - 32, 70, 36);

    // Diode footprint (SMD 0805)
    const diodeX = px + 18;
    const diodeY = py + 22;
    ctx.fillStyle = "#A8A8A2";
    ctx.fillRect(diodeX - 8, diodeY - 4, 6, 8);
    ctx.fillRect(diodeX + 2, diodeY - 4, 6, 8);
    ctx.fillStyle = "#1E1E1E";
    ctx.fillRect(diodeX - 2, diodeY - 4, 4, 8);

    // SMD RGB LED window pad
    const ledX = px;
    const ledY = py + 26;
    ctx.fillStyle = "#D4AF37";
    ctx.fillRect(ledX - 10, ledY - 5, 20, 10);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(ledX - 4, ledY - 2, 8, 4);

    // Silkscreen Key Index Label
    ctx.fillStyle = "rgba(220, 220, 215, 0.45)";
    ctx.font = "10px monospace";
    ctx.fillText(`SW${(idx + 1).toString().padStart(2, "0")}`, px - 35, py + 38);

    // Procedural copper trace router to neighboring key
    ctx.strokeStyle = "rgba(180, 105, 50, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad1X, pad1Y);
    ctx.lineTo(pad1X - 12, pad1Y + 12);
    ctx.lineTo(px - 45, py + 12);
    ctx.stroke();
  });

  // Microcontroller QFP chip outline & traces at bottom-left corner
  const mcuX = 140;
  const mcuY = height - 120;
  ctx.fillStyle = "#151618";
  ctx.fillRect(mcuX - 35, mcuY - 35, 70, 70);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mcuX - 35, mcuY - 35, 70, 70);

  // MCU pin pads
  for (let p = -28; p <= 28; p += 8) {
    ctx.fillStyle = "#D4AF37";
    ctx.fillRect(mcuX + p - 2, mcuY - 44, 4, 8);
    ctx.fillRect(mcuX + p - 2, mcuY + 36, 4, 8);
    ctx.fillRect(mcuX - 44, mcuY + p - 2, 8, 4);
    ctx.fillRect(mcuX + 36, mcuY + p - 2, 8, 4);
  }

  ctx.fillStyle = "#E0E0DC";
  ctx.font = "bold 9px monospace";
  ctx.fillText("RP2040-MCU", mcuX - 30, mcuY + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  cachedPcbTexture = texture;
  return texture;
}

/**
 * Creates brushed brass texture for the CNC weight block.
 */
export function getBrushedBrassTexture(): THREE.CanvasTexture {
  if (cachedBrassTexture) return cachedBrassTexture;
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Brass base
  ctx.fillStyle = "#C89D47";
  ctx.fillRect(0, 0, width, height);

  // Directional brushed streak noise
  for (let y = 0; y < height; y++) {
    const alpha = (Math.random() - 0.5) * 0.12;
    ctx.fillStyle =
      alpha > 0 ? `rgba(255, 235, 175, ${alpha})` : `rgba(120, 80, 20, ${-alpha})`;
    ctx.fillRect(0, y, width, 1);
  }

  // Laser engraved logo
  ctx.fillStyle = "#5E4314";
  ctx.font = "bold 32px monospace";
  ctx.textAlign = "center";
  ctx.fillText("KINETIC-65 // SOLID BRASS WEIGHT BLOCK", width / 2, height / 2 - 10);
  ctx.font = "20px monospace";
  ctx.fillText("MASS: 720 GRAMS // CNC MACHINED", width / 2, height / 2 + 25);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  cachedBrassTexture = texture;
  return texture;
}
