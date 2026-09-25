import { Injectable, signal, effect } from "@angular/core";
import { ThemeMode, UserSettings } from "../models";

const STORAGE_KEY = "taskforge-settings";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private _settings = signal<UserSettings>(this.loadSettings());
  readonly settings = this._settings.asReadonly();

  constructor() {
    effect(() => {
      const settings = this._settings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.applyTheme(settings.theme);
    });
  }

  get theme() {
    return this._settings().theme;
  }

  setTheme(theme: ThemeMode) {
    this._settings.update((s) => ({ ...s, theme }));
  }

  updateSettings(partial: Partial<UserSettings>) {
    this._settings.update((s) => ({ ...s, ...partial }));
  }

  private applyTheme(theme: ThemeMode) {
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }

  private loadSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserSettings;
      }
    } catch {
      // ignore
    }
    return {
      theme: "light",
      emailNotifications: true,
      pushNotifications: true,
      deadlineReminders: true,
      weeklyDigest: false,
      compactView: false,
      language: "en",
    };
  }
}
