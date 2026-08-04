import { MapsRepository } from "./maps.repository";
import { NotFoundError } from "../../shared/errors/app-error";

export class MapsService {
  static async getCategories() {
    return MapsRepository.findCategories();
  }

  static async getLocations(categorySlug?: string, searchQuery?: string) {
    return MapsRepository.findLocations(categorySlug, searchQuery);
  }

  static async getLocationById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID lokasi tidak valid");
    }

    const location = await MapsRepository.findLocationById(id);
    if (!location) {
      throw new NotFoundError(`Lokasi dengan ID ${idStr} tidak ditemukan`);
    }

    return location;
  }

  static async resolveLocation(query: string) {
    const location = await MapsRepository.resolveLocation(query);
    if (!location) {
      throw new NotFoundError(`Lokasi untuk pencarian '${query}' tidak ditemukan`);
    }
    return location;
  }
}
