import { Component, input, output, computed, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Columns3,
  Users,
  BarChart3,
  Bot,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronDown,
  Check,
} from "lucide-angular";
import { WorkspaceStore } from "../../core/state/workspace.store";
import { NotificationStore } from "../../core/state/notification.store";
import { LucideIconData } from "lucide-angular";

interface NavItem {
  label: string;
  icon: LucideIconData;
  route: string;
  badge?: () => number;
}

@Component({
  selector: "app-sidebar",
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside
      class="h-full flex flex-col bg-surface-raised border-r border-border transition-all duration-200 ease-spring"
      [class.w-60]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <!-- Workspace Selector -->
      <div class="p-3 border-b border-border">
        <button
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          [class.justify-center]="collapsed()"
          (click)="toggleWorkspaceMenu()"
        >
          <div class="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
            {{ ws.currentWorkspace()?.logo }}
          </div>
          @if (!collapsed()) {
            <div class="flex-1 text-left min-w-0">
              <div class="text-sm font-semibold text-text-primary truncate">{{ ws.currentWorkspace()?.name }}</div>
              <div class="text-2xs text-text-tertiary">{{ ws.currentWorkspace()?.plan }} plan</div>
            </div>
            <lucide-icon [img]="ChevronDown" class="w-4 h-4 text-text-tertiary shrink-0" ></lucide-icon>
          }
        </button>

        @if (showWorkspaceMenu() && !collapsed()) {
          <div class="mt-1 p-1 bg-surface-raised border border-border rounded-lg shadow-popover animate-scale-in">
            @for (workspace of ws.workspaces(); track workspace.id) {
              <button
                class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-hover transition-colors text-left"
                (click)="selectWorkspace(workspace.id)"
              >
                <div class="w-6 h-6 rounded bg-accent text-white flex items-center justify-center text-2xs font-bold shrink-0">
                  {{ workspace.logo }}
                </div>
                <span class="text-sm text-text-primary flex-1 truncate">{{ workspace.name }}</span>
                @if (workspace.id === ws.currentWorkspaceId()) {
                  <lucide-icon [img]="Check" class="w-3.5 h-3.5 text-accent" ></lucide-icon>
                }
              </button>
            }
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
        @for (item of navItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-accent-soft text-accent font-medium"
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            [class.justify-center]="collapsed()"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="shrink-0 w-4 h-4 inline-flex items-center justify-center [&>*]:w-4 [&>*]:h-4">
              <lucide-icon [img]="item.icon" class="w-4 h-4"></lucide-icon>
            </span>
            @if (!collapsed()) {
              <span class="flex-1">{{ item.label }}</span>
              @if (item.badge && item.badge() > 0) {
                <span class="text-2xs font-medium px-1.5 py-0.5 rounded-full bg-danger text-white">
                  {{ item.badge() }}
                </span>
              }
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle -->
      <div class="p-2 border-t border-border">
        <button
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          [class.justify-center]="collapsed()"
          (click)="toggleCollapsed()"
        >
          <lucide-icon [img]="ChevronsLeft" class="w-4 h-4 shrink-0 transition-transform duration-200" [class.rotate-180]="collapsed()" ></lucide-icon>
          @if (!collapsed()) {
            <span>Collapse</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly ChevronsLeft = ChevronsLeft;
  readonly ChevronDown = ChevronDown;
  readonly Check = Check;

  collapsed = input(false);
  toggle = output<void>();

  ws = inject(WorkspaceStore);
  notificationStore = inject(NotificationStore);

  showWorkspaceMenu = signal(false);

  toggleWorkspaceMenu() {
    this.showWorkspaceMenu.update((v) => !v);
  }

  selectWorkspace(id: string) {
    this.ws.setWorkspace(id);
    this.showWorkspaceMenu.set(false);
  }

  toggleCollapsed() {
    this.toggle.emit();
  }

  navItems = computed<NavItem[]>(() => [
    { label: "Dashboard", icon: LayoutDashboard, route: "/dashboard" },
    { label: "Projects", icon: FolderKanban, route: "/projects" },
    { label: "Tasks", icon: ListTodo, route: "/tasks" },
    { label: "Kanban", icon: Columns3, route: "/kanban" },
    { label: "Team", icon: Users, route: "/team" },
    { label: "Analytics", icon: BarChart3, route: "/analytics" },
    { label: "AI Assistant", icon: Bot, route: "/ai-assistant" },
    {
      label: "Notifications",
      icon: Bell,
      route: "/notifications",
      badge: () => this.notificationStore.unreadCount(),
    },
    { label: "Settings", icon: Settings, route: "/settings" },
  ]);
}
