# Design System & Aesthetic Direction: KINETIC-65

## 1. Anti-AI-Slop Manifesto (Strict Prohibitions)

Untuk menjaga kredibilitas visual layaknya studio desain produk fisik (referensi: **Teenage Engineering**, **Braun / Dieter Rams**, **Mode Designs**), elemen berikut **DILARANG KERAS**:

- ❌ Gradasi ungu-biru (_neon purple/cyan gradients_) atau latar belakang _mesh gradient_ abstrak.
- ❌ _Box-shadow_ menyala (_outer glow_) pada kartu atau tombol.
- ❌ Kartu dengan `border-radius` terlalu bulat (`rounded-3xl`) dan latar belakang _glassmorphism_ buram yang berlebihan.
- ❌ Teks pemasaran klise ("Unleash your creativity", "Next-gen revolution", "Elevate your typing"). Gunakan istilah teknis manufaktur nyata (_CNC 6063 Aluminum_, _1.6mm FR4 PCB_, _45g Actuation Force_).
- ❌ Efek RGB pelangi (_rainbow wave_) pada keyboard. Pencahayaan LED hanya menggunakan warna solid monokromatik atau _amber/warm white_.

## 2. Color Palette (Industrial Hardware Specification)

Sistem warna mengadopsi kontras tinggi ala spesifikasi teknis dan instrumen laboratorium:

| Token               | Hex       | Kegunaan                                                                                            |
| :------------------ | :-------- | :-------------------------------------------------------------------------------------------------- |
| `--bg-primary`      | `#E6E6E3` | Latar belakang utama kanvas (_Warm Alabaster / Architectural Concrete_).                            |
| `--bg-surface`      | `#DCDCD8` | Panel kontrol teknis dan _sidebar_ spesifikasi.                                                     |
| `--bg-dark`         | `#141413` | Mode kontras / bagian _footer_ teknis (_Matte Carbon_).                                             |
| `--text-primary`    | `#141413` | Teks utama, judul, dan angka metrik.                                                                |
| `--text-muted`      | `#63635E` | Label teknis, unit pengukuran, dan metadata.                                                        |
| `--accent-safety`   | `#FF4D00` | _International Safety Orange_ — hanya untuk tombol aksi utama (`COMMIT BUILD`) dan indikator aktif. |
| `--border-hairline` | `#BDBDB7` | Garis pemisah tipis `1px solid` untuk struktur _grid_ modular.                                      |

## 3. Typography

- **Display & Headings:** `Space Grotesk` atau `Inter` (Weight: 600/700, `tracking: -0.03em`, _uppercase_ untuk label kategori).
- **Technical Specs & Telemetry:** `JetBrains Mono` (Weight: 400/500, _tabular-nums_ wajib aktif agar angka koordinat dan harga/berat tidak bergeser saat berubah).

## 4. Layout & Spatial Architecture

- **Swiss Grid System:** Seluruh overlay UI menggunakan garis tepi _hairline_ (`1px solid var(--border-hairline)`) dengan sudut tajam (`rounded-none` atau maksimal `rounded-[2px]`).
- **HUD Telemetry Overlay:**
  - **Top Bar:** Nama kode produk (`KINETIC-65 // REV 2.4`), indikator koordinat kamera _real-time_ (`CAM: [X, Y, Z]`), dan tombol _toggle_ suara (`AUDIO: SYNTH_ON`).
  - **Scroll Chapters (Left-Aligned Narrow Column, max-width `380px`):** Muncul secara bergantian saat _scroll_, memberikan ruang 70% layar di sisi kanan agar objek 3D terlihat utuh tanpa terhalang teks.
  - **Interactive Dock (Bottom Floating Strip):** Muncul hanya saat mencapai _section_ konfigurator akhir, berisi pemilih warna fisik (_swatch_ bulat dengan cincin indikator presisi) dan tombol _Save Build_.

## 5. 3D Material & Lighting Standards (PBR)

- **Studio Lighting:** Gunakan `<Environment>` dengan pencahayaan _softbox_ studio netral (bukan _city/sunset_ yang berwarna-warni) agar pantulan pada logam aluminium dan _brass_ terlihat seperti foto produk komersial.
- **Surface Micro-Detail:** Tambahkan _procedural bump/roughness map_ (menggunakan HTML5 `<canvas>` off-screen dengan _noise_ halus) pada _keycaps_ PBT agar terlihat memiliki tekstur plastik _matte_ berpasir (_textured PBT_), bukan plastik licin bawaan Three.js.
