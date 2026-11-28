# UX Action Plan — Kubiko Portal

Dokumen ini untuk dieksekusi model lain (mis. Sonnet) **tanpa konteks tambahan**. Temuan lengkap dan buktinya ada di `docs/ux-audit.md` (ID temuan seperti `MON-1` merujuk ke sana).

## 0. Konteks & aturan main

**Proyek.** Kubiko Portal (`kubiko.my.id`) adalah portal statis untuk keluarga: Astro (SSG) + Tailwind CSS 3.4 + `lucide-astro`, bergaya neo-brutalist (border ink `#161513` 2 px, shadow `shadow-brutal*`, palet cream `#FAF7F0`, kuning `#EAA838`, terakota `#DE5D35`). Isinya 2 halaman:
- `src/pages/index.astro` (beranda + katalog layanan)
- `src/pages/math-hero.astro` (daftar level game; game-nya sendiri di-host di `hilmifuadi.github.io`, di luar repo ini)

Semua JavaScript klien (filter, salin, status) ada di `<script is:inline>` di `src/layouts/Layout.astro`, kecuali toggle menu (`Navbar.astro`) dan toast (`Toast.astro`). Status layanan diambil dari Uptime Kuma lewat proxy Caddy `/api/status-page/*`, yang **hanya ada di produksi**. Di `astro dev` request itu 404.

**Remote.**
- `upstream` = `muhaliakbar14-cyber/kubiko`. Branch `main` di sini **auto-deploy ke produksi**.
- `origin` = fork `hilmifuadi/kubiko`.

> ⚠️ **PERINGATAN.** `.github/workflows/ci.yml` menjalankan `npm ci` + `npm run build` di setiap PR. Pada **push ke `main`**, workflow itu juga langsung `rsync` `dist/` ke VPS produksi, lalu mengecek `https://kubiko.my.id/math-hero` mengandung teks `4 Tantangan Menanti`.
> - Jangan push/merge ke `main` upstream tanpa izin eksplisit pengguna.
> - Jangan push ke remote mana pun atau buka PR tanpa izin pengguna.
> - **Jangan ubah teks `4 Tantangan Menanti`** di `math-hero.astro`, karena cek pasca-deploy di CI bergantung padanya.

### Persiapan (sekali)

Folder repo utama dipakai bersama sesi lain. **Jangan** checkout/switch/stash di sana. Kerjakan di worktree terpisah:

Jalankan dari root repo:

```bash
git fetch upstream
git worktree add ../kubiko-ux -b ux/audit-fixes upstream/main
cd ../kubiko-ux
node -v          # harus >= 22 (CI pakai Node 22; upstream memakai astro 7.4.13)
npm ci
npx astro build  # baseline harus lolos sebelum mengubah apa pun
```

- **Windows:** jangan pakai `npm run build`/`npm run dev`, karena script-nya memakai prefix env gaya POSIX (`ASTRO_TELEMETRY_DISABLED=1 astro …`) yang gagal di cmd/PowerShell. Pakai `npx astro build` dan `npx astro dev`.
- File plan ini dan `docs/ux-audit.md` sudah ada di `upstream/main`, jadi ikut tersedia di worktree (folder `docs/`).
- Semua path di bawah relatif ke root worktree (`../kubiko-ux`).

### Cara verifikasi umum (dipakai di setiap langkah)

1. `npx astro build` harus selesai tanpa error.
2. `npx astro dev`, lalu buka `http://localhost:4321/` dan `http://localhost:4321/math-hero`.
3. Cek di DevTools dengan dua ukuran: **desktop** (≥1280 px, dan 1024 px bila langkahnya menyebut) dan **HP** (Device Toolbar → 375×812).
4. Console tidak boleh ada error baru. Request `/api/status-page/...` yang 404 di localhost itu **wajar**.

### Aturan edit

- Cari teks lama **persis** seperti dikutip. Nomor baris hanya petunjuk karena bergeser.
- Beberapa baris di repo punya **spasi di akhir baris** (mis. `<a ` di Navbar/ServiceCard). Kalau `old_string` gagal cocok, cek trailing space.
- Class Tailwind yang dipakai di JavaScript harus ditulis sebagai **string literal lengkap** (Tailwind memindai `src/**/*.astro`, termasuk isi script).
- Jangan tambah dependensi. Jangan ubah `package.json`, `astro.config.mjs`, `.github/`.
- Satu commit per langkah (pesan singkat, mis. `fix(status): …`), **commit lokal saja**.

### Urutan & dependensi

Langkah 1–3 menyiapkan markup yang dibaca script baru di Langkah 4, jadi **1–4 wajib berurutan**. Langkah 5–13 saling bebas, tapi ikuti urutan nomor supaya kutipan teks lama tetap cocok (Langkah 7 & 12 menyentuh `ServiceCard.astro` setelah Langkah 1; Langkah 8, 9, 13 menyentuh `index.astro`; Langkah 11 & 12 menyentuh `Footer.astro`).

---

## Langkah 1 — Pill status kartu: netral, tanpa klaim palsu

**Menyelesaikan:** MON-7, FB-2 (sebagian), VH-2 (sebagian). Persiapan MON-1/MON-2.
**File:** `src/components/ServiceCard.astro`

1a. Di frontmatter, setelah baris `const isInternal = service.url.startsWith('/');`, tambahkan:

```ts
// Pill status hanya untuk layanan yang dipantau Uptime Kuma, atau yang belum rilis
const isMonitored = Boolean(service.uptimeKumaMonitorId || service.uptimeKumaKeywords?.length);
```

1b. Di `<div` pembuka kartu (yang punya `data-keywords=`), tambahkan atribut setelah baris `data-keywords={…}`:

```astro
  data-upcoming={service.isUpcoming ? 'true' : undefined}
```

1c. Ganti seluruh blok pill. Cari:

```astro
      <!-- Live Status Pill -->
      <div 
        class="service-status-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white border border-[#161513] text-[#161513] shadow-brutal-sm"
      >
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="status-pulse-ring animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75"></span>
          <span class="status-dot relative inline-flex rounded-full h-2 w-2 bg-status-online"></span>
        </span>
        <span class="status-label">{service.isUpcoming ? 'Segera' : 'Aktif'}</span>
      </div>
```

Ganti dengan:

```astro
      <!-- Live Status Pill (diisi script status di Layout.astro) -->
      {(isMonitored || service.isUpcoming) && (
        <div
          class="service-status-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white border border-[#161513] text-[#161513] shadow-brutal-sm"
        >
          <span class="relative flex h-2 w-2" aria-hidden="true">
            <span class="status-pulse-ring hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8A29E] opacity-75"></span>
            <span class={`status-dot relative inline-flex rounded-full h-2 w-2 ${service.isUpcoming ? 'bg-status-warning' : 'bg-[#A8A29E]'}`}></span>
          </span>
          <span class="status-label text-[#6B655D]">{service.isUpcoming ? 'Segera' : 'Memeriksa…'}</span>
        </div>
      )}
```

1d. Ganti `text-[10px]` → `text-[11px]` pada tag kartu. Cari `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-[#161513] bg-[#F2ECE1]` dan ubah `text-[10px]` jadi `text-[11px]`.

**Verifikasi:** `npx astro build` lolos. Di `/` (sebelum Langkah 4), kartu Math Hero **tidak punya** pill status. Zona Game Santai: pill "SEGERA" dengan titik kuning, tanpa denyut. Kartu lain: "MEMERIKSA…" abu-abu (nanti diisi Langkah 4).

---

## Langkah 2 — Kartu status di hero: per layanan, bukan hardcode

**Menyelesaikan:** MON-3, FB-2, CL-2 (sebagian), VH-2, AFF-3.
**File:** `src/components/HeroStatusCard.astro`

2a. Cari `TELEMETRI SISTEM` dan ganti jadi `STATUS LAYANAN`.

2b. Cari `<span class="font-mono uppercase text-[10px] tracking-wider">Segarkan</span>` dan ubah `text-[10px]` jadi `text-[11px]`.

2c. Ganti **seluruh** blok mulai baris `<!-- Service Status List (Editorial Card Rows) -->` sampai **sebelum** baris `<!-- Telemetry Metrics Bar (Editorial 3-Col Box) -->` dengan:

```astro
    <!-- Service Status List: tiap pill diisi script status (data-hero-service = id di services.ts) -->
    <div class="mt-4 space-y-2.5">
      {[
        { id: 'jellyfin', name: 'Nonton Film & Video', note: 'Streaming tanpa jeda iklan', Icon: Film, tone: 'text-[#DE5D35]' },
        { id: 'nextcloud', name: 'Penyimpanan Berkas', note: 'Foto liburan & dokumen', Icon: HardDrive, tone: 'text-[#EAA838]' },
        { id: 'stirling-pdf', name: 'Pengolah Dokumen PDF', note: 'Gabung & perkecil berkas', Icon: FileText, tone: 'text-[#161513]' },
        { id: 'crafty', name: 'Server Minecraft', note: 'Dunia survival keluarga', Icon: Gamepad2, tone: 'text-[#DE5D35]' },
      ].map(({ id, name, note, Icon, tone }) => (
        <div class="p-3 rounded-2xl bg-white border-2 border-[#161513] flex items-center justify-between gap-3 shadow-brutal-sm">
          <div class="flex items-center gap-3 min-w-0">
            <div class={`w-9 h-9 shrink-0 rounded-xl bg-[#FAF7F0] border border-[#161513] flex items-center justify-center ${tone}`}>
              <Icon class="w-4 h-4" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <div class="font-bold text-xs sm:text-sm text-[#161513]">{name}</div>
              <p class="text-[#6B655D] text-[11px]">{note}</p>
            </div>
          </div>
          <span data-hero-service={id} class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase whitespace-nowrap bg-white text-[#161513] border border-[#161513]">
            <span class="status-dot w-1.5 h-1.5 rounded-full bg-[#A8A29E]" aria-hidden="true"></span>
            <span class="status-label text-[#6B655D]">Memeriksa…</span>
          </span>
        </div>
      ))}
    </div>

```

(Ikon `Film, HardDrive, FileText, Gamepad2` sudah di-import di frontmatter. Jangan ubah import.)

2d. Di blok metrik, ganti ketiga `text-[9px]` jadi `text-[11px]` (replace all di file ini; hanya ada 3).

2e. Cari `<div class="text-[11px] font-mono font-bold uppercase text-[#6B655D]">Koneksi</div>` (sudah 11px setelah 2d) dan ganti teks `Koneksi` jadi `Respons Server`.

2f. Cari `<span id="hero-ping-val" class="font-mono tabular-nums">Lancar</span>` dan ganti jadi `<span id="hero-ping-val" class="font-mono tabular-nums">—</span>`.

2g. Cari:

```astro
        <div class="text-xs font-bold text-emerald-800 mt-0.5 tabular-nums" id="hero-active-val">Semua Normal</div>
```

Ganti dengan:

```astro
        <div class="text-xs font-bold text-[#6B655D] mt-0.5 tabular-nums" id="hero-active-val">Memeriksa…</div>
```

2h. Cari `<div class="mt-3 text-right font-mono text-[10px] text-[#6B655D]" id="hero-last-checked">` dan ubah `text-[10px]` jadi `text-[11px]`.

**Verifikasi:** build lolos. Di `/`, kartu hero berjudul "STATUS LAYANAN". 4 baris pill "MEMERIKSA…" abu-abu. Label metrik terbaca (11 px). `id="hero-home-status"` sudah tidak ada (`grep -r hero-home-status src` kosong, kecuali Layout.astro yang dibereskan di Langkah 4).

---

## Langkah 3 — Status di navbar (desktop & menu HP): netral dulu, bisa diupdate

**Menyelesaikan:** MON-4, FB-2, CON-6.
**File:** `src/components/Navbar.astro`

3a. Badge desktop. Cari:

```astro
          <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75 status-ping"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-online status-dot"></span>
          </span>
          <span class="status-text font-mono text-[11px] tracking-tight uppercase">Sistem Normal</span>
```

Ganti dengan:

```astro
          <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span class="status-ping hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8A29E] opacity-75"></span>
            <span class="status-dot relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A8A29E]"></span>
          </span>
          <span class="status-text font-mono text-[11px] tracking-tight uppercase whitespace-nowrap">Memeriksa…</span>
```

3b. Menu HP. Di dalam `<div class="py-2 mb-1">`, tambahkan atribut `id="mobile-status-link"` ke tag `<a` pertama (baris tag-nya punya trailing space: `<a `). Lalu cari:

```astro
          <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-online"></span>
          </span>
          <span>Status Layanan: Normal</span>
```

Ganti dengan:

```astro
          <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span class="status-ping hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8A29E] opacity-75"></span>
            <span class="status-dot relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A8A29E]"></span>
          </span>
          <span>Status: <span class="status-text">Memeriksa…</span></span>
```

**Verifikasi:** build lolos. Desktop ≥768 px: badge "MEMERIKSA…" abu-abu tanpa denyut (sebelum Langkah 4). HP: buka menu, tertulis "STATUS: MEMERIKSA…".

---

## Langkah 4 — Script status: jujur, dihitung per monitor, ada timeout

**Menyelesaikan:** MON-1 (P0), MON-2 (P0), MON-3, MON-4, MON-5, MON-6, PD-2, VH-1 (label merah). **Bergantung pada Langkah 1–3.**
**File:** `src/layouts/Layout.astro`

Ganti **seluruh** fungsi mulai baris komentar `// 3. Smart Uptime Kuma Status Monitor (with Keyword Auto-Matching & SLA metrics)` sampai kurung kurawal penutup fungsi `initSmartUptimeKuma` (baris `      }` tepat sebelum `    </script>`) dengan:

```js
      // 3. Status layanan dari Uptime Kuma (lewat proxy /api/status-page di Caddy)
      async function initSmartUptimeKuma() {
        const refreshBtn = document.getElementById('refresh-status-btn');
        const refreshIcon = refreshBtn ? refreshBtn.querySelector('.refresh-icon') : null;
        // astro dev tidak punya proxy /api, jadi data contoh hanya boleh dipakai di localhost
        const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

        // Full class strings so Tailwind can pick them up
        const DOT_COLORS = ['bg-status-online', 'bg-status-offline', 'bg-status-warning', 'bg-[#A8A29E]'];
        const DOT_COLOR = { up: 'bg-status-online', down: 'bg-status-offline', unknown: 'bg-status-warning' };
        const TEXT_COLORS = ['text-emerald-800', 'text-red-700', 'text-[#6B655D]'];
        const TEXT_COLOR = { up: 'text-emerald-800', down: 'text-red-700', unknown: 'text-[#6B655D]' };

        function paintDot(root, state) {
          if (!root) return;
          const dot = root.querySelector('.status-dot');
          const ring = root.querySelector('.status-ping, .status-pulse-ring');
          [dot, ring].forEach(el => {
            if (!el) return;
            el.classList.remove(...DOT_COLORS);
            el.classList.add(DOT_COLOR[state]);
          });
          if (ring) ring.classList.toggle('hidden', state === 'unknown');
        }

        function paintText(el, state, text) {
          if (!el) return;
          el.textContent = text;
          el.classList.remove(...TEXT_COLORS);
          el.classList.add(TEXT_COLOR[state]);
        }

        function setGlobal(state, badgeText, heroText) {
          ['global-status-badge', 'mobile-status-link'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            paintDot(el, state);
            const textEl = el.querySelector('.status-text');
            if (textEl) textEl.textContent = badgeText;
          });
          paintText(document.getElementById('hero-active-val'), state, heroText);
        }

        async function getJson(url) {
          const opts = { cache: 'no-store' };
          if (window.AbortSignal && AbortSignal.timeout) opts.signal = AbortSignal.timeout(5000);
          const res = await fetch(url, opts);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }

        async function fetchStatus() {
          if (refreshIcon) refreshIcon.classList.add('animate-spin');

          let hbData = null;
          let pageData = null;
          let isSample = false;

          for (const slug of ['family', 'kubiko', 'default']) {
            try {
              const json = await getJson(`/api/status-page/heartbeat/${slug}`);
              if (json && json.heartbeatList && Object.keys(json.heartbeatList).length > 0) {
                hbData = json;
                pageData = await getJson(`/api/status-page/${slug}`).catch(() => null);
                break;
              }
            } catch (e) {
              // Try next slug
            }
          }

          if (!hbData && isLocal) {
            hbData = await getJson('/mock-status.json').catch(() => null);
            isSample = Boolean(hbData);
          }

          if (refreshIcon) {
            setTimeout(() => refreshIcon.classList.remove('animate-spin'), 600);
          }

          const lastChecked = document.getElementById('hero-last-checked');
          const monitoredCards = document.querySelectorAll('.service-card:not([data-upcoming])');

          // Monitoring tidak bisa dihubungi: katakan apa adanya, jangan tampilkan hijau
          if (!hbData || !hbData.heartbeatList) {
            setGlobal('unknown', 'Status Tidak Tersedia', 'Tidak diketahui');
            monitoredCards.forEach(card => {
              paintDot(card, 'unknown');
              paintText(card.querySelector('.status-label'), 'unknown', 'Tidak Diketahui');
            });
            document.querySelectorAll('[data-hero-service]').forEach(row => {
              paintDot(row, 'unknown');
              paintText(row.querySelector('.status-label'), 'unknown', 'Tidak Diketahui');
            });
            if (lastChecked) lastChecked.textContent = 'Status belum bisa dicek. Coba Segarkan sebentar lagi.';
            return;
          }

          const hbList = hbData.heartbeatList;
          const remoteMonitors = [];
          ((pageData && pageData.publicGroupList) || []).forEach(group => {
            (group.monitorList || []).forEach(m => remoteMonitors.push(m));
          });

          // Hitung per monitor, bukan per kartu: tidak dobel, dan tetap benar di halaman tanpa kartu
          const latestBeats = Object.values(hbList)
            .filter(list => Array.isArray(list) && list.length > 0)
            .map(list => list[list.length - 1]);
          const offlineCount = latestBeats.filter(hb => hb.status === 0).length;
          const pings = latestBeats.map(hb => hb.ping).filter(p => typeof p === 'number');

          function stateOf(keywords, rawId) {
            const matched = remoteMonitors.find(rm => {
              const nameLower = (rm.name || '').toLowerCase();
              return keywords.some(kw => nameLower.includes(kw.toLowerCase()));
            });
            const id = matched ? String(matched.id) : (rawId && hbList[rawId] ? String(rawId) : null);
            const entries = id ? hbList[id] : null;
            if (!entries || entries.length === 0) return 'unknown';
            const status = entries[entries.length - 1].status;
            return status === 1 ? 'up' : status === 0 ? 'down' : 'unknown';
          }

          const CARD_TEXT = { up: 'Siap Digunakan', down: 'Sedang Gangguan', unknown: 'Tidak Dipantau' };
          const HERO_TEXT = { up: 'Online', down: 'Gangguan', unknown: 'Tidak Dipantau' };

          monitoredCards.forEach(card => {
            let keywords = [];
            try { keywords = JSON.parse(card.getAttribute('data-keywords') || '[]'); } catch (e) {}
            const state = stateOf(keywords, card.getAttribute('data-monitor-id'));
            paintDot(card, state);
            paintText(card.querySelector('.status-label'), state, CARD_TEXT[state]);

            const heroRow = document.querySelector(`[data-hero-service="${card.getAttribute('data-service-id')}"]`);
            if (heroRow) {
              paintDot(heroRow, state);
              paintText(heroRow.querySelector('.status-label'), state, HERO_TEXT[state]);
            }
          });

          if (offlineCount > 0) {
            setGlobal('down', `${offlineCount} Layanan Terkendala`, `${offlineCount} Gangguan`);
          } else {
            setGlobal('up', 'Semua Layanan Siap', 'Semua Normal');
          }

          const heroPing = document.getElementById('hero-ping-val');
          if (heroPing && pings.length > 0) {
            heroPing.textContent = `~${Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)} ms`;
          }

          if (lastChecked) {
            const timeStr = new Intl.DateTimeFormat('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'Asia/Jakarta'
            }).format(new Date());
            lastChecked.innerHTML = `Terakhir dicek pukul <span class="font-mono tabular-nums font-medium">${timeStr}</span> WIB · Tiap 60&nbsp;dtk${isSample ? ' · DATA CONTOH' : ''}`;
          }
        }

        fetchStatus();

        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            fetchStatus();
          });
        }

        setInterval(fetchStatus, 60000);
      }
```

Catatan: `public/mock-status.json` **tetap dipertahankan** (dipakai `astro dev`). Jangan dihapus.

**Verifikasi** (`npx astro dev`, localhost):
1. **Jalur data contoh:** di `/`, badge "SEMUA LAYANAN SIAP" hijau. Kartu Jellyfin/Nextcloud/PDF/Minecraft "SIAP DIGUNAKAN" (hijau, berdenyut). Permintaan Film "TIDAK DIPANTAU" abu-abu tanpa denyut. Zona Game Santai tetap "SEGERA". Math Hero tanpa pill. Footnote hero berakhir dengan "· DATA CONTOH".
2. **Jalur gangguan:** ubah sementara `public/mock-status.json` monitor `"4"` jadi `"status": 0`, lalu reload. (Di tahap ini crafty masih memakai id 4. Setelah Langkah 13e, id-nya jadi 5, jadi uji ulang dengan `"5"`.)
   - `/`: badge "1 LAYANAN TERKENDALA" (merah), kartu Minecraft "SEDANG GANGGUAN" teks merah tua, baris Minecraft di hero "GANGGUAN", "Kondisi" = "1 Gangguan" merah, Zona Game Santai **tetap** "SEGERA".
   - `/math-hero`: badge **juga** "1 LAYANAN TERKENDALA".
   - **Kembalikan** file mock ke `"status": 1` dan pastikan `git diff public/` kosong.
3. **Jalur gagal:** DevTools → Network → klik kanan `mock-status.json` → *Block request URL*, lalu reload. Badge "STATUS TIDAK TERSEDIA" (titik kuning, tanpa denyut). Kartu "TIDAK DIKETAHUI". Footnote "Status belum bisa dicek…". Matikan blokirnya setelah selesai.
4. Menu HP (375 px): "STATUS: …" ikut berubah sesuai tiga skenario di atas.
5. `grep -n "hero-home-status\|text-status-offline" src -r` → kosong.

---

## Langkah 5 — Label tab filter aktif tidak hilang saat hover

**Menyelesaikan:** AFF-2.
**File:** `src/layouts/Layout.astro` (fungsi `applyFilter`)

Cari:

```js
              btn.classList.add('bg-[#161513]', 'text-[#FAF7F0]', 'shadow-brutal-sm');
              btn.classList.remove('bg-[#FAF7F0]', 'text-[#161513]');
```

Ganti dengan:

```js
              btn.classList.add('bg-[#161513]', 'text-[#FAF7F0]', 'shadow-brutal-sm');
              btn.classList.remove('bg-[#FAF7F0]', 'text-[#161513]', 'hover:bg-[#F2ECE1]');
```

Cari:

```js
              btn.classList.remove('bg-[#161513]', 'text-[#FAF7F0]', 'shadow-brutal-sm');
              btn.classList.add('bg-[#FAF7F0]', 'text-[#161513]');
```

Ganti dengan:

```js
              btn.classList.remove('bg-[#161513]', 'text-[#FAF7F0]', 'shadow-brutal-sm');
              btn.classList.add('bg-[#FAF7F0]', 'text-[#161513]', 'hover:bg-[#F2ECE1]');
```

**Verifikasi:** di `/`, klik "Game Santai" dan biarkan kursor di atasnya. Tab tetap hitam dengan teks cream terbaca. Hover "Semua Layanan" (yang kini non-aktif) → latar berubah ke sand `#F2ECE1`.

---

## Langkah 6 — Salin alamat: fallback beneran + pesan gagal

**Menyelesaikan:** FB-1, WF-1, FB-3.
**File:** `src/layouts/Layout.astro`, `src/components/Toast.astro`

6a. `Layout.astro`, di `initClickToCopy`. Cari blok mulai `            try {` + `              if (navigator.clipboard && navigator.clipboard.writeText) {` sampai akhir `catch`:

```js
            } catch (err) {
              console.error('Failed to copy text: ', err);
            }
```

Ganti **seluruh** `try { … } catch (err) { … }` itu dengan:

```js
            let copied = false;
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
                copied = true;
              }
            } catch (err) {
              // Ditolak (mis. browser di dalam WhatsApp): coba cara lama di bawah
            }

            if (!copied) {
              const textarea = document.createElement('textarea');
              textarea.value = textToCopy;
              textarea.setAttribute('readonly', '');
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
              document.body.removeChild(textarea);
            }

            if (!copied) {
              if (window.showToast) {
                window.showToast(`Gagal menyalin otomatis. Salin manual: ${textToCopy}`, false);
              }
              return;
            }

            // Update Button State
            const labelEl = btn.querySelector('.copy-label');
            const origText = labelEl ? labelEl.textContent : '';
            if (labelEl) labelEl.textContent = 'Tersalin!';
            btn.classList.add('bg-[#EAA838]', 'text-[#161513]');

            if (window.showToast) {
              window.showToast(`Alamat ${serviceName} (${textToCopy}) berhasil disalin!`);
            }

            setTimeout(() => {
              if (labelEl) labelEl.textContent = origText;
              btn.classList.remove('bg-[#EAA838]', 'text-[#161513]');
            }, 2000);
```

6b. `Toast.astro`. Cari:

```astro
  class="fixed bottom-6 right-6 z-50
```

Ganti `fixed bottom-6 right-6 z-50` dengan `fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50` (sisa class biarkan).

Cari `<div class="p-1 rounded-full bg-[#EAA838] text-[#161513] shrink-0" aria-hidden="true">` dan tambahkan `id="toast-icon" ` setelah `<div `.

Cari:

```ts
  (window as any).showToast = function(message = 'Teks berhasil disalin!') {
```

Ganti dengan:

```ts
  (window as any).showToast = function(message = 'Teks berhasil disalin!', ok = true) {
```

Lalu tepat setelah baris `msgEl.textContent = message;` tambahkan:

```ts
    document.getElementById('toast-icon')?.classList.toggle('hidden', !ok);
```

Dan ganti `}, 2400);` (di akhir `setTimeout` toast) dengan `}, ok ? 2400 : 6000);`.

**Verifikasi:**
- Klik "Salin Alamat" di kartu Minecraft → label "Tersalin!" + toast dengan ikon centang. Tempel di Notepad hasilnya `crafty.kubiko.my.id`.
- Simulasi gagal di console: `navigator.clipboard.writeText = () => Promise.reject(new Error('x')); document.execCommand = () => false;` lalu klik salin. Toast tanpa ikon berisi "Gagal menyalin otomatis. Salin manual: crafty.kubiko.my.id", tampil ±6 detik.
- HP 375 px: toast punya jarak kiri-kanan, tidak menempel tepi.

---

## Langkah 7 — Seluruh kartu layanan bisa diklik (stretched link)

**Menyelesaikan:** AFF-1, CON-2.
**File:** `src/components/ServiceCard.astro`

Kartu sudah `relative` (`service-card group relative flex …`). Link utama diberi pseudo-element `after:absolute after:inset-0` yang menutup kartu. Efek geser/zoom pada link **harus dihapus**: `transform` di link membuat pseudo-element ikut mengecil saat hover, dan itu menimbulkan kedip. Kartu sendiri sudah punya efek angkat.

7a. Cabang tanpa `copyText` (tombol "Buka Layanan"). Di `<a` yang `href={service.url}` dan `target={isInternal ? undefined : '_blank'}`, ganti **seluruh** atribut `class="…"` (diawali `min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5`) dengan `class:list` di bawah. Kondisi `isUpcoming` disengaja: cabang ini juga dipakai kartu Zona Game Santai yang belum rilis (subdomainnya belum diverifikasi hidup, lihat CNT-3), jadi kartu itu **tidak** boleh jadi link penuh.

```astro
          class:list={[
            'min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#161513] text-[#FAF7F0] hover:bg-[#DE5D35] group-hover:bg-[#DE5D35] transition-colors border-2 border-[#161513] shadow-brutal-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161513]',
            !service.isUpcoming && 'after:absolute after:inset-0 after:rounded-3xl',
          ]}
```

7b. **Jangan** ubah cabang `copyText` (kartu Minecraft). Panah di kartu itu membuka `crafty.kubiko.my.id`, yang kemungkinan panel admin (lihat ONB-2). Kalau seluruh kartu jadi link, salah ketuk akan membawa anak ke panel. Biarkan panah itu tetap kontrol kecil yang eksplisit sampai pengguna memutuskan ONB-2.

**Verifikasi:**
- Klik area kosong/judul kartu "Nonton Film & Video" → tab baru `https://nonton.kubiko.my.id`.
- Klik judul kartu Math Hero → pindah ke `/math-hero` di tab yang sama.
- Kartu Minecraft: klik area kosong kartu → **tidak** terjadi apa-apa. "Salin Alamat" dan panah tetap bekerja seperti sebelumnya.
- Kartu Zona Game Santai: klik area kosong kartu → **tidak** terjadi apa-apa; hanya tombol "Lihat Info" yang bisa diklik.
- Hover kartu: kartu terangkat, tombol jadi terakota, tidak ada kedip.
- Tab keyboard: fokus tetap di tombol (ring terlihat).

---

## Langkah 8 — Kontras teks kecil lolos WCAG AA

**Menyelesaikan:** VH-1. Rasio sudah dihitung dengan rumus WCAG.
**File:** `src/pages/index.astro`, `src/components/AccessGuide.astro`

8a. `index.astro`, pill hero (3,43 → 4,97). Cari:

```astro
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#DE5D35] text-[#FAF7F0] border-2 border-[#161513] shadow-brutal-sm">
            <span class="w-2 h-2 rounded-full bg-[#FAF7F0]" aria-hidden="true"></span>
```

Ganti dengan (pola sama dengan `math-hero.astro`):

```astro
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#DE5D35] text-[#161513] border-2 border-[#161513] shadow-brutal-sm">
            <span class="w-2 h-2 rounded-full bg-[#161513]" aria-hidden="true"></span>
```

8b. `index.astro`, paragraf band terakota (2,71 → 4,97). Cari:

```astro
          <p class="text-xs sm:text-sm text-[#FAF7F0]/80 leading-relaxed font-medium">
```

Ganti dengan:

```astro
          <p class="text-sm text-[#161513] leading-relaxed font-medium">
```

8c. `index.astro`, tiga kartu manifesto (3,27/2,86 → >8). Replace-all `p-6 rounded-3xl bg-[#C84F2A] border-2` → `p-6 rounded-3xl bg-[#161513] border-2` (3 kemunculan).

8d. `AccessGuide.astro`, pill "PANDUAN MUDAH". Cari `bg-[#DE5D35] text-[#FAF7F0] border border-[#161513] shadow-brutal-sm mb-3` dan ganti `text-[#FAF7F0]` jadi `text-[#161513]`.

8e. `AccessGuide.astro`, subdomain merah di daftar alamat (3,67 → 5,76). Cari:

```astro
                  <div class="text-xs font-mono font-bold text-[#DE5D35] mt-0.5 truncate" translate="no">
```

Ganti dengan:

```astro
                  <div class="text-xs font-mono font-bold text-[#B2401C] mt-0.5 break-all" translate="no">
```

**Verifikasi:** build lolos. Visual: band terakota kini berisi kartu hitam dengan teks cream, dan paragraf kiri berwarna ink. Cek dengan DevTools → elemen → *Contrast ratio* di color picker: semua elemen di atas ≥4,5.

---

## Langkah 9 — Kelas Tailwind yang tidak ada + tab filter di HP

**Menyelesaikan:** NAV-2, DIS-1.

9a. `src/components/Navbar.astro`: cari `<div class="flex items-center justify-between h-18 sm:h-20">` dan ganti `h-18` jadi `h-[72px]`.

9b. `src/pages/index.astro`: cari `py-14 sm:py-18 scroll-mt-20` dan ganti `sm:py-18` jadi `sm:py-[72px]`.

9c. `src/components/CategoryFilter.astro`: cari `class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none"` dan ganti dengan `class="flex flex-wrap items-center gap-2.5 pb-2"`.

**Verifikasi:**
- HP 375 px: tinggi navbar 72 px (DevTools), dengan jarak lega di atas-bawah tombol menu. Keempat tab filter terlihat (membungkus ke 2 baris) tanpa scrollbar.
- Desktop: band hitam "Fitur & Utilitas" padding atas 72 px.
- Navigasi panah kiri/kanan di tab tetap jalan.

---

## Langkah 10 — Navbar tidak patah baris di 1024 px

**Menyelesaikan:** NAV-1, CTA-2.
**File:** `src/components/Navbar.astro`

10a. Cari `<nav class="hidden md:flex items-center gap-1 sm:gap-4 lg:gap-6" aria-label="Navigasi Utama">` dan ganti dengan `<nav class="hidden lg:flex items-center gap-4 xl:gap-6" aria-label="Navigasi Utama">`.

10b. Replace-all `class="px-2 py-1 text-xs font-bold uppercase tracking-widest` → `class="px-2 py-1 whitespace-nowrap text-xs font-bold uppercase tracking-widest` (5 link desktop).

10c. Tombol kuning "Status Sistem": cari `class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EAA838]` dan ganti `hidden sm:inline-flex` jadi `hidden xl:inline-flex`.

10d. Tombol menu: cari `class="md:hidden min-w-[44px]` dan ganti `md:hidden` jadi `lg:hidden`.

10e. Panel menu: cari `<div id="mobile-menu" class="hidden md:hidden border-t-2` dan ganti `md:hidden` jadi `lg:hidden`.

**Verifikasi:** DevTools responsive di 768, 1024, 1280, 1440 px:
- 768–1023: logo + badge status + tombol menu, tanpa teks patah.
- ≥1024: 5 link satu baris, badge satu baris.
- ≥1280: tombol kuning muncul.

Bila di 1024 px masih ada yang patah, ganti `lg:flex` → `xl:flex` (10a) serta `lg:hidden` → `xl:hidden` (10d, 10e), lalu cek ulang.

---

## Langkah 11 — Daftar Alamat & footer: konsisten dengan data

**Menyelesaikan:** CON-3, CON-4, WF-2, WF-3, CNT-1 (sebagian).

11a. `src/components/AccessGuide.astro`. Cari:

```astro
            const fullUrl = `https://${route.from}`;
```

Ganti dengan:

```astro
            const fullUrl = `https://${route.from}`;
            // Route di domain portal sendiri dibuka di tab yang sama, seperti kartu layanan
            const isInternal = route.from.startsWith('kubiko.my.id/');
            const href = isInternal ? route.from.slice('kubiko.my.id'.length) : fullUrl;
```

Lalu cari:

```astro
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
```

Ganti dengan:

```astro
                    href={href}
                    target={isInternal ? undefined : '_blank'}
                    rel={isInternal ? undefined : 'noopener noreferrer'}
```

Dan cari:

```astro
                    title={`Buka ${fullUrl} di tab baru`}
                    aria-label={`Buka ${fullUrl} di tab baru`}
```

Ganti dengan:

```astro
                    title={isInternal ? `Buka ${route.target}` : `Buka ${fullUrl} di tab baru`}
                    aria-label={isInternal ? `Buka ${route.target}` : `Buka ${fullUrl} di tab baru`}
```

11b. Masih di `AccessGuide.astro`, cari `<div class="font-bold text-[#161513] text-sm sm:text-base truncate">` dan ganti `truncate` jadi `break-words`.

11c. `src/components/Footer.astro`: ganti baris import `import { siteConfig } from '../data/services';` dengan `import { siteConfig, servicesData } from '../data/services';`.

11d. `Footer.astro`: ganti seluruh `<ul …>…</ul>` yang berada **tepat setelah** `<h4 class="font-mono text-xs uppercase tracking-widest text-[#EAA838] font-bold">LAYANAN</h4>` (berisi 5 `<li>`: Nonton Film … Math Hero) dengan:

```astro
        <ul class="space-y-1 text-xs text-[#D6D3D1]">
          {servicesData.filter((s) => !s.isUpcoming).map((s) => {
            const isInternal = s.url.startsWith('/');
            return (
              <li>
                <a
                  href={s.url}
                  target={isInternal ? undefined : '_blank'}
                  rel={isInternal ? undefined : 'noopener noreferrer'}
                  class="inline-flex items-center gap-1 py-1.5 hover:text-[#EAA838] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAA838]"
                >
                  <span>{s.name}</span>
                  {!isInternal && <ArrowUpRight class="w-3 h-3 text-[#A8A29E]" aria-hidden="true" />}
                </a>
              </li>
            );
          })}
        </ul>
```

11e. `Footer.astro`, `<ul>` NAVIGASI: ganti `<ul class="space-y-2.5 text-xs text-[#D6D3D1]">` (yang tersisa, tepat setelah `NAVIGASI</h4>`) jadi `<ul class="space-y-1 text-xs text-[#D6D3D1]">`. Lalu replace-all `class="hover:text-[#EAA838] transition-colors focus-visible` → `class="inline-block py-1.5 hover:text-[#EAA838] transition-colors focus-visible` (4 link navigasi).

**Verifikasi:**
- Daftar Alamat: "Buka" di baris Math Hero pindah ke `/math-hero` di tab yang sama, baris lain tetap tab baru. Di HP, nama "Permintaan Film & Serial" tidak terpotong.
- Footer: 6 layanan termasuk "Permintaan Film & Serial", Math Hero tanpa ikon panah.
- HP: tinggi link footer ≥27 px (DevTools).

---

## Langkah 12 — Kurangi noise & jargon

**Menyelesaikan:** CL-1, CL-2.

12a. `src/components/ServiceCard.astro`: hapus blok badge Favorit:

```astro
        {service.featured && (
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EAA838] text-[#161513] border border-[#161513]">
            <Sparkles class="w-3 h-3" aria-hidden="true" />
            Favorit
          </span>
        )}
```

Lalu hapus `Sparkles, ` dari baris import `lucide-astro` di file itu. (Field `featured` di data dibiarkan, lihat "Perlu keputusan pengguna".)

12b. `src/components/Footer.astro`: hapus baris `<span class="text-xs font-mono text-[#A8A29E]">v1.0 • SSG Powered</span>`. Ganti teks `<span>Status Uptime Kuma</span>` jadi `<span>Status Layanan</span>`.

12c. `src/data/services.ts` (layanan `seerr`):
- `'Terhubung Jellyfin'` → `'Langsung ke Nonton Film'`
- `sampai siap ditonton di Jellyfin.` → `sampai siap ditonton di Nonton Film & Video.`

**Verifikasi:** build lolos. Tidak ada badge "FAVORIT". Footer tanpa "SSG Powered" dan menulis "Status Layanan". `grep -rn "Jellyfin" src/data` hanya tersisa di keyword/komentar (`uptimeKumaKeywords` boleh).

---

## Langkah 13 — Bersih-bersih kecil

**Menyelesaikan:** CNT-2, COM-2 (og:url), MON-8, MON-9.

13a. `src/pages/index.astro`: file diakhiri `</Layout>` **dua kali**. Hapus yang terakhir sehingga hanya ada satu `</Layout>` di akhir file.

13b. `src/pages/index.astro`: di baris import `lucide-astro`, hapus `, Sparkles` (tidak dipakai di file ini).

13c. `src/layouts/Layout.astro`: cari `<meta property="og:url" content="https://kubiko.my.id" />` dan ganti dengan `<meta property="og:url" content={new URL(Astro.url.pathname, Astro.site).href} />` (`site` sudah diset di `astro.config.mjs`).

13d. `src/data/services.ts`: cari `uptimeKumaKeywords: ['crafty', 'minecraft', 'mc'],` dan ganti dengan `uptimeKumaKeywords: ['crafty', 'minecraft'],`.

13e. **ID monitor (MON-9, akar MON-2).** Buka dulu `https://kubiko.my.id/api/status-page/family` di browser (read-only), lalu catat `id` dan `name` di `publicGroupList[].monitorList[]`. Saat audit isinya `1 Jellyfin, 2 Nextcloud, 3 Stirling PDF, 5 Minecraft Server`. **Kalau isinya berbeda, ikuti data terbaru dan sebutkan di laporan.** Lalu di `src/data/services.ts`:
- Layanan `crafty`: `uptimeKumaMonitorId: 4,` → `uptimeKumaMonitorId: 5,` (sesuaikan dengan id "Minecraft Server").
- Layanan `game-hub`: hapus baris `uptimeKumaMonitorId: 5,` (layanan belum rilis, jadi tidak boleh meminjam monitor lain).
- Catatan: `public/mock-status.json` memakai id 1–7 dan semua `status: 1`. Tidak perlu diubah.

**Verifikasi:**
- `npx astro build` lolos.
- `dist/math-hero/index.html` memuat `og:url` yang **mengandung** `https://kubiko.my.id/math-hero` (garis miring di akhir boleh ada atau tidak).
- Teks `4 Tantangan Menanti` masih ada (`grep "4 Tantangan Menanti" dist/math-hero/index.html`).
- `grep -n "uptimeKumaMonitorId" src/data/services.ts` tidak lagi menampilkan id yang sama untuk dua layanan.

---

## Penutup

1. Jalankan `npx astro build` terakhir, lalu lakukan cek visual penuh desktop (1024 + 1440) dan HP (375) untuk `/` dan `/math-hero`.
2. `git log --oneline upstream/main..HEAD` menampilkan ±13 commit lokal.
3. **Berhenti di sini.** Laporkan ke pengguna. Push ke `origin` dan PR ke `upstream` hanya setelah pengguna mengizinkan. **Jangan pernah push ke `upstream/main`.**
4. Setelah semua beres dan pengguna setuju, worktree bisa dihapus: `git worktree remove ../kubiko-ux`.

---

## Perlu keputusan pengguna (jangan dikarang)

| ID | Pertanyaan | Kenapa penting |
|---|---|---|
| COM-1, CTA-1 | Kanal kontak pengelola apa (nomor WhatsApp, email, grup keluarga)? Setelah ada, tombol primer band "Ada kendala…" (`index.astro`) dan footer diganti ke kanal itu. | Saat ini bantuan buntu. |
| ONB-1 | Bagaimana keluarga dapat akun? Satu akun untuk semua, atau per layanan? Layanan mana yang tanpa akun? | Langkah 02 panduan perlu ditulis ulang dengan fakta. |
| ONB-2 | Alamat + port Minecraft Java dan Bedrock? Apakah `crafty.kubiko.my.id` (panel Crafty) memang boleh dibuka anggota keluarga? | Saat ini pemain hanya diberi satu host tanpa port, dan tombol panah membuka panel. Sampai ini diputuskan, kartu Minecraft sengaja **tidak** dijadikan link penuh (Langkah 7b). |
| CNT-3 | Apakah `game.kubiko.my.id` sudah hidup? Kalau belum, tombol "Lihat Info" diganti label non-link "Segera Hadir". | Tombol bisa mengarah ke halaman error. |
| CL-1 | Mau menandai 1–2 layanan unggulan, atau tanpa badge sama sekali (plan menghapus badge)? | Badge di 6/7 kartu = noise. |
| MON-7 | Tambah monitor Uptime Kuma untuk Seerr (`request.kubiko.my.id`)? Kalau ya, beri nama yang mengandung "seerr"/"request", supaya keyword yang ada langsung cocok. | Sekarang tampil "Tidak Dipantau". |
| PD-2 | Tampilkan uptime 24 jam di portal? (saat audit ~61%) | Jujur, tapi bisa bikin cemas. Mungkin cukup di halaman status. |
| COM-2 | Buat gambar preview PNG 1200×630 untuk `og:image` (absolut, mis. `https://kubiko.my.id/og.png`)? | Preview link di WhatsApp. |
| VH-4 | Heading serif tampil faux-bold. Pilihannya: (a) hapus `font-black` dari elemen `font-serif` (DM Serif memang tebal), atau (b) ganti ke serif yang punya berat 900. | Mengubah semua heading, jadi perlu persetujuan visual. |
| VH-3, PD-1 | Di HP, sembunyikan band "Fitur & Utilitas" dan/atau pindahkan kartu status ke bawah katalog? (Kalau disembunyikan, link "Fitur" di menu/footer perlu ikut disesuaikan.) | Kartu layanan pertama di HP baru muncul setelah ~3 layar. |
| CON-5 | Sapaan "Anda" atau "kamu/-mu" untuk seluruh situs? | Saat ini campur. |
| ONB-3 | Saran umur/kelas per level Math Hero? | "Pemula" vs "Mudah" ambigu. |
| FB-4 | Feedback benar/salah di game Math Hero belum diaudit (repo terpisah). Perlu audit terpisah? | Di luar repo ini. |

**Sengaja tidak dimasukkan ke plan** (P3, nilai kecil atau butuh keputusan): NAV-3 (urutan nav), DIS-2 (sebut Math Hero di hero), CL-3 (pengulangan "100% Bebas Iklan"), BC-1 (`aria-current`), CNT-1 (penyeragaman nama di `caddyProxyChain`).
