export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Web Desa Serverless Backend API",
    version: "1.0.0",
    description: "Dokumentasi OpenAPI 3.0 resmi untuk layanan Backend Serverless Web Desa (UMKM, Maps Geospasial, Potensi Desa, Perangkat Desa, Autentikasi, dan Storage).",
    contact: {
      name: "Tim Pengembang Web Desa",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server",
    },
  ],
  tags: [
    { name: "System", description: "Endpoint kesehatan dan status sistem" },
    { name: "Auth", description: "Layanan autentikasi pengguna (Register, Login, Logout, Session Me)" },
    { name: "Officials", description: "Pengelolaan dan profil perangkat/pemerintah desa" },
    { name: "UMKM", description: "Pengelolaan direktori dan pendaftaran UMKM" },
    { name: "Maps", description: "Data SIG dan lokasi geospasial peta desa" },
    { name: "Potentials", description: "Katalog potensi lokal desa" },
    { name: "Storage", description: "Pengunggahan berkas media" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        operationId: "getHealthStatus",
        summary: "Cek kesehatan API Serverless",
        description: "Mengembalikan status server dan koneksi database Prisma.",
        responses: {
          "200": { description: "API serverless berjalan dengan normal" },
        },
      },
    },
    "/api/public/officials": {
      get: {
        tags: ["Officials"],
        operationId: "getVillageOfficials",
        summary: "Daftar Perangkat Desa",
        description: "Mengambil daftar seluruh pejabat/perangkat desa.",
        parameters: [
          {
            name: "villageProfileId",
            in: "query",
            schema: { type: "string" },
            description: "Filter berdasarkan ID profil desa",
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Pencarian nama atau jabatan perangkat desa",
          },
        ],
        responses: {
          "200": { description: "Daftar perangkat desa berhasil diambil" },
        },
      },
      post: {
        tags: ["Officials"],
        operationId: "createVillageOfficial",
        summary: "Tambah Perangkat Desa Baru",
        description: "Menambahkan data pejabat/perangkat desa baru.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "position", "photoUrl"],
                properties: {
                  name: { type: "string", example: "Budi Santoso, S.Sos" },
                  position: { type: "string", example: "Kepala Desa" },
                  photoUrl: { type: "string", example: "https://example.com/foto-kades.jpg" },
                  email: { type: "string", example: "kades@desa.id" },
                  greeting: { type: "string", example: "Selamat datang di website resmi Desa Lestari." },
                  villageProfileId: { type: "string", example: "1" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Perangkat desa berhasil ditambahkan" },
          "400": { description: "Validasi input gagal" },
        },
      },
    },
    "/api/public/officials/{id}": {
      get: {
        tags: ["Officials"],
        operationId: "getVillageOfficialById",
        summary: "Detail Perangkat Desa berdasarkan ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID perangkat desa",
          },
        ],
        responses: {
          "200": { description: "Detail perangkat desa ditemukan" },
          "404": { description: "Perangkat desa tidak ditemukan" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        operationId: "registerUserAccount",
        summary: "Registrasi Akun Pengguna Baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                  name: { type: "string", example: "Warga Desa" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Akun pengguna berhasil dibuat" },
          "400": { description: "Validasi atau pendaftaran gagal" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        operationId: "loginUserAccount",
        summary: "Login Pengguna",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login berhasil" },
          "400": { description: "Kredensial tidak valid" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        operationId: "logoutUserSession",
        summary: "Logout / Keluar Sesi",
        responses: {
          "200": { description: "Berhasil keluar dari sesi" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        operationId: "getCurrentUserProfile",
        summary: "Ambil Profil Pengguna Saat Ini",
        responses: {
          "200": { description: "Profil pengguna ditemukan" },
          "401": { description: "Pengguna belum terautentikasi" },
        },
      },
    },
    "/api/public/umkm/categories": {
      get: {
        tags: ["UMKM"],
        operationId: "getUmkmCategoriesList",
        summary: "Daftar Kategori UMKM",
        responses: {
          "200": { description: "Daftar kategori berhasil diambil" },
        },
      },
    },
    "/api/public/umkm/register": {
      post: {
        tags: ["UMKM"],
        operationId: "registerNewUmkm",
        summary: "Pendaftaran UMKM Baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "ownerName", "umkmCategoryId", "description", "phone", "coverUrl", "address", "latitude", "longitude"],
                properties: {
                  name: { type: "string", example: "Kopi Desa Lestari" },
                  ownerName: { type: "string", example: "Budi Santoso" },
                  umkmCategoryId: { type: "string", example: "1" },
                  newCategoryName: { type: "string", example: "Kuliner" },
                  villagePotentialId: { type: "string", example: "1" },
                  description: { type: "string", example: "Warung kopi lokal khas desa." },
                  phone: { type: "string", example: "081234567890" },
                  email: { type: "string", example: "kopilestari@example.com" },
                  coverUrl: { type: "string", example: "https://example.com/cover.jpg" },
                  address: { type: "string", example: "Jl. Raya Desa No. 12" },
                  latitude: { type: "number", example: -7.123456 },
                  longitude: { type: "number", example: 110.123456 },
                  openDay: { type: "string", example: "Senin - Sabtu" },
                  startTime: { type: "string", example: "08:00" },
                  endTime: { type: "string", example: "20:00" },
                  since: { type: "integer", example: 2020 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Pendaftaran UMKM berhasil diajukan" },
          "400": { description: "Validasi input gagal" },
        },
      },
    },
    "/api/public/umkm/{slug}": {
      get: {
        tags: ["UMKM"],
        operationId: "getUmkmDetailBySlug",
        summary: "Detail UMKM berdasarkan Slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Slug unik UMKM",
          },
        ],
        responses: {
          "200": { description: "Detail UMKM ditemukan" },
          "404": { description: "UMKM tidak ditemukan" },
        },
      },
    },
    "/api/public/maps/categories": {
      get: {
        tags: ["Maps"],
        operationId: "getMapCategoriesList",
        summary: "Daftar Kategori Peta Geospasial",
        responses: {
          "200": { description: "Daftar kategori peta" },
        },
      },
    },
    "/api/public/maps/locations": {
      get: {
        tags: ["Maps"],
        operationId: "getMapLocationsList",
        summary: "Daftar Titik Lokasi Peta Desa",
        parameters: [
          {
            name: "categorySlug",
            in: "query",
            schema: { type: "string" },
            description: "Filter berdasarkan slug kategori peta",
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Kata kunci pencarian nama/deskripsi lokasi",
          },
        ],
        responses: {
          "200": { description: "Daftar lokasi peta" },
        },
      },
    },
    "/api/public/maps/location": {
      get: {
        tags: ["Maps"],
        operationId: "getMapLocationById",
        summary: "Detail Titik Lokasi berdasarkan ID",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "ID titik lokasi",
          },
        ],
        responses: {
          "200": { description: "Detail lokasi ditemukan" },
          "404": { description: "Lokasi tidak ditemukan" },
        },
      },
    },
    "/api/public/potentials": {
      get: {
        tags: ["Potentials"],
        operationId: "getVillagePotentialsList",
        summary: "Daftar Potensi Lokal Desa",
        responses: {
          "200": { description: "Daftar potensi desa" },
        },
      },
    },
    "/api/uploads": {
      post: {
        tags: ["Storage"],
        operationId: "uploadMediaFile",
        summary: "Upload Gambar ke Storage",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "File berhasil diunggah" },
          "400": { description: "File tidak valid" },
        },
      },
    },
  },
};
