import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const { PrismaClient } = await import("../generated/prisma/client.ts");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seeding for Web Desa Pringgodani...");

  // 1. Website Setting
  console.log("1/7 Seeding Website Setting...");
  await prisma.websiteSetting.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      websiteName: "Desa Pringgodani",
      logoUrl: "/images/logo-desa.png",
      faviconUrl: "/favicon.ico",
      email: "info@pringgodani.desa.id",
      phone: "081234567890",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang, Jawa Timur 65179",
      facebook: "https://facebook.com/desapringgodani",
      instagram: "https://instagram.com/desapringgodani",
      youtube: "https://youtube.com/@desapringgodani",
      tiktok: "https://tiktok.com/@desapringgodani",
    },
  });

  // 2. Village Vision, Mission, & Profile
  console.log("2/7 Seeding Village Profile, Vision & Mission...");
  let vision = await prisma.villageVision.findFirst();
  if (!vision) {
    vision = await prisma.villageVision.create({
      data: {
        vision: "Terwujudnya Desa Pringgodani yang Mandiri, Sejahtera, Berdaya Saing, Berbudaya, dan Berkelanjutan Berbasis Ekonomi Kerakyatan.",
      },
    });

    await prisma.villageMission.createMany({
      data: [
        { villageVisionId: vision.id, mission: "Meningkatkan kualitas tata kelola pemerintahan desa yang transparan, akuntabel, dan berbasis teknologi.", sortOrder: 1 },
        { villageVisionId: vision.id, mission: "Mengembangkan potensi lokal pertanian, UMKM, dan pariwisata desa berbasis kearifan lokal.", sortOrder: 2 },
        { villageVisionId: vision.id, mission: "Meningkatkan infrastruktur dan sarana prasarana publik secara merata dan ramah lingkungan.", sortOrder: 3 },
        { villageVisionId: vision.id, mission: "Mewujudkan masyarakat desa yang religius, harmonis, berpendidikan, dan sehat.", sortOrder: 4 },
      ],
    });
  }

  let profile = await prisma.villageProfile.findFirst();
  if (!profile) {
    profile = await prisma.villageProfile.create({
      data: {
        villageVisionId: vision.id,
        structureImageUrl: "/images/struktur-organisasi.jpg",
        address: "Jl. Raya Desa Pringgodani No. 1",
        phone: "081234567890",
        email: "pemdes@pringgodani.desa.id",
      },
    });

    const history = await prisma.villageHistory.create({
      data: {
        villageProfileId: profile.id,
        title: "Sejarah Asal-Usul Desa Pringgodani",
        sortOrder: 1,
      },
    });

    await prisma.historyDetail.createMany({
      data: [
        {
          villageHistoryId: history.id,
          content: "Desa Pringgodani merupakan desa yang kaya akan nilai sejarah dan kebudayaan lokal. Berdiri sejak masa pembukaan lahan oleh para sesepuh desa pada awal abad ke-20, kawasan ini dikenal fertile dengan sumber air alami yang melimpah.",
          sortOrder: 1,
        },
        {
          villageHistoryId: history.id,
          content: "Nama 'Pringgodani' berasal dari kata 'Pring' yang bermakna bambu dan 'Godani' yang melambangkan pengayoman. Seiring berkembangnya zaman, Desa Pringgodani tumbuh menjadi sentra pertanian jeruk manis dan UMKM olahan pangan unggulan.",
          sortOrder: 2,
        },
      ],
    });

    await prisma.villageOfficial.createMany({
      data: [
        {
          villageProfileId: profile.id,
          name: "Drs. H. Sugeng Riyadi",
          position: "Kepala Desa",
          photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
          email: "kades@pringgodani.desa.id",
          greeting: "Selamat datang di portal informasi resmi Desa Pringgodani. Kami berkomitmen memberikan pelayanan terbaik demi kesejahteraan seluruh warga.",
        },
        {
          villageProfileId: profile.id,
          name: "Siti Rahmawati, S.AP",
          position: "Sekretaris Desa",
          photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
          email: "sekdes@pringgodani.desa.id",
          greeting: "Pelayanan administrasi publik yang responsif dan transparan adalah prioritas kami.",
        },
        {
          villageProfileId: profile.id,
          name: "Bambang Kurniawan",
          position: "Kasi Pemerintahan",
          photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
          email: "pem@pringgodani.desa.id",
          greeting: "Siap melayani kebutuhan dokumen dan kependudukan warga desa.",
        },
      ],
    });

    const statProfile = await prisma.statisticProfile.create({
      data: {
        villageProfileId: profile.id,
        title: "Demografi & Geografi Desa",
        description: "Data statistik kependudukan dan luas wilayah Desa Pringgodani.",
        sortOrder: 1,
      },
    });

    await prisma.villageStatistic.createMany({
      data: [
        { statisticProfileId: statProfile.id, label: "Jumlah Penduduk", value: "4.850", unit: "Jiwa", sortOrder: 1 },
        { statisticProfileId: statProfile.id, label: "Jumlah Kepala Keluarga", value: "1.240", unit: "KK", sortOrder: 2 },
        { statisticProfileId: statProfile.id, label: "Luas Wilayah", value: "850", unit: "Hektar", sortOrder: 3 },
        { statisticProfileId: statProfile.id, label: "Jumlah Dusun", value: "4", unit: "Dusun", sortOrder: 4 },
      ],
    });
  }

  // 3. News Categories & Types
  console.log("3/7 Seeding News Categories & Types...");
  const catKegiatan = await prisma.newsCategory.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: { id: BigInt(1), name: "Kegiatan Desa", description: "Liputan kegiatan sosial dan kebudayaan warga desa" },
  });

  const catPembangunan = await prisma.newsCategory.upsert({
    where: { id: BigInt(2) },
    update: {},
    create: { id: BigInt(2), name: "Pembangunan", description: "Informasi proyek infrastruktur dan sarana desa" },
  });

  await prisma.newsCategory.upsert({
    where: { id: BigInt(3) },
    update: {},
    create: { id: BigInt(3), name: "Pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
  });

  const catEkonomi = await prisma.newsCategory.upsert({
    where: { id: BigInt(4) },
    update: {},
    create: { id: BigInt(4), name: "Ekonomi & UMKM", description: "Kabar perkembangan usaha lokal dan ekonomi warga" },
  });

  const typeArtikel = await prisma.newsType.upsert({
    where: { slug: "artikel" },
    update: {},
    create: { name: "Artikel Berita", slug: "artikel", description: "Format publikasi tulisan berita berparagraf" },
  });

  await prisma.newsType.upsert({
    where: { slug: "galeri-foto" },
    update: {},
    create: { name: "Galeri Foto", slug: "galeri-foto", description: "Format publikasi album dokumentasi kegiatan" },
  });

  // 4. Potentials
  console.log("4/7 Seeding Village Potentials...");
  const potCatPertanian = await prisma.villagePotentialCategory.upsert({
    where: { slug: "pertanian-perkebunan" },
    update: {},
    create: { name: "Pertanian & Perkebunan", slug: "pertanian-perkebunan" },
  });

  const potCatKerajinan = await prisma.villagePotentialCategory.upsert({
    where: { slug: "kerajinan-seni" },
    update: {},
    create: { name: "Kerajinan & Seni", slug: "kerajinan-seni" },
  });

  const potJeruk = await prisma.villagePotential.upsert({
    where: { slug: "potensi-pertanian-jeruk-manis" },
    update: {},
    create: {
      villagePotentialCategoryId: potCatPertanian.id,
      name: "Jeruk Manis Pringgodani",
      slug: "potensi-pertanian-jeruk-manis",
      summary: "Perkebunan jeruk manis segar khas Desa Pringgodani dengan cita rasa manis alami melimpah.",
      coverUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const potBatik = await prisma.villagePotential.upsert({
    where: { slug: "potensi-batik-tulis-khas" },
    update: {},
    create: {
      villagePotentialCategoryId: potCatKerajinan.id,
      name: "Batik Tulis Khas Pringgodani",
      slug: "potensi-batik-tulis-khas",
      summary: "Karya seni batik tulis tradisional bermotif bambu dan keindahan flora desa.",
      coverUrl: "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80",
    },
  });

  // 5. News
  console.log("5/7 Seeding Sample News (Published & Pending)...");

  // Real Article from WordPress: Tasyakuran 17 Agustus & Perpisahan KKN UNIKAMA 2017
  const newsReal1 = await prisma.news.upsert({
    where: { slug: "tasyakuran-17-agustus-dan-perpisahan-kkn-unikama-2017-kelompok-3" },
    update: {},
    create: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "TASYAKURAN 17 AGUSTUS DAN PERPISAHAN KKN UNIKAMA 2017 KELOMPOK 3",
      slug: "tasyakuran-17-agustus-dan-perpisahan-kkn-unikama-2017-kelompok-3",
      excerpt: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan Desa Pringgodani. Tasyakuran ini dihadiri oleh masyarakat Desa Pringgodani, tokoh-tokoh agama serta Peserta KKN UNIKAMA.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-08-20T05:08:27Z"),
    },
  });

  const artDetailReal1 = await prisma.articleDetail.create({
    data: {
      newsId: newsReal1.id,
      title: newsReal1.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetailReal1.id,
        subHeading: "Tasyakuran Kemerdekaan RI & Perpisahan KKN",
        content: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan Desa Pringgodani. Tasyakuran ini dihadiri oleh masyarakat Desa Pringgodani, tokoh-tokoh agama serta Peserta KKN Universitas Muhammadiyah Kanjuruhan Malang (UNIKAMA) Kelompok 3.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetailReal1.id,
        subHeading: "Kebersamaan dan Harapan Warga Desa",
        content: "Dalam suasana hangat dan khidmat, seluruh warga berbaur bersama para mahasiswa KKN untuk memanjatkan doa kesyukuran serta mengapresiasi kontribusi dan pengabdian mahasiswa selama menjalankan program kerja di Desa Pringgodani.",
        imageUrl: null,
        sortOrder: 2,
      },
    ],
  });

  const news1 = await prisma.news.upsert({
    where: { slug: "kerja-bakti-pembersihan-irigasi-desa" },
    update: {},
    create: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      villagePotentialId: potJeruk.id,
      title: "Kerja Bakti Massal Pembersihan Saluran Irigasi Desa",
      slug: "kerja-bakti-pembersihan-irigasi-desa",
      excerpt: "Ratusan warga Desa Pringgodani kompak melaksanakan kerja bakti pembersihan alur irigasi sawah menjelang musim tanam.",
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-01T08:00:00Z"),
    },
  });

  const artDetail1 = await prisma.articleDetail.create({
    data: {
      newsId: news1.id,
      title: news1.title,
      coverUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail1.id,
        subHeading: "Semangat Gotong Royong Warga",
        content: "Pada Minggu pagi, ratusan warga antusias membawa cangkul dan pembersih rumput untuk merapikan alur irigasi utama desa. Kegiatan ini dipimpin langsung oleh Kepala Desa.",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail1.id,
        subHeading: "Dampak Positif bagi Pertanian Jeruk",
        content: "Dengan irigasi yang lancar, pasokan air menuju kebun jeruk warga terjamin pasokannya sehingga panen mendatang diperkirakan melimpah.",
        imageUrl: null,
        sortOrder: 2,
      },
    ],
  });

  // 6. UMKMs
  console.log("6/7 Seeding UMKM...");
  const umkmCatKuliner = await prisma.umkmCategory.upsert({
    where: { slug: "kuliner" },
    update: {},
    create: { name: "Kuliner", slug: "kuliner", description: "Aneka kuliner olahan makanan & minuman khas desa" },
  });

  const umkm1 = await prisma.umkm.upsert({
    where: { slug: "kopi-pringgodani-asri" },
    update: {},
    create: {
      umkmCategoryId: umkmCatKuliner.id,
      villagePotentialId: potJeruk.id,
      name: "Kopi Pringgodani Asri",
      slug: "kopi-pringgodani-asri",
      ownerName: "Ibu Nurhayati",
      description: "Produsen bubuk kopi biji roaster pilihan dengan aroma khas perbukitan Pringgodani.",
      phone: "081234567891",
      email: "kopipringgodani@gmail.com",
      address: "Dusun Krajan RT 02 / RW 01, Desa Pringgodani",
      coverUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
      latitude: -7.9812,
      longitude: 112.6315,
      openDay: "Senin - Sabtu",
      since: 2018,
      status: "APPROVED",
    },
  });

  await prisma.product.createMany({
    data: [
      { umkmId: umkm1.id, name: "Kopi Robusta Pringgodani 250g", description: "Biji kopi robusta pilihan dipanggang sedang", price: 35000, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
      { umkmId: umkm1.id, name: "Sirup Jeruk Manis Alami 500ml", description: "Sirup konsentrat buah jeruk manis asli", price: 25000, imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80" },
    ],
  });

  // 7. Maps
  console.log("7/7 Seeding Map Locations...");
  const mapCatFasilitas = await prisma.mapCategory.upsert({
    where: { slug: "fasilitas-umum" },
    update: {},
    create: { name: "Fasilitas Umum", slug: "fasilitas-umum", icon: "building", color: "#10B981" },
  });

  const mapCatPemerintahan = await prisma.mapCategory.upsert({
    where: { slug: "pemerintahan" },
    update: {},
    create: { name: "Pemerintahan", slug: "pemerintahan", icon: "account_balance", color: "#3B82F6" },
  });

  const mapCatPendidikan = await prisma.mapCategory.upsert({
    where: { slug: "pendidikan" },
    update: {},
    create: { name: "Pendidikan", slug: "pendidikan", icon: "school", color: "#F59E0B" },
  });

  await prisma.mapLocation.createMany({
    data: [
      {
        mapCategoryId: mapCatPemerintahan.id,
        name: "Balai Desa Pringgodani",
        shortDescription: "Kantor balai desa dan pusat pelayanan publik kependudukan Pringgodani.",
        imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
        address: "Jl. Raya Desa Pringgodani No. 1",
        latitude: -7.98100000,
        longitude: 112.63100000,
        googleMapsUrl: "https://maps.google.com/?q=-7.9810,112.6310",
      },
      {
        mapCategoryId: mapCatPendidikan.id,
        name: "SD Negeri 1 Pringgodani",
        shortDescription: "Sekolah dasar negeri terakreditasi A di lingkungan Desa Pringgodani.",
        imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
        address: "Jl. Pendidikan No. 5, Desa Pringgodani",
        latitude: -7.98300000,
        longitude: 112.63250000,
        googleMapsUrl: "https://maps.google.com/?q=-7.9830,112.6325",
      },
      {
        mapCategoryId: mapCatFasilitas.id,
        name: "Puskesmas Pembantu (Pustu) Pringgodani",
        shortDescription: "Pusat pelayanan kesehatan dasar dan posyandu warga desa.",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        address: "Jl. Sehat No. 2, Desa Pringgodani",
        latitude: -7.98200000,
        longitude: 112.62950000,
        googleMapsUrl: "https://maps.google.com/?q=-7.9820,112.6295",
      },
    ],
  });

  console.log("✅ Seeding Database Web Desa Pringgodani Selesai Sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
