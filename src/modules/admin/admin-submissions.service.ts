import { AdminSubmissionsRepository } from "./admin-submissions.repository";
import { ValidationError } from "../../shared/errors/app-error";

export class AdminSubmissionsService {
  static async getSubmissions() {
    return AdminSubmissionsRepository.getPendingSubmissions();
  }

  static async setNewsStatus(id: string, status: string) {
    const validStatuses = ["PUBLISHED", "REJECTED", "DRAFT", "PENDING"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status berita '${status}' tidak valid`);
    }
    const updated = await AdminSubmissionsRepository.updateNewsStatus(
      id,
      status as "PUBLISHED" | "REJECTED" | "DRAFT"
    );
    return {
      id: updated.id.toString(),
      status: updated.status,
      title: updated.title,
    };
  }

  static async setUmkmStatus(id: string, status: string) {
    const validStatuses = ["APPROVED", "REJECTED", "PENDING"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status UMKM '${status}' tidak valid`);
    }
    const updated = await AdminSubmissionsRepository.updateUmkmStatus(
      id,
      status as "APPROVED" | "REJECTED" | "PENDING"
    );
    return {
      id: updated.id.toString(),
      status: updated.status,
      name: updated.name,
    };
  }
}
