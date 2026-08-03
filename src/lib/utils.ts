/**
 * Utility to convert BigInt fields in an object to strings or numbers
 * so that they can be serialized to JSON without throwing an error.
 */
export function serializeBigInt<T>(data: T): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

/**
 * Generates a unique slug for a UMKM based on its name.
 * If the slug already exists, it appends a counter (e.g., -2, -3).
 */
export async function generateUmkmSlug(name: string, db: any): Promise<string> {
  // 1. Clean the name to create a base slug
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/(^-|-$)+/g, "");   // Remove leading/trailing hyphens

  if (!baseSlug) {
    baseSlug = "umkm";
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  // 2. Query DB iteratively until a unique slug is found
  while (true) {
    const existing = await db.umkm.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true }
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generates a unique slug for a UMKM Category.
 */
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
      select: { id: true }
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generates a unique slug for a Village Potential.
 */
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
      select: { id: true }
    });

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

