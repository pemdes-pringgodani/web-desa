export async function generateUmkmSlug(name: string, db: any): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!baseSlug) {
    baseSlug = "umkm";
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.umkm.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

export async function generateCategorySlug(name: string, db: any): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!baseSlug) {
    baseSlug = "kategori";
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.umkmCategory.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

export async function generatePotentialSlug(name: string, db: any): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!baseSlug) {
    baseSlug = "potensi";
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.villagePotential.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
