# Web Desa

Aplikasi web untuk Desa, dibangun menggunakan [Next.js](https://nextjs.org) dengan App Router.

---

## 🚀 Getting Started

### 1. Prasyarat
- Node.js (v18.x atau lebih baru)
- npm / yarn / pnpm / bun

### 2. Jalankan Development Server

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

---

## 🔄 Alur Kerja Git & Kontribusi (Git Workflow)

Untuk menjaga kerapihan kode dan kolaborasi tim, ikuti alur kerja berikut mulai dari clone hingga merge:

### 1. Clone Repository
Clone repository ini ke komputer lokal Anda:
```bash
git clone https://github.com/faizulmushofa/web-desa.git
cd web-desa
```

### 2. Switch ke Branch Development & Pull Terbaru
Selalu pastikan Anda berada di branch `dev` dan mengambil kode terbaru sebelum mulai bekerja:
```bash
git checkout dev
git pull origin dev
```

### 3. Buat Branch Baru
> ⚠️ **Penting:** Jangan pernah melakukan commit langsung di branch `main` atau `dev`!

Buat branch baru dari branch `dev` sesuai dengan task yang dikerjakan:
- **Fitur Baru:** `feature/nama-fitur`
- **Perbaikan Bug:** `fix/nama-bug`
- **Dokumentasi/Refactoring:** `chore/nama-task` atau `refactor/nama-task`

Contoh:
```bash
git checkout -b feature/halaman-profil-desa
```

### 4. Kerjakan Task & Commit Changes
Setelah melakukan perubahan kode, lakukan commit dengan pesan yang jelas dan informatif (menggunakan format conventional commits):

```bash
git add .
git commit -m "feat: menambahkan halaman profil desa"
```

> **Konvensi Pesan Commit:**
> - `feat:` untuk fitur baru
> - `fix:` untuk perbaikan bug
> - `docs:` untuk perubahan dokumentasi
> - `style:` untuk format/styling tanpa mengubah fungsi logic
> - `refactor:` untuk refactoring kode

### 5. Push Branch ke Remote Repository
Push branch lokal Anda ke remote repository (GitHub):
```bash
git push origin feature/halaman-profil-desa
```

### 6. Buat Pull Request (PR) ke Branch `dev`
1. Buka repository di GitHub: [web-desa](https://github.com/faizulmushofa/web-desa)
2. Klik tombol **"Compare & pull request"** pada branch yang baru saja di-push.
3. Pastikan **Base branch** ditujukan ke branch **`dev`**:
   - `base: dev` ← `compare: feature/halaman-profil-desa`
4. Isi judul dan deskripsi PR secara jelas (sebutkan fitur yang ditambahkan atau masalah yang diselesaikan).
5. Assign atau pilih **Reviewer** (rekan tim / maintainer) untuk meninjau PR Anda.

### 7. Menunggu Review & Approval (ACC)
- Tunggu peninjauan dari reviewer/tim lain.
- **Jika ada catatan/revisi:**
  1. Perbaiki kode pada branch lokal Anda.
  2. Commit dan push kembali (`git push origin feature/...`). Pull Request di GitHub akan ter-update secara otomatis.
- **Jika di-ACC (Approved):** Lanjut ke tahap berikutnya.

### 8. Merge Pull Request ke `dev`
- Setelah mendapatkan status **Approved (ACC)** dari reviewer dan tidak ada bentrok (conflict), PR siap di-**Merge** ke branch `dev`.
- Setelah selesai di-merge, Anda dapat menghapus branch kerja tersebut (opsional):
  ```bash
  git checkout dev
  git pull origin dev
  git branch -d feature/halaman-profil-desa
  ```

---

## 📚 Dokumentasi & Referensi

- [Next.js Documentation](https://nextjs.org/docs) - Fitur dan API Next.js.
- [Learn Next.js](https://nextjs.org/learn) - Tutorial interaktif Next.js.
