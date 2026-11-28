# Audit UX — Kubiko Portal (kubiko.my.id)

Tanggal: 2026-11-28 · Auditor: Claude (UX/product design review) · Kode yang dibaca: working tree (identik dengan `upstream/main` untuk `src/`, `public/`, `tailwind.config.mjs`).

**Cara baca bukti**
- `file:baris` = disimpulkan dari kode (nomor baris valid per commit `e7c51ce` upstream/main).
- **[Layar-D]** = terlihat di produksi, viewport desktop **1024×768** (ukuran bawaan browser pane, bukan 1440).
- **[Layar-HP]** = terlihat di produksi, preset mobile **375×812**.
- **[Ukur]** = diukur lewat JavaScript di halaman produksi (computed style / bounding box / network).

**Catatan kondisi saat audit:** API status (`/api/status-page/*`, di-proxy Caddy ke Uptime Kuma) berubah-ubah. Pemuatan pertama (desktop, ±11.45 WIB) dapat **200** dan monitor 5 "Minecraft Server" **down** (status 0), uptime 24 jam monitor lain cuma ~61–62%. Pemuatan berikutnya (HP, ±11.47 WIB) dapat **502** untuk semua slug, dan `/api/status-page/heartbeat/default` sempat menggantung tanpa respons.

---

## Ringkasan

Secara visual Kubiko udah punya karakter yang kuat: neo-brutalist, palet hangat, CTA jelas, skip link dan focus ring rapi, `prefers-reduced-motion` dihormati. Masalah terbesarnya justru di **kejujuran informasi**. Fitur yang paling "premium" (status real-time) bisa bilang semua aman padahal enggak, dan bisa saling kontradiksi antar halaman. Masalah kedua: beberapa jalur penting buat keluarga (minta akun, minta bantuan, cara masuk Minecraft) belum ada jalannya.

| Butir | Skor (1–5) | Catatan singkat |
|---|---|---|
| CTA (Call to Action) | 3 | CTA utama jelas; "Status Sistem" diulang 5×; band bantuan tanpa tombol kontak |
| Affordance | 3 | Kartu terlihat bisa diklik tapi tidak; label tab aktif hilang saat hover |
| Discoverability | 3 | Tab filter tersembunyi di HP; Math Hero cuma lewat katalog/footer |
| Feedback | 2 | Gagal salin diam saja; status default "aman" sebelum dicek |
| Consistency | 2 | Status beda antar halaman; pola klik kartu beda antar halaman |
| Visual Hierarchy | 3 | Hero kuat; tapi teks 9–10 px dan beberapa kontras gagal AA |
| Cognitive Load | 3 | "100% Bebas Iklan" & "Favorit" di mana-mana, jargon teknis |
| Onboarding | 2 | Panduan 3 langkah ada, tapi "dapat akun dari mana?" tak terjawab |
| Progressive Disclosure | 3 | Daftar layanan muncul 4× di satu halaman |
| Breadcrumb | 4 | Situs 2 halaman; tombol "Kembali ke Portal" sudah cukup |
| Navigation Pattern | 3 | Navbar sesak di 1024 px; tinggi navbar HP tidak sesuai desain |
| Workflow & Productivity | 3 | Salin alamat & deep-link filter bagus; salin rapuh |
| Monitoring & Observability | 1 | Data contoh tampil sebagai data asli; hitungan salah |
| Communication | 2 | Tidak ada kanal kontak; preview link WhatsApp tanpa gambar |
| Content & Information | 3 | Copy hangat, tapi jargon, faux-bold, data dobel |

**5 temuan paling penting**
1. **MON-1 (P0)**: kalau API status gagal, halaman diam-diam memuat `mock-status.json` lalu menampilkan "Siap Digunakan" / "Semua Normal" plus jam "Terakhir dicek" seolah itu data asli. Terbukti di [Layar-HP]: Minecraft tampil "Siap Digunakan" padahal 2 menit sebelumnya API asli bilang down.
2. **MON-2 (P0)**: jumlah gangguan salah dan beda antar halaman. Di beranda tertulis "2 Layanan Terkendala" padahal cuma 1 monitor yang down. Di `/math-hero` pada saat yang sama tertulis "Semua Layanan Siap".
3. **MON-3 (P1)**: kartu "Telemetri Sistem" di hero sebagian besar hardcode. Tiga baris selalu "Online", dan baris Minecraft menampilkan status global ("Sebagian Offline" dalam pill hijau).
4. **COM-1 (P1)**: band "Ada kendala atau ingin menambah layanan?" menyuruh "hubungi pengelola", tapi tidak ada satu pun kanal kontak. Kedua tombolnya malah ke halaman status dan panduan.
5. **AFF-1 (P1)**: kartu layanan di beranda punya efek hover "angkat" dan teksnya bilang "Klik kartu", tapi kartunya bukan link. Di `/math-hero`, kartu justru link penuh.

**Jumlah temuan:** P0: 2 · P1: 11 · P2: 19 · P3: 15 · total 47 (rujukan silang tidak dihitung).

---

## CTA (Call to Action)

**Yang sudah bagus:** CTA utama hero "Jelajahi Layanan" (kuning, shadow brutal, panah) jelas jadi aksi nomor satu ([Layar-D], [Layar-HP]). Di `/math-hero`, "Pilih Level" juga jelas. Label tombol di kartu spesifik ("Buka Layanan", "Main Sekarang", "Salin Alamat").

**CTA-1 · P1 · Band bantuan tanpa aksi kontak**
- Bukti: `src/pages/index.astro:280-283` (judul "Ada kendala atau ingin menambah layanan?", teks "Silakan hubungi pengelola…"); tombolnya `index.astro:288-304` cuma "Cek Status Sistem" dan "Panduan Akses". [Layar-D] terlihat.
- Dampak: orang yang butuh akun baru atau reset sandi sampai di ujung halaman lalu buntu. Ini justru momen paling butuh bantuan.
- Rekomendasi: tombol primer band ini harus kanal kontak nyata (WhatsApp/email pengelola). Lihat COM-1 (butuh keputusan pengguna soal kanal).

**CTA-2 · P2 · "Status Sistem" diulang 5 kali, mengencerkan CTA**
- Bukti: link ke `statusPageUrl` muncul di `Navbar.astro:33-46` (badge), `Navbar.astro:85-94` (tombol kuning), `index.astro:66-74` (hero sekunder), `index.astro:288-296` (band bantuan), `Footer.astro:115-123`. Di [Layar-D] badge dan tombol kuning bersebelahan di navbar dan menuju URL yang sama.
- Dampak: tombol kuning di navbar (warna yang sama dengan CTA utama) bersaing dengan "Jelajahi Layanan". Keluarga jadi bertanya apa bedanya.
- Rekomendasi: cukup badge status di navbar. Hapus tombol kuning navbar di layar kecil–menengah (lihat NAV-1). Ganti CTA band bantuan dengan kontak.

---

## Affordance

**Yang sudah bagus:** tombol pill dengan shadow brutal jelas terlihat bisa ditekan. Target sentuh utama ≥44 px (`min-h-[44px]` di `ServiceCard.astro:105,138`, `CategoryFilter.astro:40`, tombol menu `Navbar.astro:100`).

**AFF-1 · P1 · Kartu layanan "terlihat bisa diklik" tapi bukan link**
- Bukti: kartu adalah `<div>` (`ServiceCard.astro:22-28`) dengan `hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg` (`:23`) dan judul berubah warna saat hover (`:70`). Teks seksi bilang "Klik kartu atau tombol untuk langsung membukanya" (`index.astro:189`). Hanya tombol "Buka Layanan" yang link (`:134-143`).
- Dampak: klik area kartu tidak melakukan apa-apa. Di HP (tanpa hover), orang mengetuk judul besar lalu bingung.
- Rekomendasi: jadikan seluruh kartu area klik lewat pola "stretched link" pada tombol utama. Pola ini sesuai kartu di `math-hero.astro:133-138`. Pengecualian: kartu Minecraft (yang punya tombol salin) jangan dulu, karena panahnya mengarah ke panel `crafty.` (lihat ONB-2).

**AFF-2 · P1 · Label tab filter aktif hilang saat di-hover**
- Bukti: `CategoryFilter.astro:40-44` memberi `hover:bg-[#F2ECE1]` ke tab non-aktif. Saat tab diaktifkan, script `Layout.astro:84-90` menambah `bg-[#161513] text-[#FAF7F0]` tapi **tidak menghapus** `hover:bg-[#F2ECE1]`. [Layar-D] + [Ukur]: setelah klik "Game Santai" dengan kursor masih di atasnya, background jadi `rgb(242,236,225)` dan teks `rgb(250,247,240)`, kontras **1,10:1**. Label tak terbaca, hanya angka "3" yang terlihat.
- Dampak: tepat setelah klik, feedback "terpilih" malah hilang. Terlihat seperti bug.
- Rekomendasi: hapus/tambah `hover:bg-[#F2ECE1]` bersamaan dengan pergantian state di script.

**AFF-3 · P3 · Baris status di kartu hero ikut terangkat saat hover**
- Bukti: `HeroStatusCard.astro:39,58,77,96` `hover:-translate-y-0.5` pada baris yang bukan link.
- Dampak: menjanjikan klik yang tidak ada (ringan).
- Rekomendasi: hapus `hover:-translate-y-0.5 transition-transform` dari baris, atau jadikan baris link ke layanan.

---

## Discoverability

**Yang sudah bagus:** filter kategori punya hitungan per tab dan bisa di-deep-link (`?category=game`, `Layout.astro:113-122, 154-160`). Navigasi panah kiri/kanan/Home/End di tab sudah ada (`Layout.astro:133-151`).

**DIS-1 · P2 · Di HP, 2 dari 4 tab filter tersembunyi di luar layar**
- Bukti: `CategoryFilter.astro:26` `overflow-x-auto … scrollbar-none`. Class `scrollbar-none` tidak ada di Tailwind 3 tanpa plugin (`tailwind.config.mjs:61` `plugins: []`). [Ukur] HP: `scrollWidth` 694 px vs lebar 343 px. [Layar-HP]: hanya "Semua Layanan" dan "Film & Video" yang terlihat, plus bar scroll abu-abu tipis.
- Dampak: "File & Dokumen" dan "Game Santai" (tempat Math Hero) hampir tak ketahuan ada.
- Rekomendasi: di HP, bungkus tab ke baris berikutnya (`flex-wrap`) dan buang `overflow-x-auto`/`scrollbar-none`.

**DIS-2 · P3 · Math Hero tidak punya pintu masuk di navbar/hero**
- Bukti: Math Hero hanya ditautkan dari kartu katalog (`services.ts:77-88`), daftar alamat (`services.ts:111`) dan footer (`Footer.astro:80-85`). Deskripsi hero (`index.astro:53`) menyebut film, foto, PDF, Minecraft, tapi tidak menyebut game edukasi.
- Dampak: fitur yang paling ramah anak justru paling dalam letaknya.
- Rekomendasi: sebut Math Hero di kalimat hero, atau tambahkan pilar ke-5 di band "Fitur & Utilitas".

---

## Feedback

**Yang sudah bagus:** toast `role="status" aria-live="polite"` (`Toast.astro:8-9`) terlihat jelas saat dipicu ([Layar-D], dipicu manual lewat `showToast`). Tombol "Segarkan" berputar saat memuat (`Layout.astro:214,255-257`). URL ikut berubah saat filter diklik ([Layar-D]: `?category=game`).

**FB-1 · P1 · Gagal salin tidak memberi tahu pengguna**
- Bukti: `Layout.astro:173-203`. Fallback `execCommand` hanya dipakai bila `navigator.clipboard` **tidak ada**. Bila ada tapi ditolak, kode langsung ke `catch` dan hanya `console.error` (`:201-203`). [Layar-D]: klik "Salin Alamat" Minecraft tidak memunculkan "Tersalin!" maupun toast. Console: `NotAllowedError: … Write permission denied`.
- Dampak: browser bawaan aplikasi (WhatsApp/Instagram) sering menolak Clipboard API, padahal link keluarga biasanya dibuka dari WhatsApp. Pengguna mengira sudah tersalin, lalu menempel alamat kosong di Minecraft.
- Rekomendasi: coba `execCommand` juga saat Clipboard API ditolak. Bila tetap gagal, tampilkan toast gagal berisi alamatnya supaya bisa disalin manual.

**FB-2 · P1 · Status default "aman" sebelum pengecekan selesai**
- Bukti: HTML awal sudah hijau dan berdenyut: "Sistem Normal" (`Navbar.astro:41-45`), "Aktif" (`ServiceCard.astro:59-63`), "Online" ×4 dan "Semua Normal" (`HeroStatusCard.astro:50-53,69-72,88-91,107-110,127`). [Layar-HP]: saat API menggantung, kartu tetap "Aktif", hero "Semua Normal", footnote "Pengecekan otomatis berkala".
- Dampak: sebelum (atau tanpa) data, UI mengklaim semuanya baik. Lihat juga MON-1.
- Rekomendasi: state awal netral "Memeriksa…" dengan titik abu-abu tanpa animasi.

**FB-3 · P3 · Toast di HP menempel tepi kiri dan ikonnya selalu centang**
- Bukti: `Toast.astro:7` `fixed bottom-6 right-6` tanpa batas kiri. [Ukur] HP: `left: 0`, lebar 351 px pada viewport 375. Ikon `CheckCircle2` statis (`:11-13`), jadi tidak cocok untuk pesan gagal.
- Dampak: di HP toast terlihat "nempel" ke tepi kiri, jadi kesannya kurang rapi. Kalau nanti dipakai untuk pesan gagal, ikon centang akan menyesatkan.
- Rekomendasi: `left-4 sm:left-auto`, plus ikon disembunyikan untuk pesan gagal.

**FB-4 · Tidak terverifikasi · Feedback jawaban benar/salah di Math Hero**
- Game di-host terpisah (`hilmifuadi.github.io/math-hero/mhN/`, `math-hero.astro:134`). Aku sempat masuk alur: "Mulai Baru" → isi nama (pakai "TES") → pilih karakter → level 1 tampil. Gerak karakter butuh joystick yang ditahan, dan tool-ku tidak bisa menahan input, jadi **soal matematika tidak sempat muncul**. Feedback benar/salah **tidak diaudit**. Game ini juga di luar repo Kubiko.

---

## Consistency

**Yang sudah bagus:** sistem visual (border 2 px ink, shadow brutal, pill uppercase, palet 4 warna) konsisten di kedua halaman. Lebar container `max-w-7xl` dan ritme section seragam.

**CON-1 · P0 → lihat MON-2** (status global beda antara beranda dan `/math-hero`).

**CON-2 · P2 · Pola klik kartu beda antar halaman**
- Bukti: kartu Math Hero = `<a>` penuh (`math-hero.astro:133-138`), kartu layanan = `<div>` + tombol (`ServiceCard.astro:22`).
- Dampak: pengguna yang sudah belajar "klik kartu" di `/math-hero` akan gagal melakukan hal yang sama di beranda.
- Rekomendasi: selesai bersama AFF-1.

**CON-3 · P2 · Link internal kadang buka tab baru, kadang tidak**
- Bukti: kartu Math Hero di beranda buka di tab sama (`ServiceCard.astro:18-19,136-137`), tapi baris "Math Hero" di Daftar Alamat buka **tab baru** ke `https://kubiko.my.id/math-hero` (`AccessGuide.astro:80,104-107`).
- Dampak: tab menumpuk, dan di HP tombol "kembali" tidak membawa pengguna ke portal.
- Rekomendasi: di `AccessGuide`, jangan pakai `target="_blank"` untuk route yang domainnya `kubiko.my.id/…`.

**CON-4 · P2 · Daftar layanan footer tidak lengkap**
- Bukti: `Footer.astro:53-86` hardcode 5 layanan dan tidak memuat "Permintaan Film & Serial" (`services.ts:20-32`).
- Dampak: orang yang mencari layanan dari footer tidak menemukan fitur request film. Setiap ada layanan baru, footer juga harus diedit manual.
- Rekomendasi: render dari `servicesData` (filter `!isUpcoming`).

**CON-5 · P3 · Sapaan campur "Anda" dan "-mu"**
- Bukti: "peramban Anda" (`index.astro:189`, `AccessGuide.astro:9,14,71`), sedangkan "berhitungmu", "kemampuanmu" (`math-hero.astro:18,25`).
- Dampak: nada terasa berganti-ganti antara formal dan akrab, sehingga kesan "premium dan dirawat" jadi berkurang.
- Rekomendasi: pilih satu. Untuk portal keluarga, "kamu/-mu" lebih hangat. Ini keputusan gaya (lihat plan).

**CON-6 · P3 · Ukuran titik status navbar berubah setelah script jalan**
- Bukti: markup `h-2.5 w-2.5` (`Navbar.astro:43`), script menimpa jadi `h-2 w-2` (`Layout.astro:367,371`).
- Dampak: titik status sedikit "berkedut" (mengecil) setelah data dimuat. Kecil, tapi terasa tidak rapi.
- Rekomendasi: script cukup mengganti kelas warna, bukan seluruh `className` (diselesaikan Langkah 4 di plan).

---

## Visual Hierarchy

**Yang sudah bagus:** H1 raksasa + CTA kuning langsung terbaca. Band gelap/terakota/kuning memecah halaman panjang dengan ritme yang enak. `text-balance`/`text-pretty` dipakai di heading.

**VH-1 · P1 · Beberapa pasangan warna gagal kontras WCAG AA (teks kecil)**
- Bukti [Ukur, rumus WCAG 2.x]:
  - Pill hero "PORTAL RESMI KELUARGA" cream di terakota, `text-xs`: **3,43:1** (`index.astro:23`). Pill "PANDUAN MUDAH" sama (`AccessGuide.astro:32`).
  - Paragraf band manifesto `text-[#FAF7F0]/80` di `#DE5D35`: **2,71:1** (`index.astro:221`).
  - Teks kartu manifesto `/80` di `#C84F2A`: **3,27:1** (`index.astro:232,240,248`). Label `/70`: **2,86:1** (`:230,238,246`).
  - Label "Sedang Gangguan" `text-status-offline` (#EF4444) di putih, 10 px: **3,76:1** (`Layout.astro:339`).
  - Subdomain terakota di putih, `text-xs`: **3,67:1** (`AccessGuide.astro:87`).
- Dampak: susah dibaca di HP saat siang/di luar ruangan, apalagi buat orang tua. Bertentangan langsung dengan preferensi "font jelas".
- Rekomendasi: teks kecil di atas terakota pakai ink `#161513` (4,97:1, pola yang sudah dipakai `math-hero.astro:64`). Kartu manifesto pakai latar ink. Merah label pakai `text-red-700` (6,47:1). Subdomain pakai `#B2401C` (5,76:1).

**VH-2 · P1 · Teks 9–10 px di elemen informatif**
- Bukti: `text-[9px]` label metrik (`HeroStatusCard.astro:119,126,130`). `text-[10px]` pill status, tag, "Favorit", "Segarkan", footnote (`HeroStatusCard.astro:31,50,69,88,107,136`; `ServiceCard.astro:46,57,74`; `Navbar.astro:27`).
- Dampak: justru info status (yang paling penting) ditulis paling kecil. Font mono uppercase 9–10 px sulit dibaca di HP.
- Rekomendasi: minimum 11 px untuk label dekoratif, 12 px untuk info status.

**VH-3 · P2 · Di HP, kartu layanan pertama baru muncul setelah ~3 layar**
- Bukti [Ukur] HP: kartu layanan pertama di y≈2.328 px (viewport 812 px), tinggi halaman 9.484 px (~11,7 layar). Di atasnya ada hero, kartu telemetri penuh, dan band "Fitur" yang isinya mengulang katalog.
- Dampak: tugas utama keluarga ("buka Jellyfin") butuh scroll panjang atau tap CTA dulu.
- Rekomendasi: di HP, sembunyikan band "Fitur & Utilitas" (`hidden sm:block`), karena isinya sudah ada di katalog. Pertimbangkan juga menaruh kartu telemetri setelah katalog di HP (keputusan desain).

**VH-4 · P2 · Heading serif tampil faux-bold**
- Bukti: `global.css:1` memuat DM Serif Display hanya `ital@0;1` (berat 400), tapi heading memakai `font-black` (900), misalnya `index.astro:30`, `ServiceCard.astro:70`. [Ukur]: `document.fonts` hanya memuat "DM Serif Display 400". Browser lalu men-sintesis bold, sehingga hasilnya agak "blobby" di ukuran kecil (`text-lg` di `AccessGuide.astro:68`).
- Dampak: huruf terlihat tebal buatan, dengan counter yang menyempit. Ini kebalikan dari "font jelas & premium".
- Rekomendasi: hapus `font-black` dari elemen `font-serif` (DM Serif memang sudah tebal), atau ganti ke serif yang punya berat 900 (keputusan pengguna, karena mengubah semua heading).

---

## Cognitive Load

**Yang sudah bagus:** tiap kartu punya struktur sama (tag → judul → deskripsi → 2–3 spec → aksi), jadi gampang dipindai.

**CL-1 · P2 · Badge "Favorit" di 6 dari 7 kartu**
- Bukti: `featured: true` di `services.ts:17,31,45,60,75,87`; dirender `ServiceCard.astro:73-78`. [Layar-D] terlihat di semua kartu kecuali Zona Game Santai.
- Dampak: penanda yang ada di semua item jadi noise dan tidak membantu memilih.
- Rekomendasi: hapus badge-nya, atau batasi ke 1–2 layanan (keputusan pengguna).

**CL-2 · P2 · Jargon teknis di portal untuk keluarga**
- Bukti: "TELEMETRI SISTEM" (`HeroStatusCard.astro:19`), "Koneksi … ms" (`:119-122`, sebenarnya ping server ke layanan, bukan koneksi pengguna), "v1.0 • SSG Powered" (`Footer.astro:37`), "Status Uptime Kuma" (`Footer.astro:122`), "Terhubung Jellyfin" (`services.ts:28`).
- Dampak: orang tua/anak tidak paham istilahnya, dan "Koneksi" menyiratkan koneksi internet mereka sendiri.
- Rekomendasi: "STATUS LAYANAN", "Respons server", "Status Layanan". Hapus "SSG Powered".

**CL-3 · P3 · "100% Bebas Iklan" diulang ≥10×**
- Bukti: `index.astro:42,81,231`; footer tiap kartu `ServiceCard.astro:130-132`; `HeroStatusCard.astro:130-131`; `Footer.astro:97`; `math-hero.astro:179`.
- Dampak: pesan yang diulang terus berhenti dibaca, dan ruang yang bisa dipakai untuk info berguna terbuang.
- Rekomendasi: cukup di hero + manifesto. Footer kartu bisa diisi info yang berguna (mis. "Perlu akun" / "Tanpa akun").

---

## Onboarding

**Yang sudah bagus:** seksi "Cara Menggunakan Layanan" 3 langkah (`AccessGuide.astro:5-21`) ringkas, dan saran "simpan di bookmark" (`:71`) itu praktis.

**ONB-1 · P1 · "Masuk dengan akun" tanpa penjelasan cara dapat akun**
- Bukti: `AccessGuide.astro:12-15` "Gunakan akun yang telah didaftarkan…". Tidak ada info siapa yang mendaftarkan, apakah satu akun untuk semua layanan, atau layanan mana yang tanpa akun (PDF, Math Hero).
- Dampak: anggota keluarga baru langsung mentok di halaman login Jellyfin/Nextcloud.
- Rekomendasi: langkah 02 ditulis ulang dengan info nyata + link kontak (butuh keputusan pengguna).

**ONB-2 · P2 · Cara masuk server Minecraft tidak lengkap**
- Bukti: spec "Mendukung Java & Bedrock" (`services.ts:71`), tapi yang disalin hanya `crafty.kubiko.my.id` (`:74`). Tidak ada port, dan tidak ada langkah "Multiplayer → Add Server". Tombol panah di kartu membuka `https://crafty.kubiko.my.id` (`:66`), yang dari namanya kemungkinan panel admin Crafty Controller, bukan sesuatu yang perlu dibuka pemain (belum diverifikasi).
- Dampak: pemain Bedrock (HP/konsol) kemungkinan besar gagal konek. Anak yang mengetuk panah bisa nyasar ke halaman login panel.
- Rekomendasi: tambah alamat/port Java & Bedrock dan 2 langkah singkat (keputusan pengguna soal port dan apakah panel boleh ditautkan).

**ONB-3 · P3 · Penamaan level Math Hero "Pemula" vs "Mudah" ambigu**
- Bukti: `math-hero.astro:10,17`.
- Dampak: orang tua tidak tahu level mana yang cocok untuk anaknya tanpa membaca meter kecil di header kartu.
- Rekomendasi: tambahkan saran umur/kelas (keputusan konten).

---

## Progressive Disclosure

**Yang sudah bagus:** filter kategori menyaring katalog tanpa reload. Status detail diserahkan ke halaman status terpisah.

**PD-1 · P2 · Daftar layanan yang sama muncul 4×**
- Bukti: kartu telemetri (4 layanan, `HeroStatusCard.astro:36-114`), band Fitur (4 pilar, `index.astro:123-169`), katalog (7 kartu, `index.astro:200-204`), Daftar Alamat Web (7 baris, `AccessGuide.astro:78-119`), ditambah footer (5 link).
- Dampak: halaman HP jadi ~11,7 layar. Pengguna melihat ulang hal yang sama dan sulit tahu mana "tempat utama".
- Rekomendasi: jadikan katalog sumber utama. Band Fitur disembunyikan di HP (VH-3). Daftar Alamat Web boleh tetap ada (fungsinya beda: salin/bookmark).

**PD-2 · P3 · Uptime 24 jam dihitung tapi tidak ditampilkan**
- Bukti: `Layout.astro:350-355` menghitung `uptimeTotal`, tapi nilainya tidak dipakai di mana pun. [Ukur]: uptime 24 jam monitor asli ~61%.
- Dampak: tidak ada dampak langsung ke pengguna. Ini kode mati yang bikin script lebih sulit dipahami.
- Rekomendasi: hapus kode mati itu, atau tampilkan di halaman status saja (keputusan pengguna: apakah angka 61% mau diperlihatkan).

---

## Breadcrumb

Situs cuma 2 halaman dengan kedalaman 1. Breadcrumb formal **tidak dibutuhkan**. `/math-hero` sudah punya tombol "Kembali ke Portal" yang besar dan jelas (`math-hero.astro:54-60`, [Layar-D] & [Layar-HP]), dan logo navbar kembali ke beranda (`Navbar.astro:12-16`).

**BC-1 · P3 · Navbar tidak menandai halaman aktif**
- Bukti: di `/math-hero`, link navbar semuanya anchor beranda (`Navbar.astro:51-80`) tanpa `aria-current`.
- Dampak: minimal. Dengan 2 halaman, orientasi sudah jelas dari judul besar dan tombol kembali.
- Rekomendasi: tidak perlu breadcrumb. Cukup biarkan. Kalau nanti halaman bertambah, tambahkan `aria-current="page"`.

---

## Overall design pattern

### Navigation Pattern

**Yang sudah bagus:** skip link "Loncat ke konten utama" bekerja dan terlihat saat Tab ([Layar-D]). Focus ring tampak jelas di semua kontrol yang kucoba. Menu HP bisa ditutup dengan Esc dan `aria-expanded` sinkron (`Navbar.astro:145-167`). Anchor punya `scroll-mt`.

**NAV-1 · P2 · Navbar sesak di 1024 px**
- Bukti: [Layar-D] 1024 px: "ALAMAT WEB" dan "STATUS SISTEM" patah dua baris, dan badge "2 LAYANAN TERKENDALA" patah dua baris. Nav tampil mulai `md` (`Navbar.astro:50`) bersama badge (`:37`) dan tombol kuning (`:89`).
- Dampak: header terlihat berantakan di laptop kecil/tablet landscape. Ini kesan pertama yang paling sering terlihat.
- Rekomendasi: nav tampil mulai `lg`, tombol kuning hanya `xl`, tambah `whitespace-nowrap` di link dan badge.

**NAV-2 · P2 · Kelas Tailwind tidak ada: `h-18`, `sm:py-18`**
- Bukti: Tailwind 3.4 tidak punya spacing `18` (`tailwind.config.mjs` tidak menambahkannya). [Ukur] HP: tinggi bar navbar 48 px (bukan 72). Tombol menu 44 px hampir menyentuh garis bawah ([Layar-HP]). `#fitur` padding 56 px di desktop (bukan 72) (`index.astro:104`).
- Dampak: header HP terasa sempit dan tidak sesuai desain. Ritme vertikal band hitam juga lebih rapat dari yang dimaksud.
- Rekomendasi: `h-[72px]` dan `sm:py-[72px]`.

**NAV-3 · P3 · Urutan navbar tidak sama dengan urutan halaman**
- Bukti: navbar "Layanan, Fitur, …" (`Navbar.astro:51-62`), padahal di halaman "Fitur" (#fitur) ada di atas "Layanan" (#services) (`index.astro:104,176`). "Panduan" dan "Alamat Web" menunjuk ke seksi yang sama (`AccessGuide.astro:24,64`).
- Dampak: klik "Layanan" lalu "Fitur" membuat halaman meloncat mundur. Ada dua item menu yang mendarat di tempat hampir sama.
- Rekomendasi: urutkan sesuai halaman. Opsional: gabung Panduan + Alamat Web.

### Workflow & Productivity Patterns

**Yang sudah bagus:** salin alamat 1-klik plus toast. Filter tersimpan di URL. Tombol "Buka" per baris di Daftar Alamat. Target sentuh utama 44 px.

**WF-1 · P1 → lihat FB-1** (salin rapuh di in-app browser).

**WF-2 · P3 · Di HP, tombol salin di Daftar Alamat hanya ikon dan nama layanan terpotong**
- Bukti: `AccessGuide.astro:102` `copy-label hidden sm:inline`. Nama `truncate` (`:84`). [Layar-HP]: "Permintaan Film & S…", "Server Game Minec…".
- Dampak: nama layanan terpotong, jadi pengguna menebak baris mana yang dimaksud.
- Rekomendasi: biarkan nama wrap (`break-words` alih-alih `truncate`). Ikon salin sudah ber-`aria-label`.

**WF-3 · P3 · Tap target link footer cuma 15 px**
- Bukti: [Ukur] HP: tinggi link footer 15 px (`Footer.astro:44-49,55-86`, `text-xs`).
- Dampak: mudah salah ketuk di HP, apalagi buat jari orang tua.
- Rekomendasi: `inline-block py-1.5` di link footer.

### Monitoring & Observability Patterns

**Yang sudah bagus (niatnya):** ada proxy `/api/status-page/*` agar tidak kena CORS (`Caddyfile.example`). Ada polling 60 detik dan tombol segarkan. Pencocokan monitor lewat keyword. Data asli memang tersambung di produksi ([Ukur]: 200 dengan 4 monitor).

**MON-1 · P0 · Data contoh ditampilkan sebagai data asli saat API gagal**
- Bukti: `Layout.astro:243-253` memuat `/mock-status.json` bila semua slug gagal. Isi mock = semua `status: 1` (`public/mock-status.json:2-24`). Lalu UI menulis "Semua Layanan Siap", "Semua Normal", dan "Terakhir dicek pukul … WIB" (`Layout.astro:358-402`). [Layar-HP] + [Ukur]: API 502, `mock-status.json` termuat (performance entries), Minecraft "Siap Digunakan" dan Zona Game Santai (belum rilis) "Siap Digunakan". Dua menit sebelumnya API asli bilang Minecraft down.
- Dampak: keluarga diberi tahu "semua siap" tepat saat monitoring mati, padahal itu momen yang paling mungkin ada masalah. Kepercayaan ke fitur status hancur setelah sekali ketahuan.
- Rekomendasi: mock hanya untuk `localhost`. Di produksi, kegagalan = state "Status tidak tersedia" (kuning/abu), bukan hijau.

**MON-2 · P0 · Hitungan gangguan salah dan beda per halaman**
- Bukti:
  - Hitungan dilakukan per **kartu** (`Layout.astro:284-319`), bukan per monitor.
  - `game-hub` (`isUpcoming`) jatuh ke `uptimeKumaMonitorId: 5` (`services.ts:99`). Di produksi, id 5 adalah "Minecraft Server", sehingga monitor yang sama dihitung 2× ([Layar-D]: "2 LAYANAN TERKENDALA" padahal [Ukur] hanya monitor 5 yang down; kartu Zona Game Santai "Sedang Gangguan").
  - Di `/math-hero` tidak ada `.service-card`, jadi `offlineCount` selalu 0 ([Layar-D] `/math-hero`: "SEMUA LAYANAN SIAP" di saat yang sama).
- Dampak: angka dan status saling bertentangan. Layanan yang belum ada dilaporkan "gangguan".
- Rekomendasi: hitung dari `heartbeatList` langsung (per monitor), lewati kartu `isUpcoming`, dan betulkan ID monitor di data (MON-9).

**MON-3 · P1 · Kartu "Telemetri Sistem" di hero hampir semuanya hardcode**
- Bukti: pill "Online" statis di `HeroStatusCard.astro:50-53,69-72,88-91`. `#hero-home-status` di baris Minecraft (`:109`) diisi status **global** "Normal/Sebagian Offline" (`Layout.astro:387-390`), di dalam pill yang selalu hijau. "Kondisi" `text-emerald-800` statis (`HeroStatusCard.astro:127`) walau isinya "2 Gangguan". [Layar-D]: Film/Berkas/PDF "ONLINE", Minecraft "SEBAGIAN OFFLINE" hijau, Kondisi "2 Gangguan" hijau.
- Dampak: kartu paling mencolok di hero menampilkan info yang salah dan saling bertentangan (hijau tapi "Offline", "2 Gangguan" berwarna hijau).
- Rekomendasi: tiap baris diberi `data-hero-service` lalu diisi dari status kartu yang sama. Warna mengikuti state.

**MON-4 · P1 · Status di menu HP tidak pernah diperbarui**
- Bukti: "Status Layanan: Normal" + titik hijau berdenyut hardcode (`Navbar.astro:124-128`), dan tidak disentuh script. Di HP, badge navbar disembunyikan (`hidden md:inline-flex`, `:37`), jadi menu inilah satu-satunya indikator status di navbar. [Layar-HP]: tertulis "STATUS LAYANAN: NORMAL".
- Dampak: mayoritas keluarga (pengguna HP) selalu melihat "Normal" walaupun ada gangguan.
- Rekomendasi: beri id/kelas yang sama dengan badge desktop dan update bersamaan.

**MON-5 · P2 · Request status tanpa timeout**
- Bukti: `fetch` tanpa `signal` (`Layout.astro:223-226`). [Ukur] HP: request `/heartbeat/default` menggantung. Selama itu UI terjebak di state awal (yang hijau, lihat FB-2).
- Dampak: saat server status lambat, UI tidak pernah keluar dari state awal, dan tombol "Segarkan" terasa tidak berbuat apa-apa.
- Rekomendasi: `AbortSignal.timeout(5000)` bila tersedia.

**MON-6 · P2 · "WIB" ditulis mati, jam memakai zona waktu perangkat**
- Bukti: `Layout.astro:394-401` `Intl.DateTimeFormat('id-ID', {…})` tanpa `timeZone`, lalu ditempel " WIB".
- Dampak: keluarga di WITA/WIT atau luar negeri melihat jam lokal berlabel WIB.
- Rekomendasi: `timeZone: 'Asia/Jakarta'`.

**MON-7 · P2 · Layanan tanpa monitor tetap tampil "Aktif" hijau berdenyut**
- Bukti: `seerr` tidak punya monitor id (`services.ts:29`) dan tidak ada monitor bernama seerr/request di produksi ([Ukur] daftar monitor: Minecraft Server, Nextcloud, Jellyfin, Stirling PDF), jadi label default "Aktif" + ping hijau bertahan (`ServiceCard.astro:59-63`). Math Hero juga sama.
- Dampak: klaim "aktif" tanpa data. Kalau Seerr mati, portal tetap bilang aktif.
- Rekomendasi: tampilkan "Tidak dipantau" netral. Untuk Math Hero (halaman internal) pill status tidak perlu.

**MON-9 · P2 · ID monitor di `services.ts` tidak cocok dengan Uptime Kuma produksi**
- Bukti: [Ukur] `/api/status-page/family` berisi monitor `1:Jellyfin`, `2:Nextcloud`, `3:Stirling PDF`, `5:Minecraft Server`. Di `services.ts:72` crafty memakai `uptimeKumaMonitorId: 4` (tidak ada), sedangkan `:99` game-hub (belum rilis) memakai `5`. Inilah akar dobel hitung di MON-2.
- Dampak: kartu Minecraft hanya benar kalau request daftar monitor (`/api/status-page/family`) berhasil dan keyword cocok. Kalau request itu gagal tapi heartbeat berhasil, kartu Minecraft jadi "tidak dipantau" padahal monitornya ada.
- Rekomendasi: crafty → `5`, hapus `uptimeKumaMonitorId` dari game-hub. Cek ulang ID di produksi sebelum mengedit.

**MON-8 · P3 · Keyword `mc` terlalu longgar**
- Bukti: `services.ts:73` `['crafty','minecraft','mc']`, dicocokkan `includes` (`Layout.astro:296-299`). Monitor bernama mis. "NextCloud MCP" akan dianggap Minecraft.
- Dampak: berpotensi salah cocok, sehingga status layanan lain menempel di kartu Minecraft (belum terjadi saat audit).
- Rekomendasi: hapus `'mc'`.

### Communication Patterns

**Yang sudah bagus:** nada copy hangat dan kekeluargaan ("Dirancang dengan Tujuan, Dirawat dengan Hati"). Toast pakai `aria-live`.

**COM-1 · P1 · Tidak ada kanal kontak pengelola sama sekali**
- Bukti: teks "hubungi pengelola" (`index.astro:283`), langkah "akun yang telah didaftarkan" (`AccessGuide.astro:14`), tapi tidak ada link WhatsApp/email/telepon di seluruh `src/` (footer hanya GitHub, `Footer.astro:28-36`).
- Dampak: semua kebutuhan bantuan (akun baru, lupa sandi, request layanan) buntu.
- Rekomendasi: tambah tombol kontak di band bantuan dan footer. Kanal dan alamatnya **keputusan pengguna**.

**COM-2 · P2 · Preview link di WhatsApp kemungkinan tanpa gambar, dan og:url salah di /math-hero**
- Bukti: `og:image` = `/favicon.svg` relatif (`Layout.astro:35`). SVG umumnya tidak didukung sebagai gambar preview oleh WhatsApp/Facebook (tidak diuji langsung). `og:url` statis `https://kubiko.my.id` juga di `/math-hero` (`Layout.astro:32`).
- Dampak: link yang dibagikan di grup keluarga tampil polos tanpa gambar, sehingga kurang mengundang diklik. Preview link `/math-hero` juga menunjuk ke beranda.
- Rekomendasi: og:url dinamis (bisa langsung). Untuk og:image, buat PNG 1200×630 absolut (butuh aset, jadi keputusan pengguna).

**COM-3 · P3 · Pesan gagal tidak ada sama sekali** (gagal salin → FB-1; status gagal → MON-1).

### Content & Information Patterns

**Yang sudah bagus:** data layanan terpusat di `services.ts`. `translate="no"` di nama merek dan domain. Deskripsi layanan pendek dan konkret.

**CNT-1 · P2 · Satu sumber data tidak dipakai konsisten**
- Bukti: hero telemetri (`HeroStatusCard.astro`), pilar Fitur (`index.astro:125-167`), dan footer (`Footer.astro:56-85`) hardcode nama layanan sendiri. Nama juga beda-beda: "Penyimpanan Berkas" vs "Penyimpanan Berkas & Foto" (`services.ts:35` vs `:108`), "Pengolah PDF" vs "Pengolah Dokumen PDF" vs "Alat Pengolah PDF".
- Dampak: satu layanan punya 3 nama berbeda di satu halaman, sehingga pengguna ragu apakah itu layanan yang sama.
- Rekomendasi: footer dirender dari `servicesData` (langkah di plan). Sisanya cukup diseragamkan namanya.

**CNT-2 · P3 · Kode/markup sisa**
- Bukti: `</Layout>` dobel (`index.astro:311-313`; build tetap lolos, tapi rapuh), import `Sparkles` tak terpakai (`index.astro:8`), `siteConfig.statusPageSlugs` tidak dipakai karena script hardcode slug (`services.ts:122` vs `Layout.astro:216`), `isQuickAction` tidak dipakai.
- Dampak: tidak terlihat oleh pengguna, tapi rawan bikin build gagal di versi Astro berikutnya.
- Rekomendasi: bersihkan `</Layout>` dobel dan import.

**CNT-3 · P3 · Zona Game Santai "Segera" tapi tombolnya membuka subdomain**
- Bukti: `services.ts:93,101`, tombol "Lihat Info" ke `https://game.kubiko.my.id` (`ServiceCard.astro:134-141`). Belum dicek apakah subdomain itu hidup.
- Dampak: kalau subdomain belum hidup, pengguna mendarat di halaman error.
- Rekomendasi: kalau belum hidup, tombol jadi non-link "Segera Hadir" (keputusan pengguna).

---

## Tabel gabungan (urut prioritas)

| ID | Prio | Butir | Ringkas | Bukti utama |
|---|---|---|---|---|
| MON-1 | P0 | Monitoring | Mock tampil sebagai data asli saat API gagal | `Layout.astro:243-253`; [Layar-HP] |
| MON-2 | P0 | Monitoring/Consistency | Hitungan gangguan dobel & beda per halaman | `Layout.astro:284-319`, `services.ts:99`; [Layar-D] |
| MON-3 | P1 | Monitoring | Kartu telemetri hero hardcode/kontradiktif | `HeroStatusCard.astro:50-127`; [Layar-D] |
| MON-4 | P1 | Monitoring | Status menu HP hardcode "Normal" | `Navbar.astro:124-128`; [Layar-HP] |
| FB-1 | P1 | Feedback/Workflow | Gagal salin diam saja | `Layout.astro:173-203`; [Layar-D] console |
| FB-2 | P1 | Feedback | State awal mengklaim "Normal/Aktif" | `Navbar.astro:45`, `ServiceCard.astro:63` |
| AFF-1 | P1 | Affordance | Kartu tampak bisa diklik tapi bukan link | `ServiceCard.astro:22-23`, `index.astro:189` |
| AFF-2 | P1 | Affordance | Label tab aktif hilang saat hover (1,10:1) | `Layout.astro:84-93`; [Layar-D] |
| CTA-1 | P1 | CTA | Band bantuan tanpa tombol kontak | `index.astro:280-304` |
| COM-1 | P1 | Communication | Tidak ada kanal kontak | seluruh `src/` |
| ONB-1 | P1 | Onboarding | Cara dapat akun tak dijelaskan | `AccessGuide.astro:12-15` |
| VH-1 | P1 | Visual Hierarchy | Kontras gagal AA (2,71–3,76:1) | `index.astro:23,221,230-248` dll. |
| VH-2 | P1 | Visual Hierarchy | Teks status 9–10 px | `HeroStatusCard.astro:119-136` dll. |
| CTA-2 | P2 | CTA | Link "Status Sistem" ×5 | `Navbar.astro:33,85` dll. |
| DIS-1 | P2 | Discoverability | Tab filter tersembunyi di HP | `CategoryFilter.astro:26`; [Ukur] |
| CON-2 | P2 | Consistency | Pola klik kartu beda antar halaman | `math-hero.astro:133` vs `ServiceCard.astro:22` |
| CON-3 | P2 | Consistency | Route internal buka tab baru di Daftar Alamat | `AccessGuide.astro:104-107` |
| CON-4 | P2 | Consistency | Footer tanpa "Permintaan Film & Serial" | `Footer.astro:53-86` |
| VH-3 | P2 | Visual Hierarchy | Kartu pertama di HP setelah ~3 layar | [Ukur] y≈2.328 px |
| VH-4 | P2 | Visual Hierarchy | DM Serif faux-bold | `global.css:1`; [Ukur] fonts |
| CL-1 | P2 | Cognitive Load | "Favorit" di 6/7 kartu | `services.ts`; `ServiceCard.astro:73-78` |
| CL-2 | P2 | Cognitive Load | Jargon teknis | `HeroStatusCard.astro:19`, `Footer.astro:37,122` |
| ONB-2 | P2 | Onboarding | Info koneksi Minecraft kurang | `services.ts:66-74` |
| PD-1 | P2 | Progressive Disclosure | Daftar layanan muncul 4× | `index.astro`, `AccessGuide.astro` |
| NAV-1 | P2 | Navigation | Navbar patah baris di 1024 px | `Navbar.astro:37,50,89`; [Layar-D] |
| NAV-2 | P2 | Navigation | `h-18`/`sm:py-18` tidak ada | `Navbar.astro:8`, `index.astro:104`; [Ukur] |
| MON-5 | P2 | Monitoring | Fetch tanpa timeout | `Layout.astro:223-226`; [Ukur] |
| MON-6 | P2 | Monitoring | "WIB" tanpa `timeZone` | `Layout.astro:394-401` |
| MON-7 | P2 | Monitoring | Layanan tak dipantau tetap "Aktif" hijau | `ServiceCard.astro:59-63`, `services.ts:29` |
| MON-9 | P2 | Monitoring | ID monitor di data tidak cocok produksi | `services.ts:72,99`; [Ukur] |
| COM-2 | P2 | Communication | og:image SVG, og:url statis | `Layout.astro:32,35` |
| CNT-1 | P2 | Content | Nama layanan tidak seragam / hardcode | `Footer.astro`, `services.ts:105-113` |
| AFF-3 | P3 | Affordance | Baris hero ikut terangkat saat hover | `HeroStatusCard.astro:39,58,77,96` |
| DIS-2 | P3 | Discoverability | Math Hero tak disebut di hero/nav | `index.astro:53` |
| FB-3 | P3 | Feedback | Toast HP menempel tepi kiri; ikon selalu centang | `Toast.astro:7,11-13`; [Ukur] |
| CON-5 | P3 | Consistency | "Anda" vs "-mu" | `index.astro:189`, `math-hero.astro:18` |
| CON-6 | P3 | Consistency | Ukuran titik status berubah | `Navbar.astro:43`, `Layout.astro:367` |
| CL-3 | P3 | Cognitive Load | "100% Bebas Iklan" ≥10× | banyak |
| ONB-3 | P3 | Onboarding | "Pemula" vs "Mudah" ambigu | `math-hero.astro:10,17` |
| PD-2 | P3 | Progressive Disclosure | Uptime dihitung tak dipakai | `Layout.astro:350-355` |
| BC-1 | P3 | Breadcrumb | Tidak ada `aria-current` (belum perlu) | `Navbar.astro:51-80` |
| NAV-3 | P3 | Navigation | Urutan nav ≠ urutan halaman | `Navbar.astro:51-62` |
| WF-2 | P3 | Workflow | Nama di Daftar Alamat terpotong di HP | `AccessGuide.astro:84,102`; [Layar-HP] |
| WF-3 | P3 | Workflow | Link footer 15 px | [Ukur] |
| MON-8 | P3 | Monitoring | Keyword `mc` terlalu longgar | `services.ts:73` |
| CNT-2 | P3 | Content | `</Layout>` dobel, import mati | `index.astro:8,313` |
| CNT-3 | P3 | Content | "Segera" tapi tombol ke subdomain | `services.ts:93,101` |

(CON-1, WF-1, COM-3 adalah rujukan silang ke MON-2, FB-1, MON-1/FB-1 dan tidak dihitung ganda.)

---

## Yang tidak diverifikasi

- Jawaban benar/salah di Math Hero (lihat FB-4). Game di luar repo ini.
- Apakah `nonton.`, `request.`, `files.`, `pdf.`, `crafty.`, `game.kubiko.my.id` benar-benar hidup, dan isi `status.kubiko.my.id`. Tidak dibuka, supaya tidak menyentuh halaman login.
- Klik filter di HP (yang diuji di desktop). Toast di HP diukur posisinya, tapi tidak dilihat utuh di screenshot.
- Preview link WhatsApp (COM-2 disimpulkan dari format SVG).
- Viewport desktop lebar (≥1280 px). Yang dicek hanya 1024 px.
- Build lokal tidak dijalankan (audit ini read-only; build menulis `dist/`).
