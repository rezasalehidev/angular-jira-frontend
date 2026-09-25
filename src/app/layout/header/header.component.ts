import { LucideIconData } from "lucide-angular";
import { Component, input, output, signal, inject, HostListener } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Menu,
  ChevronsLeft,
  MoreVertical,
} from "lucide-angular";
import { ThemeService } from "../../core/state/theme.service";
import { NotificationStore } from "../../core/state/notification.store";
import { ThemeMode } from "../../core/models";

@Component({
  selector: "app-header",
  imports: [LucideAngularModule],
  template: `
    <header class="h-14 border-b border-border bg-surface-raised flex items-center gap-3 px-4 shrink-0">
      <!-- Mobile menu -->
      @if (isMobile()) {
        <button class="btn-ghost p-1.5" (click)="toggleSidebar.emit()" aria-label="Toggle sidebar">
          <lucide-icon [img]="Menu" class="w-5 h-5" ></lucide-icon>
        </button>
      }

      <!-- Desktop collapse -->
      @if (!isMobile()) {
        <button class="btn-ghost p-1.5" (click)="toggleSidebar.emit()" aria-label="Toggle sidebar">
          <lucide-icon [img]="ChevronsLeft" class="w-5 h-5" ></lucide-icon>
        </button>
      }

      <!-- Search trigger -->
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary bg-surface-hover border border-border rounded-lg hover:border-border-strong transition-colors min-w-[200px] flex-1 max-w-md"
        (click)="openSearch.emit()"
      >
        <lucide-icon [img]="Search" class="w-4 h-4" ></lucide-icon>
        <span class="flex-1 text-left">Search...</span>
        <kbd class="text-2xs font-mono px-1.5 py-0.5 rounded border border-border bg-surface text-text-tertiary">⌘K</kbd>
      </button>

      <div class="flex-1"></div>

      <!-- Theme switcher -->
      <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-hover border border-border">
        @for (mode of themeModes; track mode.value) {
          <button
            class="p-1.5 rounded-md transition-colors"
            [class.bg-surface-raised]="theme.theme === mode.value"
            [class.text-accent]="theme.theme === mode.value"
            [class.text-text-tertiary]="theme.theme !== mode.value"
            (click)="theme.setTheme(mode.value)"
            [title]="mode.label"
          >
            <lucide-icon [img]="mode.icon" class="w-4 h-4"></lucide-icon>
          </button>
        }
      </div>

      <!-- Notifications -->
      <button
        class="relative btn-ghost p-1.5"
        (click)="openNotifications.emit()"
        aria-label="Notifications"
      >
        <lucide-icon [img]="Bell" class="w-5 h-5" ></lucide-icon>
        @if (notificationStore.unreadCount() > 0) {
          <span class="absolute top-0.5 right-0.5 w-4 h-4 text-2xs font-bold rounded-full bg-danger text-white flex items-center justify-center">
            {{ notificationStore.unreadCount() }}
          </span>
        }
      </button>

      <!-- User menu -->
      <button class="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-surface-hover transition-colors" (click)="toggleUserMenu()">
        <div class="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">SC</div>
        <span class="text-sm font-medium text-text-primary hidden sm:block">Sarah Chen</span>
      </button>

      @if (showUserMenu()) {
        <div class="absolute top-12 right-4 w-56 bg-surface-raised border border-border rounded-xl shadow-popover animate-scale-in z-50 p-1">
          <div class="px-3 py-2 border-b border-border">
            <div class="text-sm font-medium text-text-primary">Sarah Chen</div>
            <div class="text-xs text-text-tertiary">sarah.chen@taskforge.ai</div>
          </div>
          <button class="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover rounded-md transition-colors" (click)="navigateSettings.emit()">Settings</button>
          <button class="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover rounded-md transition-colors">Profile</button>
          <div class="border-t border-border my-1"></div>
          <button class="w-full text-left px-3 py-1.5 text-sm text-danger hover:bg-danger-soft rounded-md transition-colors">Sign out</button>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Menu = Menu;
  readonly ChevronsLeft = ChevronsLeft;

  isMobile = input(false);
  toggleSidebar = output<void>();
  openSearch = output<void>();
  openNotifications = output<void>();
  navigateSettings = output<void>();

  theme = inject(ThemeService);
  notificationStore = inject(NotificationStore);

  showUserMenu = signal(false);

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest("button") || (!target.closest('[title="Settings"]') && !target.closest('[aria-label="Notifications"]'))) {
      if (!target.closest("button")?.querySelector(".text-danger")) {
        this.showUserMenu.set(false);
      }
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update((v) => !v);
  }

  themeModes: { value: ThemeMode; label: string; icon: LucideIconData }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
}
