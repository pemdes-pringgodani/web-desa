import { prisma } from "../../shared/db/client";

export class PotentialsRepository {
  static async findAll() {
    return prisma.villagePotential.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
