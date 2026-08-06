import { PotentialsRepository } from "./potentials.repository";
import { NotFoundError } from "../../shared/errors/app-error";

export class PotentialsService {
  static async getAllPotentials() {
    return PotentialsRepository.findAll();
  }

  static async getPotentialBySlug(slug: string) {
    const potential = await PotentialsRepository.findBySlug(slug);
    if (!potential) {
      throw new NotFoundError(`Potensi desa dengan slug '${slug}' tidak ditemukan`);
    }
    return potential;
  }
}
