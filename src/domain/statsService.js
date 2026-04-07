import * as statsRepository from "@/repositories/statsRepository";

export async function getPlatformStats() {
  return statsRepository.getPlatformStats();
}
