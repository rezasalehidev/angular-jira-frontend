import { Component, inject, signal, OnInit, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, FormBuilder, ReactiveFormsModule, type FormGroup } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";
import { Sun, Moon, Monitor, Bell, Mail, Calendar, MessageSquare, Building2, Check } from "lucide-angular";
import { ThemeService } from "../../core/state/theme.service";
import { ProjectStore } from "../../core/state/project.store";
import { ThemeMode } from "../../core/models";

type SettingsSection = "appearance" | "notifications" | "workspace";

@Component({
  selector: "app-settings",
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Settings</h1>
        <p class="text-sm text-text-secondary mt-1">Manage your workspace and preferences</p>
      </div>

      <!-- Section tabs -->
      <div class="flex items-center gap-1 border-b border-border">
        @for (section of sections; track section.id) {
          <button
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            [class.border-accent]="activeSection() === section.id"
            [class.text-accent]="activeSection() === section.id"
            [class.border-transparent]="activeSection() !== section.id"
            [class.text-text-secondary]="activeSection() !== section.id"
            (click)="activeSection.set(section.id)"
          >
            <lucide-icon [img]="section.icon" class="w-4 h-4"></lucide-icon>
            {{ section.label }}
          </button>
        }
      </div>

      <!-- Appearance -->
      @if (activeSection() === "appearance") {
        <div class="card p-6 space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-text-primary mb-1">Theme</h3>
            <p class="text-xs text-text-tertiary mb-4">Choose how TaskForge looks to you</p>
            <div class="grid grid-cols-3 gap-3 max-w-md">
              @for (mode of themeModes; track mode.value) {
                <button
                  class="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                  [class.border-accent]="theme.theme === mode.value"
                  [class.border-border]="theme.theme !== mode.value"
                  [class.bg-accent-soft]="theme.theme === mode.value"
                  (click)="setTheme(mode.value)"
                >
                  <lucide-icon [img]="mode.icon" class="w-6 h-6" [class.text-accent]="theme.theme === mode.value" [class.text-text-tertiary]="theme.theme !== mode.value"></lucide-icon>
                  <span class="text-sm font-medium" [class.text-accent]="theme.theme === mode.value" [class.text-text-secondary]="theme.theme !== mode.value">{{ mode.label }}</span>
                  @if (theme.theme === mode.value) {
                    <span class="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                      <lucide-icon [img]="Check" class="w-2.5 h-2.5 text-white"></lucide-icon>
                    </span>
                  }
                </button>
              }
            </div>
          </div>

          <div class="pt-4 border-t border-border">
            <h3 class="text-sm font-semibold text-text-primary mb-1">Density</h3>
            <p class="text-xs text-text-tertiary mb-4">Adjust the spacing of list items</p>
            <div class="flex items-center gap-3">
              <button
                class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
                [class.border-accent]="!settings().compactView"
                [class.text-accent]="!settings().compactView"
                [class.border-border]="settings().compactView"
                [class.text-text-secondary]="settings().compactView"
                (click)="theme.updateSettings({ compactView: false })"
              >
                Comfortable
              </button>
              <button
                class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
                [class.border-accent]="settings().compactView"
                [class.text-accent]="settings().compactView"
                [class.border-border]="!settings().compactView"
                [class.text-text-secondary]="!settings().compactView"
                (click)="theme.updateSettings({ compactView: true })"
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Notifications -->
      @if (activeSection() === "notifications") {
        <div class="card p-6 space-y-1">
          <h3 class="text-sm font-semibold text-text-primary mb-1">Notification Preferences</h3>
          <p class="text-xs text-text-tertiary mb-4">Choose what you want to be notified about</p>

          <form [formGroup]="notifForm" class="space-y-1">
            @for (option of notifOptions; track option.key) {
              <label class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-surface-active flex items-center justify-center">
                    <lucide-icon [img]="option.icon" class="w-4 h-4 text-text-secondary"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-text-primary">{{ option.label }}</div>
                    <div class="text-xs text-text-tertiary">{{ option.description }}</div>
                  </div>
                </div>
                <button
                  type="button"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  [class.bg-accent]="notifForm.get(option.key)?.value"
                  [class.bg-surface-active]="!notifForm.get(option.key)?.value"
                  (click)="toggleNotif(option.key)"
                >
                  <span
                    class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                    [class.translate-x-5]="notifForm.get(option.key)?.value"
                    [class.translate-x-0.5]="!notifForm.get(option.key)?.value"
                  ></span>
                </button>
              </label>
            }
          </form>
        </div>
      }

      <!-- Workspace -->
      @if (activeSection() === "workspace") {
        <div class="card p-6 space-y-5">
          <h3 class="text-sm font-semibold text-text-primary mb-1">Workspace Settings</h3>
          <p class="text-xs text-text-tertiary mb-4">Manage your workspace information</p>

          <form [formGroup]="workspaceForm" class="space-y-4">
            <div>
              <label class="text-xs font-medium text-text-tertiary mb-1 block">Workspace Name</label>
              <input class="input" formControlName="name" placeholder="Workspace name..." />
            </div>

            <div>
              <label class="text-xs font-medium text-text-tertiary mb-1 block">Workspace Logo</label>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center text-lg font-bold">
                  {{ (workspaceForm.get('name')?.value || 'TF').charAt(0).toUpperCase() }}
                </div>
                <button type="button" class="btn-secondary text-sm">Upload Logo</button>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-text-tertiary mb-1 block">Default Project</label>
              <select class="input" formControlName="defaultProject">
                <option value="">None</option>
                @for (project of projectStore.projects(); track project.id) {
                  <option [value]="project.id">{{ project.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-text-tertiary mb-1 block">Language</label>
              <select class="input" formControlName="language">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            <div class="pt-4 border-t border-border flex items-center justify-between">
              <span class="text-xs text-text-tertiary">Changes are saved automatically to your browser</span>
              <div class="flex items-center gap-1.5 text-success">
                <lucide-icon [img]="Check" class="w-4 h-4"></lucide-icon>
                <span class="text-xs font-medium">Saved</span>
              </div>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Monitor = Monitor;
  readonly Check = Check;

  theme = inject(ThemeService);
  projectStore = inject(ProjectStore);

  settings = this.theme.settings;
  private fb = inject(FormBuilder);

  activeSection = signal<SettingsSection>("appearance");
  saved = signal(false);

  sections: { id: SettingsSection; label: string; icon: typeof Sun }[] = [
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "workspace", label: "Workspace", icon: Building2 },
  ];

  themeModes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  notifOptions: { key: string; label: string; description: string; icon: typeof Bell }[] = [
    { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email", icon: Mail },
    { key: "pushNotifications", label: "Push Notifications", description: "Receive push notifications in browser", icon: Bell },
    { key: "deadlineReminders", label: "Deadline Reminders", description: "Get reminded about upcoming deadlines", icon: Calendar },
    { key: "weeklyDigest", label: "Weekly Digest", description: "Receive a weekly summary every Monday", icon: MessageSquare },
  ];

  notifForm: FormGroup = this.fb.group({
    emailNotifications: [true],
    pushNotifications: [true],
    deadlineReminders: [true],
    weeklyDigest: [false],
  });

  workspaceForm: FormGroup = this.fb.group({
    name: ["TaskForge AI"],
    defaultProject: [""],
    language: ["en"],
  });

  ngOnInit() {
    const settings = this.theme.settings();
    this.notifForm.patchValue({
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      deadlineReminders: settings.deadlineReminders,
      weeklyDigest: settings.weeklyDigest,
    });
    this.workspaceForm.patchValue({
      language: settings.language,
    });

    this.notifForm.valueChanges.subscribe((val) => {
      this.theme.updateSettings(val);
      this.flashSaved();
    });

    this.workspaceForm.valueChanges.subscribe((val) => {
      this.theme.updateSettings({ language: val.language });
      this.flashSaved();
    });
  }

  toggleNotif(key: string) {
    const control = this.notifForm.get(key);
    if (control) {
      control.setValue(!control.value);
    }
  }

  setTheme(mode: ThemeMode) {
    this.theme.setTheme(mode);
  }

  private flashSaved() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
