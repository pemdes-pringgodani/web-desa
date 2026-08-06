import { prisma } from "../../shared/db/client";

export class ProfileRepository {
  static async getVillageProfile() {
    return prisma.villageProfile.findFirst({
      include: {
        vision: {
          include: {
            missions: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
        histories: {
          include: {
            details: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        officials: true,
        statisticProfiles: {
          include: {
            statistics: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  }
}
