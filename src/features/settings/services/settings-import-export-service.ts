import { SettingsService } from "./settings-service";
import { FeatureFlagService } from "./feature-flag-service";
import { SettingRepository } from "../repositories/setting-repository";

export class SettingsImportExportService {
  private readonly settingsService: SettingsService;
  private readonly flagService: FeatureFlagService;
  private readonly repository: SettingRepository;

  constructor() {
    this.settingsService = new SettingsService();
    this.flagService = new FeatureFlagService();
    this.repository = new SettingRepository();
  }

  async exportConfiguration(): Promise<{
    version: string;
    exportedAt: string;
    settings: any[];
    flags: any[];
  }> {
    const settings = await this.settingsService.listSettings();
    const flags = await this.flagService.listFlags();

    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      settings: settings.map((s) => ({ key: s.key, value: s.value, category: s.category })),
      flags: flags.map((f) => ({ key: f.key, state: f.state })),
    };
  }

  async importConfiguration(payload: any, changedBy: string = "system"): Promise<{ importedSettings: number; importedFlags: number }> {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid configuration import payload format");
    }

    let importedSettings = 0;
    let importedFlags = 0;

    if (Array.isArray(payload.settings)) {
      for (const item of payload.settings) {
        if (item.key && item.value !== undefined) {
          await this.settingsService.setSetting(item.key, item.value, changedBy, "Imported from configuration backup");
          importedSettings++;
        }
      }
    }

    if (Array.isArray(payload.flags)) {
      for (const item of payload.flags) {
        if (item.key && item.state) {
          await this.flagService.updateFlagState(item.key, item.state, undefined, changedBy);
          importedFlags++;
        }
      }
    }

    return { importedSettings, importedFlags };
  }
}

export default SettingsImportExportService;
