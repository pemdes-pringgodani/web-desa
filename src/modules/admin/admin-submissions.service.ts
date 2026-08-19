import { AdminSubmissionsRepository } from "./admin-submissions.repository";
import { ValidationError } from "../../shared/errors/app-error";

export class AdminSubmissionsService {
  static async getSubmissions() {
    return AdminSubmissionsRepository.getPendingSubmissions();
  }

  static async setNewsStatus(id: string, status: string, rejectionReason?: string) {
    const upperStatus = status.toUpperCase();
    const validStatuses = ["PUBLISHED", "REJECTED", "DRAFT", "PENDING"];
    if (!validStatuses.includes(upperStatus)) {
      throw new ValidationError(`Status berita '${status}' tidak valid`);
    }
    const updated = await AdminSubmissionsRepository.updateNewsStatus(
      id,
      upperStatus as "PUBLISHED" | "REJECTED" | "DRAFT" | "PENDING",
      rejectionReason
    );
    if (!updated) {
      throw new ValidationError(`Berita dengan ID '${id}' tidak ditemukan`);
    }
    return {
      id: updated.id.toString(),
      status: updated.status,
      title: updated.title,
    };
  }

  static async setUmkmStatus(id: string, status: string, rejectionReason?: string) {
    const upperStatus = status.toUpperCase();
    const validStatuses = ["APPROVED", "REJECTED", "PENDING", "DRAFT"];
    if (!validStatuses.includes(upperStatus)) {
      throw new ValidationError(`Status UMKM '${status}' tidak valid`);
    }
    const updated = await AdminSubmissionsRepository.updateUmkmStatus(
      id,
      upperStatus as "APPROVED" | "REJECTED" | "PENDING" | "DRAFT",
      rejectionReason
    );
    if (!updated) {
      throw new ValidationError(`UMKM dengan ID '${id}' tidak ditemukan`);
    }
    return {
      id: updated.id.toString(),
      status: updated.status,
      name: updated.name,
      phone: updated.phone,
    };
  }
}
