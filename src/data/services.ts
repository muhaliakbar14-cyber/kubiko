import type { ServiceItem, ServiceRoute } from '../types/service';

export const servicesData: ServiceItem[] = [
  {
    id: 'jellyfin',
    name: 'Nonton Film & Video',
    description: 'Koleksi film, serial, dan animasi keluarga untuk ditonton bersama sepuasnya tanpa iklan.',
    url: 'https://nonton.kubiko.my.id',
    subdomain: 'nonton.kubiko.my.id',
    category: 'media',
    icon: 'Film',
    tag: 'Tontonan Keluarga',
    specs: ['Bisa di HP, Tablet & TV', 'Kualitas HD', 'Bebas Iklan'],
    uptimeKumaMonitorId: 1,
    uptimeKumaKeywords: ['jellyfin', 'nonton', 'media'],
    isQuickAction: true,
    featured: true
  },
  {
    id: 'nextcloud',
    name: 'Penyimpanan Berkas',
    description: 'Tempat aman menyimpan foto liburan, dokumen penting, dan berbagi berkas antar anggota keluarga.',
    url: 'https://files.kubiko.my.id',
    subdomain: 'files.kubiko.my.id',
    category: 'utility',
    icon: 'HardDrive',
    tag: 'Cloud Pribadi',
    specs: ['Cadangan Foto HP', 'Aman & Terenkripsi', 'Penyimpanan Mandiri'],
    uptimeKumaMonitorId: 2,
    uptimeKumaKeywords: ['nextcloud', 'files', 'cloud'],
    featured: true
  },
  {
    id: 'stirling-pdf',
    name: 'Pengolah PDF',
    description: 'Gabungkan file PDF, pisahkan halaman, perkecil ukuran dokumen, atau ubah format dengan mudah.',
    url: 'https://pdf.kubiko.my.id',
    subdomain: 'pdf.kubiko.my.id',
    category: 'utility',
    icon: 'FileText',
    tag: 'Alat Dokumen',
    specs: ['Praktis & Cepat', 'Tanpa Batasan File', 'Privasi Terjaga'],
    uptimeKumaMonitorId: 3,
    uptimeKumaKeywords: ['stirling', 'pdf'],
    isQuickAction: true,
    featured: true
  },
  {
    id: 'crafty',
    name: 'Server Minecraft',
    description: 'Dunia petualangan survival untuk bermain Minecraft bersama seluruh anggota keluarga dan teman.',
    url: 'https://crafty.kubiko.my.id',
    subdomain: 'crafty.kubiko.my.id',
    category: 'game',
    icon: 'Gamepad2',
    tag: 'Main Bareng',
    specs: ['Mendukung Java & Bedrock', 'Online 24 Jam', 'Dunia Survival'],
    uptimeKumaMonitorId: 4,
    uptimeKumaKeywords: ['crafty', 'minecraft', 'mc'],
    copyText: 'crafty.kubiko.my.id',
    featured: true
  },
  {
    id: 'math-hero',
    name: 'Math Hero',
    description: 'Koleksi game matematika seru untuk mengasah kemampuan berhitung seluruh keluarga. Tersedia 4 level tantangan yang bisa langsung dimainkan di browser.',
    url: '/math-hero',
    subdomain: 'kubiko.my.id/math-hero',
    category: 'game',
    icon: 'Calculator',
    tag: 'Game Edukasi',
    specs: ['4 Level Permainan', 'Optimal di HP', 'Main di Browser'],
    featured: true
  },
  {
    id: 'game-hub',
    name: 'Zona Game Santai',
    description: 'Kumpulan game santai ringan yang bisa langsung dimainkan bersama lewat peramban web.',
    url: 'https://game.kubiko.my.id',
    subdomain: 'game.kubiko.my.id',
    category: 'game',
    icon: 'Dices',
    tag: 'Game Web',
    specs: ['Main Langsung di Browser', 'Tanpa Perlu Pasang Aplikasi'],
    uptimeKumaMonitorId: 5,
    uptimeKumaKeywords: ['game', 'arcade'],
    isUpcoming: true
  }
];

export const caddyProxyChain: ServiceRoute[] = [
  { from: 'nonton.kubiko.my.id', target: 'Nonton Film & Video', note: 'Bebas Iklan' },
  { from: 'files.kubiko.my.id', target: 'Penyimpanan Berkas & Foto', note: 'Aman' },
  { from: 'pdf.kubiko.my.id', target: 'Alat Pengolah PDF', note: 'Praktis' },
  { from: 'crafty.kubiko.my.id', target: 'Server Game Minecraft', note: 'Survival' },
  { from: 'kubiko.my.id/math-hero', target: 'Math Hero (Game Edukasi)', note: '4 Level' },
  { from: 'game.kubiko.my.id', target: 'Zona Game Santai', note: 'Di Browser' },
];

export const siteConfig = {
  domain: 'kubiko.my.id',
  siteName: 'Kubiko Portal',
  tagline: 'Pusat Hiburan & Utilitas Keluarga',
  description: 'Portal akses cepat layanan mandiri keluarga: nonton film, simpan foto, olah dokumen PDF, dan main game santai bersama.',
  author: 'Keluarga Kubiko',
  statusPageUrl: 'https://status.kubiko.my.id',
  statusPageSlugs: ['family', 'kubiko', 'default']
};
