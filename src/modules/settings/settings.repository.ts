import { prisma } from "../../shared/db/client";

export class SettingsRepository {
  static async getSetting() {
    return prisma.websiteSetting.findFirst();
  }
}
