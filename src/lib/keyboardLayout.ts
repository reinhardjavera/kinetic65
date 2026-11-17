export type RowProfile = "R1" | "R2" | "R3" | "R4";
export type KeyCategory = "alpha" | "mod" | "accent";

export interface KeyDefinition {
  id: string;
  code: string;
  label: string;
  subLabel?: string;
  width: number; // width in u (1, 1.25, 1.5, 1.75, 2, 2.25, 6.25)
  physicalWidth: number; // actual 3D unit width (width * UNIT_SIZE - GAP)
  physicalDepth: number; // actual 3D unit depth (1 * UNIT_SIZE - GAP)
  row: number; // 0 (top) to 4 (bottom)
  rowProfile: RowProfile;
  x: number; // 3D center X
  z: number; // 3D center Z
  category: KeyCategory;
  tilt: number; // tilt in radians around X axis for Cherry profile
  height: number; // keycap 3D height
}

export const UNIT_SIZE = 1.0;
export const KEY_GAP = 0.06;
export const KEYBOARD_TOTAL_U_WIDTH = 16.0;
export const KEYBOARD_TOTAL_U_DEPTH = 5.0;

// Profile heights and tilts (Cherry sculpted profile simulation)
export const PROFILE_SPECS: Record<
  RowProfile,
  { height: number; tilt: number }
> = {
  R1: { height: 0.42, tilt: 0.12 }, // Row 0 (Esc, Numbers) - tilted forward toward typist
  R2: { height: 0.38, tilt: 0.06 }, // Row 1 (Tab, QWERTY)
  R3: { height: 0.35, tilt: 0.0 }, // Row 2 (Home row ASDF) - flat baseline
  R4: { height: 0.39, tilt: -0.09 }, // Row 3 & 4 (ZXCV & Space) - tilted back
};

interface KeyRawData {
  code: string;
  label: string;
  subLabel?: string;
  width: number;
  category: KeyCategory;
}

const RAW_ROWS: KeyRawData[][] = [
  // Row 0 (R1) - 16.0u total (15 keys)
  [
    { code: "Escape", label: "ESC", width: 1.0, category: "accent" },
    { code: "Digit1", label: "1", subLabel: "!", width: 1.0, category: "alpha" },
    { code: "Digit2", label: "2", subLabel: "@", width: 1.0, category: "alpha" },
    { code: "Digit3", label: "3", subLabel: "#", width: 1.0, category: "alpha" },
    { code: "Digit4", label: "4", subLabel: "$", width: 1.0, category: "alpha" },
    { code: "Digit5", label: "5", subLabel: "%", width: 1.0, category: "alpha" },
    { code: "Digit6", label: "6", subLabel: "^", width: 1.0, category: "alpha" },
    { code: "Digit7", label: "7", subLabel: "&", width: 1.0, category: "alpha" },
    { code: "Digit8", label: "8", subLabel: "*", width: 1.0, category: "alpha" },
    { code: "Digit9", label: "9", subLabel: "(", width: 1.0, category: "alpha" },
    { code: "Digit0", label: "0", subLabel: ")", width: 1.0, category: "alpha" },
    { code: "Minus", label: "-", subLabel: "_", width: 1.0, category: "alpha" },
    { code: "Equal", label: "=", subLabel: "+", width: 1.0, category: "alpha" },
    { code: "Backspace", label: "BACK", width: 2.0, category: "mod" },
    { code: "Delete", label: "DEL", width: 1.0, category: "mod" },
  ],
  // Row 1 (R2) - 16.0u total (15 keys)
  [
    { code: "Tab", label: "TAB", width: 1.5, category: "mod" },
    { code: "KeyQ", label: "Q", width: 1.0, category: "alpha" },
    { code: "KeyW", label: "W", width: 1.0, category: "alpha" },
    { code: "KeyE", label: "E", width: 1.0, category: "alpha" },
    { code: "KeyR", label: "R", width: 1.0, category: "alpha" },
    { code: "KeyT", label: "T", width: 1.0, category: "alpha" },
    { code: "KeyY", label: "Y", width: 1.0, category: "alpha" },
    { code: "KeyU", label: "U", width: 1.0, category: "alpha" },
    { code: "KeyI", label: "I", width: 1.0, category: "alpha" },
    { code: "KeyO", label: "O", width: 1.0, category: "alpha" },
    { code: "KeyP", label: "P", width: 1.0, category: "alpha" },
    { code: "BracketLeft", label: "[", subLabel: "{", width: 1.0, category: "alpha" },
    { code: "BracketRight", label: "]", subLabel: "}", width: 1.0, category: "alpha" },
    { code: "Backslash", label: "\\", subLabel: "|", width: 1.5, category: "alpha" },
    { code: "PageUp", label: "PGUP", width: 1.0, category: "mod" },
  ],
  // Row 2 (R3) - 16.0u total (14 keys)
  [
    { code: "CapsLock", label: "CAPS", width: 1.75, category: "mod" },
    { code: "KeyA", label: "A", width: 1.0, category: "alpha" },
    { code: "KeyS", label: "S", width: 1.0, category: "alpha" },
    { code: "KeyD", label: "D", width: 1.0, category: "alpha" },
    { code: "KeyF", label: "F", width: 1.0, category: "alpha" },
    { code: "KeyG", label: "G", width: 1.0, category: "alpha" },
    { code: "KeyH", label: "H", width: 1.0, category: "alpha" },
    { code: "KeyJ", label: "J", width: 1.0, category: "alpha" },
    { code: "KeyK", label: "K", width: 1.0, category: "alpha" },
    { code: "KeyL", label: "L", width: 1.0, category: "alpha" },
    { code: "Semicolon", label: ";", subLabel: ":", width: 1.0, category: "alpha" },
    { code: "Quote", label: "'", subLabel: '"', width: 1.0, category: "alpha" },
    { code: "Enter", label: "ENTER", width: 2.25, category: "accent" },
    { code: "PageDown", label: "PGDN", width: 1.0, category: "mod" },
  ],
  // Row 3 (R4) - 16.0u total (14 keys)
  [
    { code: "ShiftLeft", label: "SHIFT", width: 2.25, category: "mod" },
    { code: "KeyZ", label: "Z", width: 1.0, category: "alpha" },
    { code: "KeyX", label: "X", width: 1.0, category: "alpha" },
    { code: "KeyC", label: "C", width: 1.0, category: "alpha" },
    { code: "KeyV", label: "V", width: 1.0, category: "alpha" },
    { code: "KeyB", label: "B", width: 1.0, category: "alpha" },
    { code: "KeyN", label: "N", width: 1.0, category: "alpha" },
    { code: "KeyM", label: "M", width: 1.0, category: "alpha" },
    { code: "Comma", label: ",", subLabel: "<", width: 1.0, category: "alpha" },
    { code: "Period", label: ".", subLabel: ">", width: 1.0, category: "alpha" },
    { code: "Slash", label: "/", subLabel: "?", width: 1.0, category: "alpha" },
    { code: "ShiftRight", label: "SHIFT", width: 1.75, category: "mod" },
    { code: "ArrowUp", label: "▲", width: 1.0, category: "mod" },
    { code: "End", label: "END", width: 1.0, category: "mod" },
  ],
  // Row 4 (R4) - 16.0u total (10 keys)
  [
    { code: "ControlLeft", label: "CTRL", width: 1.25, category: "mod" },
    { code: "MetaLeft", label: "SUPER", width: 1.25, category: "mod" },
    { code: "AltLeft", label: "ALT", width: 1.25, category: "mod" },
    { code: "Space", label: "KINETIC-65", width: 6.25, category: "accent" },
    { code: "AltRight", label: "ALT", width: 1.0, category: "mod" },
    { code: "Fn", label: "FN", width: 1.0, category: "mod" },
    { code: "ControlRight", label: "CTRL", width: 1.0, category: "mod" },
    { code: "ArrowLeft", label: "◀", width: 1.0, category: "mod" },
    { code: "ArrowDown", label: "▼", width: 1.0, category: "mod" },
    { code: "ArrowRight", label: "▶", width: 1.0, category: "mod" },
  ],
];

export const KEYBOARD_LAYOUT: KeyDefinition[] = (() => {
  const keys: KeyDefinition[] = [];
  const startX = -KEYBOARD_TOTAL_U_WIDTH * UNIT_SIZE * 0.5;
  const startZ = -KEYBOARD_TOTAL_U_DEPTH * UNIT_SIZE * 0.5;

  RAW_ROWS.forEach((rowKeys, rowIndex) => {
    let currentX = 0;
    const rowProfile: RowProfile =
      rowIndex === 0 ? "R1" : rowIndex === 1 ? "R2" : rowIndex === 2 ? "R3" : "R4";
    const profileSpec = PROFILE_SPECS[rowProfile];
    const centerZ = startZ + (rowIndex + 0.5) * UNIT_SIZE;

    rowKeys.forEach((key) => {
      const centerX = startX + (currentX + key.width * 0.5) * UNIT_SIZE;
      const physicalWidth = key.width * UNIT_SIZE - KEY_GAP;
      const physicalDepth = 1.0 * UNIT_SIZE - KEY_GAP;

      keys.push({
        id: `${key.code}_${rowIndex}`,
        code: key.code,
        label: key.label,
        subLabel: key.subLabel,
        width: key.width,
        physicalWidth,
        physicalDepth,
        row: rowIndex,
        rowProfile,
        x: centerX,
        z: centerZ,
        category: key.category,
        tilt: profileSpec.tilt,
        height: profileSpec.height,
      });

      currentX += key.width;
    });
  });

  return keys;
})();

// Dimensions for plate, pcb, chassis
export const KEYBOARD_DIMENSIONS = {
  plateWidth: KEYBOARD_TOTAL_U_WIDTH * UNIT_SIZE + 0.35,
  plateDepth: KEYBOARD_TOTAL_U_DEPTH * UNIT_SIZE + 0.35,
  plateThickness: 0.12,
  pcbThickness: 0.08,
  chassisWidth: KEYBOARD_TOTAL_U_WIDTH * UNIT_SIZE + 0.75,
  chassisDepth: KEYBOARD_TOTAL_U_DEPTH * UNIT_SIZE + 0.75,
  chassisHeight: 0.9,
  bezelThickness: 0.2,
  wallHeight: 0.5,
  weightWidth: KEYBOARD_TOTAL_U_WIDTH * UNIT_SIZE * 0.7,
  weightDepth: KEYBOARD_TOTAL_U_DEPTH * UNIT_SIZE * 0.45,
  weightThickness: 0.08,
};
