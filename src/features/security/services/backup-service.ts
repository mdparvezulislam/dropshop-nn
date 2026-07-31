import { BackupRepository } from "../repositories/backup-repository";
import { BackupJob, BackupStats } from "../domain/backup-entity";

export class BackupService {
  private repository: BackupRepository;

  constructor() {
    this.repository = new BackupRepository();
  }

  async listBackups(): Promise<BackupJob[]> {
    return this.repository.list();
  }

  async createBackup(data: Partial<BackupJob>): Promise<BackupJob> {
    return this.repository.create(data);
  }

  async deleteBackup(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async getStats(): Promise<BackupStats> {
    return this.repository.getStats();
  }
}
