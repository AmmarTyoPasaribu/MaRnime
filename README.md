# MaRnime 🌌

Website anime bergaya **Neo-Brutalist Pop** dengan layout dashboard — jelajahi, lacak, dan kelola daftar anime kamu. Data dari **AniList** dan **MyAnimeList (Jikan)**.

---

## ✨ Fitur

**Tampilan**
- Layout dashboard: sidebar navigasi + Daftarku + statistik (desktop), drawer + bottom navigation (mobile)
- **Mode Kartu / Teks** global (tersimpan di cookie): mode Teks menampilkan daftar judul saja ala otakudesu — beranda, jelajahi, musiman (A–Z), jadwal (7 kolom hari), top 100, studio
- Animasi: transisi halaman, kartu "press" dengan bayangan tegas, stiker skor bergoyang, hero carousel, marquee footer

**Jelajah & data**
- **Beranda** — hero carousel (crossfade, progress bar, swipe, pause), Lanjutkan Menonton, tayang 24 jam ke depan dengan countdown live, Top 10, grid genre, musim ini & musim depan, film trending
- **Jelajahi** — filter genre, tag, format (multi), status, musim, tahun, negara, skor minimum; urutan; tampilan grid/list; infinite scroll; semua filter tersimpan di URL (bisa dibagikan)
- **Musiman** — navigasi musim/tahun, tab format, urutan
- **Jadwal Tayang** — jadwal mingguan sesuai zona waktu lokal, filter "Daftarku"
- **Top 100** — rating tertinggi, terpopuler, top tayang, paling dinanti, film terbaik, paling difavoritkan
- **Detail anime** — sinopsis (spoiler tersembunyi), trailer, tag (spoiler bisa dibuka), relasi, karakter + pengisi suara multi-bahasa (load more), staf, statistik distribusi skor & status, peringkat, tempat menonton resmi, tautan eksternal
- **Data MyAnimeList** (via Jikan) — skor & peringkat MAL, rating usia, jadwal siar, lisensi, lagu OP/ED, daftar episode (filler/recap)
- **Karakter, Staf, Studio** — profil lengkap, penampilan, peran pengisi suara, karya studio
- **Pencarian instan** (`Ctrl/⌘ + K` atau `/`) — hasil live, navigasi keyboard, riwayat pencarian
- **Anime acak**
- **Rekomendasi untukmu** — berdasarkan genre di daftarmu (dibobot status & skor)

**Akun**
- Watchlist dengan status, skor 1–10, progres episode, catatan, tanggal mulai/selesai (update optimistis)
- Favorit, statistik profil, edit profil (nama, bio, avatar)
- Otomatisasi: episode terakhir → Selesai, tanggal mulai/selesai terisi sendiri

**Lainnya**
- Bilingual **English / Indonesia** (SSR, tersimpan di cookie, deteksi bahasa browser)
- Responsif dengan bottom navigation di mobile, aksesibel (fokus keyboard, `prefers-reduced-motion`)
- SEO: metadata & Open Graph per halaman, JSON-LD, `sitemap.xml`, `robots.txt`, web manifest

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 + design token Neo-Brutalist (Archivo Black + Space Grotesk) |
| Animasi | Framer Motion |
| Data | AniList GraphQL API, Jikan v4 (MyAnimeList) |
| State server | TanStack Query |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| Ikon | Lucide + ikon brand SVG kustom |

---

## 🚀 Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Variabel lingkungan:

| Nama | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key Supabase |
| `NEXT_PUBLIC_SITE_URL` | URL produksi (untuk sitemap & Open Graph), mis. `https://marnime.vercel.app` |

Skema database ada di [`supabase-schema.sql`](supabase-schema.sql). Tautan sosial di footer bisa diubah di [`src/lib/site.ts`](src/lib/site.ts).
