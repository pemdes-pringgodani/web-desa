import { MapsRepository, CreateMapLocationDTO, CreateMapCategoryDTO } from "./maps.repository";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

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

  static async createLocation(dto: CreateMapLocationDTO) {
    if (!dto.name || !dto.latitude || !dto.longitude || !dto.mapCategoryId) {
      throw new ValidationError("Nama, latitude, longitude, dan kategori wajib diisi");
    }
    return MapsRepository.createLocation(dto);
  }

  static async updateLocation(idStr: string, dto: Partial<CreateMapLocationDTO>) {
    const location = await this.getLocationById(idStr);
    return MapsRepository.updateLocation(location.id, dto);
  }

  static async deleteLocation(idStr: string) {
    const location = await this.getLocationById(idStr);
    return MapsRepository.deleteLocation(location.id);
  }

  static async createCategory(dto: CreateMapCategoryDTO) {
    if (!dto.name) {
      throw new ValidationError("Nama kategori wajib diisi");
    }
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return MapsRepository.createCategory({ ...dto, slug });
  }

  static async updateCategory(idStr: string, dto: Partial<CreateMapCategoryDTO>) {
    const id = BigInt(idStr);
    return MapsRepository.updateCategory(id, dto);
  }

  static async deleteCategory(idStr: string) {
    const id = BigInt(idStr);
    return MapsRepository.deleteCategory(id);
  }
}
