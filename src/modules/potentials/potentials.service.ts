import { PotentialsRepository } from "./potentials.repository";

export class PotentialsService {
  static async getAllPotentials() {
    return PotentialsRepository.findAll();
  }
}
