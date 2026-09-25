import { Component, signal, inject, HostListener } from "@angular/core";
import { RouterOutlet, Router } from "@angular/router";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { CommandPaletteComponent } from "../../shared/components/command-palette/command-palette.component";

@Component({
  selector: "app-shell",
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommandPaletteComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface">
      <!-- Desktop sidebar -->
      @if (!isMobile()) {
        <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="toggleSidebar()" />
      }

      <!-- Mobile sidebar drawer -->
      @if (isMobile() && mobileSidebarOpen()) {
        <div class="fixed inset-0 z-50 flex">
          <div class="absolute inset-0 bg-black/40 animate-fade-in" (click)="closeMobileSidebar()"></div>
          <div class="relative z-10 animate-slide-in-right">
            <app-sidebar [collapsed]="false" (toggle)="closeMobileSidebar()" />
          </div>
        </div>
      }

      <!-- Main area -->
      <div class="flex-1 flex flex-col min-w-0">
        <app-header
          [isMobile]="isMobile()"
          (toggleSidebar)="toggleSidebar()"
          (openSearch)="openCommandPalette()"
          (openNotifications)="navigateToNotifications()"
          (navigateSettings)="navigateToSettings()"
        />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-command-palette [open]="commandPaletteOpen()" (close)="closeCommandPalette()" />
  `,
})
export class ShellComponent {
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  commandPaletteOpen = signal(false);
  isMobile = signal(false);

  constructor() {
    this.checkViewport();
  }

  @HostListener("window:resize")
  checkViewport() {
    this.isMobile.set(window.innerWidth < 768);
  }

  @HostListener("document:keydown", ["$event"])
  handleKeyboard(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      this.openCommandPalette();
    }
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.mobileSidebarOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }

  openCommandPalette() {
    this.commandPaletteOpen.set(true);
  }

  closeCommandPalette() {
    this.commandPaletteOpen.set(false);
  }

  navigateToNotifications() {
    this.router.navigate(["/notifications"]);
  }

  navigateToSettings() {
    this.router.navigate(["/settings"]);
  }
}
