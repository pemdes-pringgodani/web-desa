# Web Desa

Aplikasi web backend serverless untuk Desa Pringgodani, dibangun menggunakan [Next.js](https://nextjs.org) dengan App Router dan Prisma ORM.

---

## 🚀 Getting Started

### 1. Prasyarat
- Node.js (v18.x atau lebih baru)
- PostgreSQL Database (Supabase / Local Docker)

### 2. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

---

## 🔄 Alur Kerja Git & Kontribusi (Git Workflow)

Untuk menjaga kerapihan kode dan kolaborasi tim, ikuti alur kerja berikut mulai dari clone hingga merge:

### 1. Clone Repository
```bash
git clone https://github.com/faizulmushofa/web-desa.git
cd web-desa
```

### 2. Switch ke Branch Development & Pull Terbaru
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

### 4. Kerjakan Task & Commit Changes
```bash
git add .
git commit -m "feat: deskripsi fitur"
```

### 5. Push Branch ke Remote Repository
```bash
git push origin feature/nama-fitur
```

### 6. Buat Pull Request (PR) ke Branch `dev`
1. Buka repository di GitHub: [web-desa](https://github.com/faizulmushofa/web-desa)
2. Klik **"Compare & pull request"**.
3. Pastikan **Base branch** ke **`dev`**.

---

## 📚 Dokumentasi & Referensi

- [Next.js Documentation](https://nextjs.org/docs) - Fitur dan API Next.js.
- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM & Database.
