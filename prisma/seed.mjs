import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seeding for Web Desa Pringgodani...");

  // 1. Website Setting
  console.log("1/5 Seeding Website Setting...");
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

  // 2. Village Profile & Officials
  console.log("2/5 Seeding Village Profile & Officials...");
  let profile = await prisma.villageProfile.findFirst();
  if (!profile) {
    profile = await prisma.villageProfile.create({
      data: {
        villageName: "Desa Pringgodani",
        headGreeting: "Selamat datang di portal resmi Desa Pringgodani. Kami berdedikasi melayani dan memajukan potensi desa bersama seluruh warga.",
        headPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
        aboutText: "Desa Pringgodani merupakan kawasan asri dan produktif di Kecamatan Bantur, Kabupaten Malang, dengan potensi unggulan pertanian jeruk manis dan aneka UMKM kreatif.",
        address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang",
        phone: "081234567890",
        email: "pemdes@pringgodani.desa.id",
      },
    });

    await prisma.villageOfficial.createMany({
      data: [
        {
          villageProfileId: profile.id,
          name: "Drs. H. Sugeng Riyadi",
          position: "Kepala Desa",
          photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
          email: "kades@pringgodani.desa.id",
          greeting: "Selamat datang di portal informasi resmi Desa Pringgodani.",
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
  }

  // 3. News Categories, Types & Sample News
  console.log("3/5 Seeding News Categories & Sample News...");
  const catKegiatan = await prisma.newsCategory.upsert({
    where: { slug: "kegiatan-desa" },
    update: {},
    create: { name: "Kegiatan Desa", slug: "kegiatan-desa", description: "Liputan kegiatan sosial dan kebudayaan warga desa" },
  });

  const catPembangunan = await prisma.newsCategory.upsert({
    where: { slug: "pembangunan" },
    update: {},
    create: { name: "Pembangunan", slug: "pembangunan", description: "Informasi proyek infrastruktur dan sarana desa" },
  });

  const catEkonomi = await prisma.newsCategory.upsert({
    where: { slug: "ekonomi-umkm" },
    update: {},
    create: { name: "Ekonomi & UMKM", slug: "ekonomi-umkm", description: "Kabar perkembangan usaha lokal dan ekonomi warga" },
  });

  const typeArtikel = await prisma.newsType.upsert({
    where: { slug: "artikel" },
    update: {},
    create: { name: "Artikel Berita", slug: "artikel", description: "Format publikasi tulisan berita berparagraf" },
  });

  const typeGaleri = await prisma.newsType.upsert({
    where: { slug: "galeri-foto" },
    update: {},
    create: { name: "Galeri Foto", slug: "galeri-foto", description: "Format publikasi album dokumentasi kegiatan" },
  });

  const news1 = await prisma.news.upsert({
    where: { slug: "kerja-bakti-pembersihan-irigasi-desa" },
    update: {},
    create: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "Kerja Bakti Massal Pembersihan Saluran Irigasi Desa",
      slug: "kerja-bakti-pembersihan-irigasi-desa",
      excerpt: "Ratusan warga Desa Pringgodani kompak melaksanakan kerja bakti pembersihan alur irigasi sawah menjelang musim tanam.",
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-01T08:00:00Z"),
    },
  });

  const artDetail1 = await prisma.articleDetail.upsert({
    where: { newsId: news1.id },
    update: {},
    create: {
      newsId: news1.id,
    },
  });

  const existingBlocks = await prisma.articleBlock.count({ where: { articleDetailId: artDetail1.id } });
  if (existingBlocks === 0) {
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
          subHeading: "Dampak Positif bagi Pertanian Desa",
          content: "Dengan irigasi yang lancar, pasokan air menuju perkebunan dan sawah warga terjamin lancar sehingga hasil panen mendatang diperkirakan optimal.",
          imageUrl: null,
          sortOrder: 2,
        },
      ],
    });
  }

  // 4. UMKM Categories
  console.log("4/5 Seeding UMKM Categories...");
  const umkmCatKuliner = await prisma.umkmCategory.upsert({
    where: { slug: "kuliner" },
    update: {},
    create: { name: "Kuliner", slug: "kuliner", description: "Aneka kuliner olahan makanan & minuman khas desa" },
  });

  const umkmCatKerajinan = await prisma.umkmCategory.upsert({
    where: { slug: "kerajinan" },
    update: {},
    create: { name: "Kerajinan", slug: "kerajinan", description: "Kerajinan tangan dan produk seni warga desa" },
  });

  const umkmCatPertanian = await prisma.umkmCategory.upsert({
    where: { slug: "pertanian" },
    update: {},
    create: { name: "Pertanian & Perkebunan", slug: "pertanian", description: "Hasil bumi, jeruk manis, dan produk tani desa" },
  });

  // 5. Sample UMKMs & Products
  console.log("5/5 Seeding Sample UMKMs & Products...");
  const umkm1 = await prisma.umkm.upsert({
    where: { slug: "tempe-balado-pringgodani" },
    update: {},
    create: {
      umkmCategoryId: umkmCatKuliner.id,
      name: "Tempe Balado Pringgodani",
      slug: "tempe-balado-pringgodani",
      ownerName: "Ibu Sulastri",
      description: "Produsen keripik tempe balado renyah khas Desa Pringgodani dengan bumbu rempah alami pilihan.",
      phone: "081234567891",
      email: "tempe.balado@gmail.com",
      address: "Dusun Krajan RT 02 RW 01, Desa Pringgodani",
      coverUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      latitude: -8.2811,
      longitude: 112.5664,
      mapsUrl: "https://maps.app.goo.gl/sample-link-tempe",
      since: 2018,
      openDay: "Senin - Sabtu",
      status: "APPROVED",
      publishedAt: new Date(),
    },
  });

  const existingProducts = await prisma.product.count({ where: { umkmId: umkm1.id } });
  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: [
        {
          umkmId: umkm1.id,
          name: "Keripik Tempe Balado Pedas Manis (250g)",
          description: "Keripik tempe balado gurih dengan baluran bumbu pedas manis renyah.",
          price: 15000,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        },
        {
          umkmId: umkm1.id,
          name: "Keripik Tempe Original Daun Jeruk (200g)",
          description: "Renyah tempe asli dengan aroma segar daun jeruk alami.",
          price: 13000,
          imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        },
      ],
    });
  }

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
