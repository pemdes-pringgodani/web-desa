import { prisma } from "../src/shared/db/client";

async function main() {
  console.log("🌱 Starting Database Seeding with Real WordPress Data for Web Desa Pringgodani...");

  // 1. Clear Existing Data (except UMKM to preserve test products)
  console.log("🧹 Clearing old news, potentials, and profiles...");
  await prisma.articleBlock.deleteMany({});
  await prisma.articleDetail.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  await prisma.galleryDetail.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.potentialArticle.deleteMany({});
  await prisma.umkm.updateMany({ data: { villagePotentialId: null } });
  await prisma.villagePotential.deleteMany({});
  await prisma.villageStatistic.deleteMany({});
  await prisma.statisticProfile.deleteMany({});
  await prisma.historyDetail.deleteMany({});
  await prisma.villageHistory.deleteMany({});
  await prisma.villageOfficial.deleteMany({});
  await prisma.villageProfile.deleteMany({});
  await prisma.villageMission.deleteMany({});
  await prisma.villageVision.deleteMany({});

  // 2. Website Setting
  console.log("1/7 Seeding Website Setting...");
  await prisma.websiteSetting.upsert({
    where: { id: BigInt(1) },
    update: {
      websiteName: "Desa Pringgodani",
      logoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
      faviconUrl: "/favicon.ico",
      email: "info@pringgodani.desa.id",
      phone: "081234567890",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang, Jawa Timur 65179",
    },
    create: {
      id: BigInt(1),
      websiteName: "Desa Pringgodani",
      logoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
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

  // 3. Village Vision & 11 Missions from WordPress
  console.log("2/7 Seeding Real Visi & 11 Misi Desa...");
  const vision = await prisma.villageVision.create({
    data: {
      vision: "TERWUJUDNYA MASYARAKAT DAN APARATUR DESA YANG MUMPUNI DALAM MEWUJUDKAN KESEJAHTERAAN",
    },
  });

  await prisma.villageMission.createMany({
    data: [
      { villageVisionId: vision.id, mission: "Mewujudkan dan mengembangkan kegiatan keagamaan untuk menambah keimanan dan ketaqwaan kepada Tuhan Yang Maha Esa.", sortOrder: 1 },
      { villageVisionId: vision.id, mission: "Meningkatkan Pelayanan Kepada Masyarakat Yang Efisien, Demokratis, Adil Dan Merata.", sortOrder: 2 },
      { villageVisionId: vision.id, mission: "Meningkatkan peran serta masyarakat dalam bidang ekonomi, sosial, budaya, politik dalam rangka mendorong kemandirian masyarakat.", sortOrder: 3 },
      { villageVisionId: vision.id, mission: "Memberdayakan kelompok ekonomi konsumtif menjadi kelompok ekonomi produktif.", sortOrder: 4 },
      { villageVisionId: vision.id, mission: "Membangun kehidupan masyarakat yang lebih baik dan sejahtera melalui beberapa potensi yang ada.", sortOrder: 5 },
      { villageVisionId: vision.id, mission: "Meningkatkan kehidupan masyarakat yang semakin layak, adil dan merata serta memberi perhatian utama pada kebutuhan dasar dan terpenuhinya sarana prasarana umum.", sortOrder: 6 },
      { villageVisionId: vision.id, mission: "Mewujudkan dan mendorong terjadinya usaha-usaha kerukunan antar dan intern warga masyarakat yang disebabkan karena adanya perbedaan agama, keyakinan, organisasi, dan lainnya dalam suasana saling menghargai dan menghormati.", sortOrder: 7 },
      { villageVisionId: vision.id, mission: "Menata pemerintahan desa Pringgodani yang kompak dan bertanggung jawab dalam mengemban amanat masyarakat.", sortOrder: 8 },
      { villageVisionId: vision.id, mission: "Menumbuhkembangkan usaha kecil dan menengah.", sortOrder: 9 },
      { villageVisionId: vision.id, mission: "Membangun dan mendorong majunya bidang pendidikan baik formal maupun informal yang mudah diakses dan dinikmati seluruh warga masyarakat tanpa terkecuali yang mampu menghasilkan insan intelektual, inovatif dan enterpreneur (wirausahawan).", sortOrder: 10 },
      { villageVisionId: vision.id, mission: "Membangun dan mendorong usaha-usaha untuk pengembangan dan optimalisasi sektor pertanian, perkebunan, peternakan, dan perikanan, baik tahap produksi maupun tahap pengolahan hasilnya.", sortOrder: 11 },
    ],
  });

  // 4. Village Profile & Relational StatisticProfile / VillageStatistic
  console.log("3/7 Seeding Real Selayang Pandang & StatisticProfile...");
  const profile = await prisma.villageProfile.create({
    data: {
      villageVisionId: vision.id,
      structureImageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/j.png",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang",
      phone: "081234567890",
      email: "pemdes@pringgodani.desa.id",
    },
  });

  // Official Devices (Perangkat Desa)
  await prisma.villageOfficial.createMany({
    data: [
      {
        villageProfileId: profile.id,
        name: "H. Abdul Malek",
        position: "Kepala Desa Pringgodani",
        photoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
        email: "kades@pringgodani.desa.id",
        greeting: "Selamat datang di portal informasi resmi Desa Pringgodani. Kami berkomitmen mewujudkan masyarakat dan aparatur desa yang mumpuni dalam mewujudkan kesejahteraan.",
      },
      {
        villageProfileId: profile.id,
        name: "Bapak Ponimin",
        position: "Sekretaris Desa (Pak Carek)",
        photoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/5e6f1-img_0047.jpg",
        email: "sekdes@pringgodani.desa.id",
        greeting: "Pelayanan publik yang efisien, transparan, dan inklusif adalah amanat utama kami.",
      },
    ],
  });

  // StatisticProfile 1: Gambaran Umum & Demografi
  const statGeneral = await prisma.statisticProfile.create({
    data: {
      villageProfileId: profile.id,
      title: "Gambaran Umum & Demografi Desa Pringgodani",
      description: "Desa Pringgodani merupakan satu desa di bawah lingkup kecamatan Bantur yang terletak 6 Km dari pusat kecamatan. Desa Pringgodani memiliki empat dusun, yaitu : dusun Krajan, dusun Sengon, dusun Sumber Bendo, dusun Sumber Walo serta memiliki 4 Rukun Warga (RW) dan 33 Rukun Tetangga (RT). Sebagian besar penduduk desa Pringgodani rata-rata berprofesi sebagai petani, pedagang, dan buruh tani.",
      sortOrder: 1,
    },
  });

  await prisma.villageStatistic.createMany({
    data: [
      { statisticProfileId: statGeneral.id, label: "Jumlah Penduduk", value: "7.968", unit: "Jiwa", sortOrder: 1 },
      { statisticProfileId: statGeneral.id, label: "Jumlah Dusun", value: "4", unit: "Dusun", sortOrder: 2 },
      { statisticProfileId: statGeneral.id, label: "Jumlah Rukun Warga (RW)", value: "4", unit: "RW", sortOrder: 3 },
      { statisticProfileId: statGeneral.id, label: "Jumlah Rukun Tetangga (RT)", value: "33", unit: "RT", sortOrder: 4 },
    ],
  });

  // StatisticProfile 2: Geografi & Batas Wilayah
  const statGeo = await prisma.statisticProfile.create({
    data: {
      villageProfileId: profile.id,
      title: "Geografi & Batas Wilayah",
      description: "Ditinjau dari lokasi dan topografi, Desa Pringgodani berada di kawasan dataran tinggi perbukitan Kecamatan Bantur (ketinggian 1.300 Mdpl) dengan tanah yang sangat subur untuk pertanian tebu, padi, dan holtikultura.",
      sortOrder: 2,
    },
  });

  await prisma.villageStatistic.createMany({
    data: [
      { statisticProfileId: statGeo.id, label: "Luas Wilayah", value: "12,25", unit: "km²", sortOrder: 1 },
      { statisticProfileId: statGeo.id, label: "Iklim", value: "Tropis", unit: "-", sortOrder: 2 },
      { statisticProfileId: statGeo.id, label: "Ketinggian Tempat", value: "1.300", unit: "Mdpl", sortOrder: 3 },
      { statisticProfileId: statGeo.id, label: "Jarak ke Pusat Kecamatan Bantur", value: "6", unit: "km", sortOrder: 4 },
      { statisticProfileId: statGeo.id, label: "Jarak ke Ibukota Kabupaten Malang", value: "40", unit: "km", sortOrder: 5 },
      { statisticProfileId: statGeo.id, label: "Jarak ke Ibukota Provinsi Jawa Timur", value: "103", unit: "km", sortOrder: 6 },
    ],
  });

  // StatisticProfile 3: Sumber Air & Infrastruktur Dasar
  const statWater = await prisma.statisticProfile.create({
    data: {
      villageProfileId: profile.id,
      title: "Sumber Air & Infrastruktur Dasar",
      description: "Kondisi ketersediaan sarana dan prasarana sumber air bersih untuk kebutuhan harian warga dan pengairan lahan di Desa Pringgodani.",
      sortOrder: 3,
    },
  });

  await prisma.villageStatistic.createMany({
    data: [
      { statisticProfileId: statWater.id, label: "Mata Air Alami", value: "8", unit: "Titik", sortOrder: 1 },
      { statisticProfileId: statWater.id, label: "Sumur Gali Warga", value: "8", unit: "Titik", sortOrder: 2 },
      { statisticProfileId: statWater.id, label: "Pelanggan PDAM", value: "3", unit: "Titik", sortOrder: 3 },
    ],
  });

  // StatisticProfile 4: Sarana & Prasarana Pendidikan
  const statEdu = await prisma.statisticProfile.create({
    data: {
      villageProfileId: profile.id,
      title: "Sarana & Prasarana Pendidikan",
      description: "Jumlah sarana dan prasarana lembaga pendidikan yang beroperasi melayani anak-anak di Desa Pringgodani.",
      sortOrder: 4,
    },
  });

  await prisma.villageStatistic.createMany({
    data: [
      { statisticProfileId: statEdu.id, label: "Play Group / PAUD", value: "3", unit: "Unit", sortOrder: 1 },
      { statisticProfileId: statEdu.id, label: "Taman Kanak-Kanak (TK)", value: "3", unit: "Unit", sortOrder: 2 },
      { statisticProfileId: statEdu.id, label: "Sekolah Dasar (SD)", value: "3", unit: "Unit", sortOrder: 3 },
      { statisticProfileId: statEdu.id, label: "Madrasah Ibtidaiyah (MI)", value: "2", unit: "Unit", sortOrder: 4 },
      { statisticProfileId: statEdu.id, label: "Madrasah Tsanawiyah (MTs)", value: "1", unit: "Unit", sortOrder: 5 },
    ],
  });

  // 5. News Categories & Types
  console.log("4/7 Seeding News Categories & NewsTypes...");
  const catKegiatan = await prisma.newsCategory.upsert({
    where: { id: BigInt(1) },
    update: { name: "Kegiatan Desa", description: "Liputan kegiatan sosial, kebudayaan, dan kemasyarakatan Desa Pringgodani" },
    create: { id: BigInt(1), name: "Kegiatan Desa", description: "Liputan kegiatan sosial, kebudayaan, dan kemasyarakatan Desa Pringgodani" },
  });

  const catKKN = await prisma.newsCategory.upsert({
    where: { id: BigInt(2) },
    update: { name: "Kegiatan KKN", description: "Dokumentasi program pengabdian dan kegiatan mahasiswa KKN di Desa Pringgodani" },
    create: { id: BigInt(2), name: "Kegiatan KKN", description: "Dokumentasi program pengabdian dan kegiatan mahasiswa KKN di Desa Pringgodani" },
  });

  const catPembangunan = await prisma.newsCategory.upsert({
    where: { id: BigInt(3) },
    update: { name: "Pembangunan", description: "Informasi infrastruktur, fasilitas publik, dan sarana prasarana desa" },
    create: { id: BigInt(3), name: "Pembangunan", description: "Informasi infrastruktur, fasilitas publik, dan sarana prasarana desa" },
  });

  const catPengumuman = await prisma.newsCategory.upsert({
    where: { id: BigInt(4) },
    update: { name: "Pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
    create: { id: BigInt(4), name: "Pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
  });

  const catEkonomi = await prisma.newsCategory.upsert({
    where: { id: BigInt(5) },
    update: { name: "Ekonomi", description: "Kabar perkembangan ekonomi lokal dan potensi bisnis desa" },
    create: { id: BigInt(5), name: "Ekonomi", description: "Kabar perkembangan ekonomi lokal dan potensi bisnis desa" },
  });

  const catUMKM = await prisma.newsCategory.upsert({
    where: { id: BigInt(6) },
    update: { name: "UMKM", description: "Kabar usaha mikro kecil menengah dan produk warga desa" },
    create: { id: BigInt(6), name: "UMKM", description: "Kabar usaha mikro kecil menengah dan produk warga desa" },
  });

  const catUncategorized = await prisma.newsCategory.upsert({
    where: { id: BigInt(7) },
    update: { name: "Uncategorized", description: "Kategori umum publikasi awal" },
    create: { id: BigInt(7), name: "Uncategorized", description: "Kategori umum publikasi awal" },
  });

  const typeArtikel = await prisma.newsType.upsert({
    where: { slug: "artikel" },
    update: { name: "Artikel Berita" },
    create: { name: "Artikel Berita", slug: "artikel", description: "Format publikasi berita berparagraf dan berpenjelasan" },
  });

  const typeGaleri = await prisma.newsType.upsert({
    where: { slug: "galeri-foto" },
    update: { name: "Galeri Foto" },
    create: { name: "Galeri Foto", slug: "galeri-foto", description: "Format publikasi album foto dokumentasi kegiatan" },
  });

  // 6. Real Village Potentials
  console.log("5/7 Seeding Real Village Potentials...");
  const potCatPertanian = await prisma.villagePotentialCategory.upsert({
    where: { slug: "pertanian-pangan" },
    update: { name: "Pertanian & Tanaman Pangan" },
    create: { name: "Pertanian & Tanaman Pangan", slug: "pertanian-pangan" },
  });

  const potCatPerkebunan = await prisma.villagePotentialCategory.upsert({
    where: { slug: "perkebunan-tebu" },
    update: { name: "Perkebunan & Industri Tebu" },
    create: { name: "Perkebunan & Industri Tebu", slug: "perkebunan-tebu" },
  });

  const potTebu = await prisma.villagePotential.create({
    data: {
      villagePotentialCategoryId: potCatPerkebunan.id,
      name: "Potensi Perkebunan Tebu Desa Pringgodani",
      slug: "potensi-perkebunan-tebu",
      summary: "Perkebunan tebu merupakan salah satu komoditas utama dan sumber mata pencaharian warga Desa Pringgodani.",
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
    },
  });

  const potPadi = await prisma.villagePotential.create({
    data: {
      villagePotentialCategoryId: potCatPertanian.id,
      name: "Potensi Pertanian Padi & Tanaman Pangan",
      slug: "potensi-pertanian-padi",
      summary: "Sektor pertanian tanaman pangan padi dan jagung di lahan subur Desa Pringgodani.",
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/28880683.jpg",
    },
  });

  // 7. Seeding 11 Real News Items (Artikel vs Galeri)
  console.log("6/7 Seeding 11 Real News Items from WordPress (Categories & Authors)...");

  // 7A. GALERI FOTO (GalleryDetail & GalleryImage)

  // Galeri 1: KKN UNIKAMA 2016 (Author: adminpringgondani, Category: Kegiatan KKN)
  const newsKkn2016 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeGaleri.id,
      title: "Kuliah Kerja Nyata (KKN) Universitas Kanjuruhan Malang 2016",
      slug: "kuliah-kerja-nyata-kkn-universitas-kanjuruhan-malang-2016",
      excerpt: "Album foto dokumentasi pengabdian dan perpisahan Kuliah Kerja Nyata (KKN) Universitas Kanjuruhan Malang angkatan 2016 di Desa Pringgodani. Penulis: adminpringgondani.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-19T04:11:06Z"),
    },
  });

  const galDetail2016 = await prisma.galleryDetail.create({
    data: {
      newsId: newsKkn2016.id,
      title: newsKkn2016.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/92666-img_0250.jpg",
    },
  });

  await prisma.galleryImage.createMany({
    data: [
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/92666-img_0250.jpg", imageDescription: "Photo bersama orangtua kami di desa Pringgodani", sortOrder: 1 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/0ffc3-img_0587.jpg", imageDescription: "Photo penyerahan cendramata oleh wakil kordes kepada bapak kepala desa Pringgodani H. Abdul Malek", sortOrder: 2 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/621d9-img_0588.jpg", imageDescription: "Photo penyerahan cendramata oleh kordes KKN waktu acara perpisahan bersama bapak kepala desa Pringgodani H. Abdul Malek", sortOrder: 3 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/5e6f1-img_0047.jpg", imageDescription: "Photo bersama bapak Ponimin (pak Carek) waktu acara kader PKK desa Pringgodani", sortOrder: 4 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/0bde8-img_0057.jpg", imageDescription: "Photo bersama bapak kepala desa Pringgodani H. Abdul Malek saat kegiatan kader PKK", sortOrder: 5 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/f8be0-img_0173.jpg", imageDescription: "Photo bersama bapak kepala desa Pringgodani H. Abdul Malek setelah upacara HUT RI ke 71", sortOrder: 6 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/b5ff6-img_0230.jpg", imageDescription: "Photo bersama orangtua kami di desa Pringgodani", sortOrder: 7 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/c29e2-img_0591.jpg", imageDescription: "Photo setelah acara perpisahan bersama perangkat desa dan tokoh masyarakat Pringgodani", sortOrder: 8 },
      { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/9f72d-img_0594.jpg", imageDescription: "Photo bersama perangkat desa Pringgodani Bantur", sortOrder: 9 },
    ],
  });

  // Galeri 2: KKN UNIKAMA 2017 (Author: adminpringgondani, Category: Kegiatan KKN)
  const newsKkn2017 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeGaleri.id,
      title: "KULIAH KERJA NYATA (KKN) UNIVERSITAS KANJURUHAN MALANG 2017",
      slug: "kuliah-kerja-nyata-kkn-universitas-kanjuruhan-malang-2017",
      excerpt: "Album foto posko dan pengabdian 3 kelompok Kuliah Kerja Nyata (KKN) UNIKAMA 2017 di Desa Pringgodani. Penulis: adminpringgondani.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-23T14:55:46Z"),
    },
  });

  const galDetail2017 = await prisma.galleryDetail.create({
    data: {
      newsId: newsKkn2017.id,
      title: newsKkn2017.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0626.jpg",
    },
  });

  await prisma.galleryImage.createMany({
    data: [
      { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0626.jpg", imageDescription: "Posko Kelompok 1 yang diketuai oleh M.Rifai bertempat tinggal di dusun Krajan yaitu pada kediaman ibu Sutini.", sortOrder: 1 },
      { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0633.jpg", imageDescription: "Posko Kelompok 2 yang diketuai oleh Mahbub bertempat tinggal di dusun Sumberbendo RT 20 yaitu pada kediaman Bapak Imam.", sortOrder: 2 },
      { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0558.jpg", imageDescription: "Posko Kelompok 3 yang diketuai oleh Romi Mikhael bertempat tinggal di dusun Sumberbendo RT 18 yaitu pada kediaman ibu Sumrati.", sortOrder: 3 },
    ],
  });

  // 7B. ARTIKEL BERITA (ArticleDetail & ArticleBlock)

  // Artikel 1: Tasyakuran 17 Agustus (Author: adminpringgondani, Category: Kegiatan Desa)
  const news1 = await prisma.news.create({
    data: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "TASYAKURAN 17 AGUSTUS DAN PERPISAHAN KKN UNIKAMA 2017 KELOMPOK 3",
      slug: "tasyakuran-17-agustus-dan-perpisahan-kkn-unikama-2017-kelompok-3",
      excerpt: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan desa Pringgodani. Tasyakuran ini di hadiri oleh masyarakat desa Pringgodani, tokoh tokoh agama serta Peserta KKN Universitas Kanjuruhan Malang.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-08-20T05:08:27Z"),
    },
  });

  const artDetail1 = await prisma.articleDetail.create({
    data: {
      newsId: news1.id,
      title: news1.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail1.id,
        subHeading: "Tasyakuran Kemerdekaan RI & Perpisahan KKN UNIKAMA 2017 Kelompok 3",
        content: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan desa Pringgodani. Tasyakuran ini di hadiri oleh masyarakat desa Pringgodani, tokoh tokoh agama serta Peserta KKN Universitas Kanjuruhan Malang.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
        sortOrder: 1,
      },
    ],
  });

  // Artikel 2: Pemasangan Papan PKK (Author: adminpringgondani, Category: Kegiatan KKN)
  const news2 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeArtikel.id,
      title: "PEMASANGAN PAPAN 10 PROGRAM POKOK PKK",
      slug: "pemasangan-papan-10-program-pokok-pkk",
      excerpt: "Pemasangan papan 10 Program Pokok PPK merupakan salah satu dari program kerja kelompok 3 desa Pringgodani.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-08-20T05:03:06Z"),
    },
  });

  const artDetail2 = await prisma.articleDetail.create({
    data: {
      newsId: news2.id,
      title: news2.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00211.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail2.id,
        subHeading: "Pemasangan Papan 10 Program Pokok PKK",
        content: "Pemasangan papan 10 Program Pokok PPK merupakan salah satu dari program kerja kelompok 3 desa Pringgodani.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00211.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail2.id,
        subHeading: "Gambar 1.0 Pemasangan Papan 10 Program PKK bersama perangkat desa",
        content: "Pemerintah Desa Pringgodani bersama mahasiswa KKN mensosialisasikan 10 Program Pokok PKK demi pemberdayaan kesejahteraan keluarga warga Desa Pringgodani.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00201.jpg",
        sortOrder: 2,
      },
    ],
  });

  // Artikel 3: Posyandu Lansia (Author: adminpringgondani, Category: Kegiatan KKN)
  const news3 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeArtikel.id,
      title: "POSYANDU LANSIA",
      slug: "posyandu-lansia",
      excerpt: "Posyandu Lansia merupakan rutin yang dilaksanakan oleh Desa Pringgodani yaitu pemeriksaan kesehatan para lansia...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-08-10T12:10:49Z"),
    },
  });

  const artDetail3 = await prisma.articleDetail.create({
    data: {
      newsId: news3.id,
      title: news3.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170810-wa0011.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail3.id,
        subHeading: "Pemeriksaan Kesehatan Rutin Lansia",
        content: "Posyandu Lansia merupakan rutin yang dilaksanakan oleh Desa Pringgodani yaitu pemeriksaan kesehatan para lansia mulai tensi darah, penimbangan berat badan dan keluhan-keluhan para lansia. Posyandu ini gratis tanpa dipungut biaya apapun. Para Lansia ini diberikan kartu sehat guna untuk mengecek trafik kesehatan dari minggu ke minggu serta keluhan keluhan. Penyuluhan Posyandu Lansia ini merupakan salah satu program kerja dari kelompok 3 KKN desa Pringgodani yang dilaksanakan tanggal 9 Agustus 2017. Dalam kegiatan ini tim dari kelompok 3 bekerja sama dengan tim kesehatan desa Pringgodani.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170810-wa0011.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail3.id,
        subHeading: "Gambar 1. Pelaksanaan Program Kerja Posyandu Lansia oleh kelompok 3 KKN Desa Pringgodani",
        content: "Dalam program kerja ini terdapat penyuluhan, pendataan para lansia, pemeriksaan serta pemberian konsumsi untuk setiap lansia yang daftar. Untuk kegiatan awal yaitu pendataan para lansia. Kemudian para lansia di berikan penyuluhan tentang pentingnya kesehatan terutama bagi lansia yang rentan akan kesehatannya. Selanjutnya, para lansia melakukan pengecekan kesehatan yaitu tensi dan berat badan serta pemberian obat bagi lansia yang terdapat keluhan pada kesehatanya. Dan yang terakhir dari kegiatan ini yaitu pemberian konsumsi gizi untuk para lansia.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170810-wa0013.jpg",
        sortOrder: 2,
      },
      {
        articleDetailId: artDetail3.id,
        subHeading: "Gambar 2. Pemeriksaan Lansia",
        content: "Para Lansia Desa Pringgodani sangat antusias dalam pemeriksaan kesehatan di posyandu lansia ini. Menurut mereka kesehatan adalah nomor pertama yang harus diperhatikan.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170810-wa0010.jpg",
        sortOrder: 3,
      },
    ],
  });

  // Artikel 4: Penyuluhan Pendidikan MTs (Author: adminpringgondani, Category: Kegiatan KKN)
  const news4 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeArtikel.id,
      title: "Penyuluhan Pentingnya Pendidikan di MTS Bustanul Qura'ni Al Ihsani",
      slug: "penyuluhan-pentingnya-pendidikan-di-mts-bustanul-qurani-al-ihsani",
      excerpt: "Penyuluhan pentingnya pendidikan merupakan suatu program yang dilaksanakan untuk memotivasi dan memberikan wawasan siswa dan siswi Mts Bustanul Qura'ni Al Ihsani...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-25T07:53:56Z"),
    },
  });

  const artDetail4 = await prisma.articleDetail.create({
    data: {
      newsId: news4.id,
      title: news4.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0602.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail4.id,
        subHeading: "Motivasi dan Edukasi Pendidikan Generasi Muda",
        content: "Penyuluhan pentingnya pendidikan merupakan suatu program yang dilaksanakan untuk memotivasi dan memberikan wawasan siswa dan siswi Mts Bustanul Qura'ni Al Ihsani tentang pentingnaya pendidikan. Program ini sangat tepat dilakukan di Mts Bustanul Qura'ni Al Ihsani, karena masih rendahnya tingkat kesadaran masyarakat sekitar terhadap pendidikan. Program kerja tersebut dilaksanakan pada Kamis, 20 Juli 2017 sekitar pukul 09.00.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0602.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail4.id,
        subHeading: "Gambar 01. Pemberian Materi Pentingnya Pendidikan",
        content: "Kegiatan ini diawali dengan pemaparan materi tentang pentingnya pendidikan. Materi dijabarkan selama 30 menit, dan dilanjutkan dengan pemberian quiz dan hadiah untuk tiga pertanyaan.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0588.jpg",
        sortOrder: 2,
      },
      {
        articleDetailId: artDetail4.id,
        subHeading: "Gambar 02. Partisipasi siswa dalam penulisan cita cita",
        content: "Para siswa-siswi sangat antusias menuliskan cita-cita masa depan mereka sebagai dorongan semangat menuntut ilmu setinggi-tingginya.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0579.jpg",
        sortOrder: 3,
      },
    ],
  });

  // Artikel 5: Lomba Voli Bantur (Author: adminpringgondani, Category: Kegiatan Desa)
  const news5 = await prisma.news.create({
    data: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "Lomba Voly Se-Kecamatan Bantur",
      slug: "lomba-voly-se-kecamatan-bantur",
      excerpt: "Lomba Voly ini diadakan oleh desa Pringgodani yang dibuka pada tanggal 21 Juli 2017 pukul 20.30 WIB untuk memperingati HUT RI ke 72 th...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-08-10T10:51:11Z"),
    },
  });

  const artDetail5 = await prisma.articleDetail.create({
    data: {
      newsId: news5.id,
      title: news5.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/img-20170810-wa0017.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail5.id,
        subHeading: "Pembukaan Turnamen Bola Voli Pringgodani",
        content: "Lomba Voly ini diadakan oleh desa Pringgodani yang dibuka pada tanggal 21 Juli 2017 pukul 20.30 WIB untuk memperingati HUT RI ke 72 th. Lomba ini di laksanakan se ranting Bantur/se Kecamatan Bantur. Peserta dimulai dari usia remaja sampai dewasa yang terdiri dari kalangan masyarakat se kecamatan Bantur.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/img-20170810-wa0017.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail5.id,
        subHeading: "Gambar 1. Peserta Lomba Volly Se kecamatan Bantur",
        content: "Dalam pelaksanaan lomba Volly ini kalangan masyarakat sangat antusias untuk mengikuti kegiatan ini. Terlihat dari gambar dokumentasi diatas peserta sangat sportif dalam perlombaan. Di samping itu terlihat juga para penonton yang antusias mendukung dari kubu masing masing. Mulai anak kecil, remaja, dewasa, hingga lanjut usia.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170810-wa0015.jpg",
        sortOrder: 2,
      },
    ],
  });

  // Artikel 6: Imunisasi Campak & Rubella (Author: adminpringgondani, Category: Kegiatan Desa)
  const news6 = await prisma.news.create({
    data: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "Penyuluhan Imunisasi Campak dan Rubella Oleh Puskesmas Wonokerto",
      slug: "penyuluhan-imunisasi-campak-dan-rubella-oleh-puskesmas-wonokerto",
      excerpt: "Penyuluhan Imunisasi Campak dan Rubella oleh Puskesmas Wonokerto dilaksanakan Jumat, 21 Juli 2017 sekitar pukul 09.00...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-25T08:30:00Z"),
    },
  });

  const artDetail6 = await prisma.articleDetail.create({
    data: {
      newsId: news6.id,
      title: news6.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/4-poster-mr_1.png",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail6.id,
        subHeading: "Penyuluhan Imunisasi MR di Kantor Desa",
        content: "Penyuluhan Imunisasi Campak dan Rubella oleh Puskesmas Wonokerto dilaksanakan Jumat, 21 Juli 2017 sekitar pukul 09.00 di Kantor Desa Pringgodani. Dalam Penyuluhan tersebut dihadiri oleh TIM Penyuluh , Camat, Kepala Desa, Perangkat Kantor Desa serta Ibu-Ibu PKK.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/4-poster-mr_1.png",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail6.id,
        subHeading: "Pencegahan Bahaya Campak & Rubella Bagi Anak",
        content: "Dalam Penyuluhan ini TIM Penyuluh dari Puskesmas mengajak masyarakatnya terutama pada buah hati untuk imunisasi campak dan rubella. Imunisasi ini tidak dipungut biaya apapun (gratis). Dalam kegiatan penyuluhan tersebut terlihat ibu-ibu PKK sangat antusias untuk mengimunisasi buah hatinya ke puskesmas karena pentingnya imunisasi tersebut dari bahaya campak dan rubella yang dapat merenggut nyawa.",
        imageUrl: null,
        sortOrder: 2,
      },
    ],
  });

  // Artikel 7: Bimbingan Belajar (Author: adminpringgondani, Category: Kegiatan KKN)
  const news7 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeArtikel.id,
      title: "Bimbingan Belajar",
      slug: "bimbingan-belajar",
      excerpt: "Bimbingan belajar ini merupakan salah satu kegiatan yang diselenggarakan oleh kelompok 3 dikediaman ibu Sumrati...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-25T08:11:23Z"),
    },
  });

  const artDetail7 = await prisma.articleDetail.create({
    data: {
      newsId: news7.id,
      title: news7.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0502.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail7.id,
        subHeading: "Program Pendampingan Bimbingan Belajar",
        content: "Bimbingan belajar ini merupakan salah satu kegiatan yang diselenggarakan oleh kelompok 3 dikediaman ibu Sumrati. Kegiatan ini bertujuan untuk membantu anak anak Desa Pringgodani setempat baik dalam jenjang SD, SMP atau sederajat maupun PAUD dalam melaksanakan kegiatan belajar sehari-hari. Bimbingan belajar dilaksanakan pada hari Senin sampai Kamis pukul 15.00 wib.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0502.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail7.id,
        subHeading: "Gambar 01. Kegiatan Bimbel",
        content: "Suasana bimbingan belajar bersama anak-anak desa dengan penuh antusias.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0510.jpg",
        sortOrder: 2,
      },
      {
        articleDetailId: artDetail7.id,
        subHeading: "Gambar 02. Suasana Bimbel",
        content: "Pendampingan pengerjaan tugas sekolah dan penyampaian materi pelajaran dasar.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0514.jpg",
        sortOrder: 3,
      },
    ],
  });

  // Artikel 8: Kesehatan Gigi SDN 01 (Author: adminpringgondani, Category: Kegiatan KKN)
  const news8 = await prisma.news.create({
    data: {
      newsCategoryId: catKKN.id,
      newsTypeId: typeArtikel.id,
      title: "Penyuluhan Pentingnya Kesehatan Gigi Di SDN Pringgodani 01",
      slug: "penyuluhan-pentingnya-kesehatan-gigi-di-sdn-pringgodani-01",
      excerpt: "Penyuluhan Pentingnya Kesehatan Gigi di SDN pringgodani 01 merupakan program kerja yang dilaksanakan oleh kelompok 3...",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-25T07:01:25Z"),
    },
  });

  const artDetail8 = await prisma.articleDetail.create({
    data: {
      newsId: news8.id,
      title: news8.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0738.jpg",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail8.id,
        subHeading: "Edukasi Kebersihan & Perawatan Gigi Usia Dini",
        content: "Penyuluhan Pentingnya Kesehatan Gigi di SDN pringgodani 01 merupakan program kerja yang dilaksanakan oleh kelompok 3. Program kerja tersebut dilaksanakan pada Rabu, 19 Juli 2017 sekitar pukul 09.00. Penyuluhan Kesehatan Gigi tersebut dilaksanakan pada siswa dan siswi SD Pringgodani 01 kelas 2 dan kelas 3 pada jam istirahat. Para siswa di berikan pengetahuan dan praktek tentang pentingnya kebersihan dan perawatan gigi terutama pada usia dini. Selain itu, siswa juga mendapatkan hadiah apabila berhasil menjawab kuis dari kegiatan ini. Pada penyuluhan bagian praktek , para siswa diberikan alat alat berupa sikat gigi, pasta gigi serta air untuk praktek gosok gigi yang benar bersama sama. Pada kegiatan tersebut para siswa, wali, guru serta tim penyuluh (kakak kakak KKN) sangat antusias dengan yel yel khas yang diberikan kakak kakak KKN.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0738.jpg",
        sortOrder: 1,
      },
      {
        articleDetailId: artDetail8.id,
        subHeading: "Gambar 01. Kegiatan Penyuluhan dan Memberikan Pengetahuan Tentang Pentingnya Menggosok Gigi",
        content: "Pemberian pemahaman teori dasar pentingnya merawat kebersihan gigi dan mulut.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0669.jpg",
        sortOrder: 2,
      },
      {
        articleDetailId: artDetail8.id,
        subHeading: "Gambar 02. Pemberian Hadiah Kuis",
        content: "Penyerahan hadiah kuis interaktif bagi siswa yang dapat menjawab pertanyaan.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0689.jpg",
        sortOrder: 3,
      },
      {
        articleDetailId: artDetail8.id,
        subHeading: "Gambar 03. Praktek Menggosok Gigi",
        content: "Praktek bersama cara menyikat gigi yang tepat menggunakan peralatan gratis yang dibagikan.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0711.jpg",
        sortOrder: 4,
      },
      {
        articleDetailId: artDetail8.id,
        subHeading: "Gambar 04. Antusias Para Siswa dan Kakak-Kakak KKN dalam Menyanyikan Yel-Yel",
        content: "Kecerian siswa-siswi dan mahasiswa KKN menyanyikan yel-yel kesehatan gigi.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0726.jpg",
        sortOrder: 5,
      },
    ],
  });

  // Artikel 9: First Blog Post (Author: sellyprasticca, Category: Uncategorized)
  const news9 = await prisma.news.create({
    data: {
      newsCategoryId: catUncategorized.id,
      newsTypeId: typeArtikel.id,
      title: "First blog post",
      slug: "first-blog-post",
      excerpt: "Selamat datang di website portal informasi resmi Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang. Penulis: sellyprasticca.",
      status: "PUBLISHED",
      publishedAt: new Date("2017-07-05T07:33:47Z"),
    },
  });

  const artDetail9 = await prisma.articleDetail.create({
    data: {
      newsId: news9.id,
      title: news9.title,
      coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
    },
  });

  await prisma.articleBlock.createMany({
    data: [
      {
        articleDetailId: artDetail9.id,
        subHeading: "Selamat Datang di Portal Informasi Desa Pringgodani",
        content: "Selamat datang di website portal informasi resmi Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang. Portal ini menjadi media publikasi resmi berbagai program pembangunan, profil wilayah, potensi lokal, serta agenda kegiatan masyarakat desa.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
        sortOrder: 1,
      },
    ],
  });

  // 8. Preserve UMKM Data
  console.log("7/7 Preserving UMKM Data & Map Locations...");
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
      villagePotentialId: potTebu.id,
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

  const existingProducts = await prisma.product.findMany({ where: { umkmId: umkm1.id } });
  if (existingProducts.length === 0) {
    await prisma.product.createMany({
      data: [
        { umkmId: umkm1.id, name: "Kopi Robusta Pringgodani 250g", description: "Biji kopi robusta pilihan dipanggang sedang", price: 35000, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
        { umkmId: umkm1.id, name: "Sirup Jeruk Manis Alami 500ml", description: "Sirup konsentrat buah jeruk manis asli", price: 25000, imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80" },
      ],
    });
  }

  // Map Categories & Real Locations in Desa Pringgodani, Kec. Bantur, Kab. Malang
  const mapCatPemerintahan = await prisma.mapCategory.upsert({
    where: { slug: "kantor-desa" },
    update: { name: "Kantor Desa", color: "#3B82F6", icon: "account_balance" },
    create: { name: "Kantor Desa", slug: "kantor-desa", icon: "account_balance", color: "#3B82F6" },
  });

  const mapCatPendidikan = await prisma.mapCategory.upsert({
    where: { slug: "pendidikan" },
    update: { name: "Pendidikan", color: "#F59E0B", icon: "school" },
    create: { name: "Pendidikan", slug: "pendidikan", icon: "school", color: "#F59E0B" },
  });

  const mapCatIbadah = await prisma.mapCategory.upsert({
    where: { slug: "ibadah" },
    update: { name: "Ibadah", color: "#8B5CF6", icon: "mosque" },
    create: { name: "Ibadah", slug: "ibadah", icon: "mosque", color: "#8B5CF6" },
  });

  const mapCatKesehatan = await prisma.mapCategory.upsert({
    where: { slug: "kesehatan" },
    update: { name: "Kesehatan", color: "#10B981", icon: "medical_services" },
    create: { name: "Kesehatan", slug: "kesehatan", icon: "medical_services", color: "#10B981" },
  });

  const mapCatWisata = await prisma.mapCategory.upsert({
    where: { slug: "wisata-alam" },
    update: { name: "Wisata & Potensi", color: "#EC4899", icon: "park" },
    create: { name: "Wisata & Potensi", slug: "wisata-alam", icon: "park", color: "#EC4899" },
  });

  await prisma.mapLocation.deleteMany({});
  await prisma.mapLocation.createMany({
    data: [
      {
        mapCategoryId: mapCatPemerintahan.id,
        name: "Kantor Balai Desa Pringgodani",
        shortDescription: "Pusat balai desa dan pelayanan administrasi warga Pringgodani.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
        address: "Jl. Raya Desa Pringgodani No. 1, Dusun Krajan",
        latitude: -8.28110000,
        longitude: 112.56640000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2811,112.5664",
      },
      {
        mapCategoryId: mapCatPendidikan.id,
        name: "SD Negeri 01 Pringgodani",
        shortDescription: "Sekolah dasar negeri utama Pringgodani di Dusun Krajan.",
        imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
        address: "Dusun Krajan RT 05 RW 01, Desa Pringgodani",
        latitude: -8.27850000,
        longitude: 112.56420000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2785,112.5642",
      },
      {
        mapCategoryId: mapCatPendidikan.id,
        name: "SD Negeri 02 Pringgodani",
        shortDescription: "Lembaga sekolah dasar negeri di wilayah Dusun Sengon.",
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        address: "Dusun Sengon RT 12 RW 02, Desa Pringgodani",
        latitude: -8.28450000,
        longitude: 112.56200000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2845,112.5620",
      },
      {
        mapCategoryId: mapCatPendidikan.id,
        name: "MI & MTs Pringgodani",
        shortDescription: "Madrasah Ibtidaiyah dan Tsanawiyah terpadu Desa Pringgodani.",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        address: "Dusun Sumberbendo RT 18, Desa Pringgodani",
        latitude: -8.28250000,
        longitude: 112.56900000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2825,112.5690",
      },
      {
        mapCategoryId: mapCatKesehatan.id,
        name: "Puskesmas Pembantu (Pustu) Pringgodani",
        shortDescription: "Pusat pelayanan kesehatan dasar dan posyandu warga desa.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170809-wa0009.jpg",
        address: "Dusun Krajan RT 02 RW 01, Desa Pringgodani",
        latitude: -8.28020000,
        longitude: 112.56800000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2802,112.5680",
      },
      {
        mapCategoryId: mapCatIbadah.id,
        name: "Masjid Jami' Pringgodani",
        shortDescription: "Masjid utama tempat ibadah sholat Jumat dan pengajian warga.",
        imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80",
        address: "Dusun Sumberbendo RT 20, Desa Pringgodani",
        latitude: -8.28350000,
        longitude: 112.56800000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2835,112.5680",
      },
      {
        mapCategoryId: mapCatWisata.id,
        name: "Perkebunan Tebu Desa Pringgodani",
        shortDescription: "Hamparan komoditas pertanian utama dan industri tebu warga.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
        address: "Dusun Sumber Walo, Desa Pringgodani",
        latitude: -8.27550000,
        longitude: 112.56050000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2755,112.5605",
      },
      {
        mapCategoryId: mapCatWisata.id,
        name: "Posko KKN & Pusat UMKM Pringgodani",
        shortDescription: "Pusat pembinaan UMKM dan galeri produk warga desa.",
        imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0626.jpg",
        address: "Dusun Krajan, Desa Pringgodani",
        latitude: -8.28400000,
        longitude: 112.56700000,
        googleMapsUrl: "https://maps.google.com/?q=-8.2840,112.5670",
      },
    ],
  });

  console.log("✅ Database Seeding for Web Desa Pringgodani Selesai dengan Sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
