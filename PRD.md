# Product Requirements Document (PRD): KINETIC-65 // Modular Mechanical Keyboard Configurator

## 1. Product Vision

**KINETIC-65** adalah aplikasi web interaktif 3D berbasis _procedural WebGL_ yang memamerkan arsitektur mekanikal dari sebuah _custom 65% mechanical keyboard_. Pengunjung dapat mengeksplorasi struktur internal perangkat melalui _scroll-driven exploded view_, menguji akustik _switch_ secara _real-time_ via Web Audio API, dan menyimpan konfigurasi kustom ke database untuk dibagikan melalui tautan unik.

## 2. Target Audience & Portfolio Goals

- **Tech Recruiters & Engineering Leads:** Membuktikan penguasaan arsitektur _frontend_ kompleks (React Three Fiber, GSAP ScrollTrigger, Web Audio API) serta integrasi _backend_ full-stack (Supabase/PostgreSQL).
- **Design & Creative Directors:** Menunjukkan standar estetika industrial yang bersih, presisi tipografi, dan perhatian tinggi terhadap _micro-interactions_ tanpa aset 3D eksternal.

## 3. Core Functional Requirements

### 3.1. Procedural 3D Hardware & Scroll Exploded View

- **100% Procedural Geometry:** Seluruh komponen dibangun secara matematis menggunakan primitif Three.js (`RoundedBox`, `Cylinder`, `ExtrudeGeometry`) tanpa file `.glb`/`.gltf` eksternal.
- **5-Layer Vertical Exploded View:** Saat pengguna melakukan _scroll_, 5 lapisan _keyboard_ terpisah secara vertikal di sumbu Y dengan _easing_ presisi:
  1. **Sculpted Keycaps (68 keys):** Layout 65% ANSI dengan profil tinggi yang berbeda tiap baris (R1–R4).
  2. **Tactile/Linear Switches (68 units):** Housing transparan/berwarna dengan _stem_ yang dapat bergerak ke bawah saat ditekan.
  3. **CNC Switch Plate:** Pelat aluminium/brass dengan potongan lubang presisi.
  4. **Hot-Swap PCB:** Papan sirkuit matte black dengan jalur sirkuit tembaga/emas (_procedural canvas texture_) dan titik LED SMD.
  5. **CNC Aluminum Chassis + Brass Weight:** Casing bawah sudut tajam dengan pemberat kuningan di bagian bawah dan _dampening foam_.
- **Camera Choreography:** Kamera melakukan transisi mulus dari sudut _isometric hero_, turun ke _side-profile cutaway_ saat _exploded view_, hingga _top-down interactive mode_.

### 3.2. Real-Time Interactive Mode & Procedural Acoustics

- **Physical Keypress Simulation:** Klik pada _keycap_ di layar atau tekan tombol keyboard fisik (`A-Z`, `Space`, `Enter`, dll.) akan menggerakkan mesh _keycap_ dan _switch stem_ turun sejauh `3.5mm` (dalam skala 3D) lalu memantul kembali (_spring physics_).
- **Zero-Asset Web Audio Synthesizer:** Suara ketikan tidak menggunakan file `.mp3`/`.wav`, melainkan disintesis secara _real-time_ menggunakan `AudioContext` (kombinasi _filtered white noise burst_ + _low-pass resonant thump_) yang berbeda karakteristiknya berdasarkan tipe _switch_:
  - **Linear (Red):** _Deep thocky_, minim klik frekuensi tinggi.
  - **Tactile (Brown):** _Mid-range pop_ ganda saat melewati titik aktuasi.
  - **Clicky (Blue):** _Sharp high-frequency transient click_ + _bottom-out thud_.

### 3.3. Hardware Configurator & Full-Stack Persistence

- **Real-Time Material Customizer:**
  - **Chassis Finish:** Anodized Raw Silver, Matte Obsidian, Industrial Cream, Olive Drab.
  - **Keycap Colorway:** Monochrome Industrial (White/Charcoal/Safety Orange accent), Dolch Retro, Botanical.
  - **Switch Type:** Linear 45g, Tactile 55g, Clicky 60g.
  - **Underglow / Per-Key LED:** Off, Warm White (3000K), Amber, Cyber Red (tanpa efek _rainbow RGB_ murahan).
- **Database Persistence (Supabase):**
  - Pengguna dapat menekan tombol **"COMMIT BUILD"** untuk menyimpan konfigurasi ke tabel `builds` di PostgreSQL.
  - Menghasilkan _slug_ pendek (misalnya `/build/k65-89a2f`) yang memuat ulang konfigurasi 3D persis sesuai pilihan pembuatnya.
  - Galeri **"COMMUNITY ARCHIVE"** menampilkan 6 rakitan terbaru yang bisa langsung dimuat ke kanvas 3D dengan satu klik.

## 4. Technical Constraints & Performance Targets

- **Frame Rate:** Stabil 60 FPS pada perangkat desktop standar dan minimal 45 FPS pada perangkat mobile modern.
- **Instanced Rendering:** Gunakan `InstancedMesh` untuk 68 _keycaps_ dan 68 _switches_ agar total _draw calls_ berada di bawah 35 _calls_.
- **Initial Load:** Ukuran _bundle_ awal harus ringan (< 300KB gzipped) karena tidak ada pengunduhan model 3D eksternal.
