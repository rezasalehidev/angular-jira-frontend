import { Component, computed, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import {
  Bell,
  CheckCheck,
  UserPlus,
  MessageSquare,
  AtSign,
  Calendar,
  FolderKanban,
  Trash2,
} from "lucide-angular";
import { NotificationStore } from "../../core/state/notification.store";
import { AppNotification, NotificationType } from "../../core/models";
import { formatRelativeTime } from "../../shared/utils/format";

type FilterType = "all" | "unread" | NotificationType;

@Component({
  selector: "app-notifications",
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-5">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Notifications</h1>
          <p class="text-sm text-text-secondary mt-1">
            {{ unreadCount() }} unread of {{ allNotifications().length }} total
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="btn-secondary text-sm"
            (click)="simulateNew()"
            [disabled]="simulating()"
          >
            @if (simulating()) {
              <div class="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              Simulating...
            } @else {
              <lucide-icon [img]="Bell" class="w-3.5 h-3.5"></lucide-icon>
              Simulate New
            }
          </button>
          <button
            class="btn-primary text-sm"
            (click)="markAllRead()"
            [disabled]="unreadCount() === 0"
          >
            <lucide-icon [img]="CheckCheck" class="w-3.5 h-3.5"></lucide-icon>
            Mark All Read
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-1 border-b border-border">
        @for (filter of filters; track filter.value) {
          <button
            class="px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            [class.border-accent]="activeFilter() === filter.value"
            [class.text-accent]="activeFilter() === filter.value"
            [class.border-transparent]="activeFilter() !== filter.value"
            [class.text-text-secondary]="activeFilter() !== filter.value"
            (click)="activeFilter.set(filter.value)"
          >
            {{ filter.label }}
            @if (filter.value === "unread" && unreadCount() > 0) {
              <span class="ml-1 text-2xs px-1.5 py-0.5 rounded-full bg-danger text-white">{{ unreadCount() }}</span>
            }
          </button>
        }
      </div>

      @if (notificationStore.loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card p-4 animate-pulse">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-surface-active"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-surface-active rounded w-3/4"></div>
                  <div class="h-3 bg-surface-active rounded w-1/2"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (filteredNotifications().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-12 h-12 rounded-xl bg-surface-active flex items-center justify-center mb-4">
            <lucide-icon [img]="Bell" class="w-5 h-5 text-text-tertiary"></lucide-icon>
          </div>
          <h3 class="text-base font-semibold text-text-primary mb-1">All caught up!</h3>
          <p class="text-sm text-text-secondary max-w-sm">You have no unread notifications.</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (notification of filteredNotifications(); track notification.id) {
            <div
              class="card p-4 flex items-start gap-3 transition-all cursor-pointer hover:border-border-strong"
              [class.border-l-4]="!notification.read"
              [class.border-l-accent]="!notification.read"
              [class.opacity-60]="notification.read"
              (click)="markRead(notification.id)"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                [style.background-color]="iconConfig(notification.type).color + '20'"
              >
                <lucide-icon
                  [img]="iconConfig(notification.type).icon"
                  class="w-5 h-5"
                  [style.color]="iconConfig(notification.type).color"
                ></lucide-icon>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-text-primary">{{ notification.title }}</span>
                  @if (!notification.read) {
                    <span class="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                  }
                </div>
                <p class="text-sm text-text-secondary mt-0.5">{{ notification.message }}</p>
                <span class="text-2xs text-text-tertiary mt-1 block">{{ formatRelativeTime(notification.createdAt) }}</span>
              </div>

              <button
                class="btn-ghost p-1.5 opacity-0 hover:opacity-100 transition-opacity"
                (click)="$event.stopPropagation()"
                title="Delete"
              >
                <lucide-icon [img]="Trash2" class="w-3.5 h-3.5 text-text-tertiary"></lucide-icon>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  readonly Bell = Bell;
  readonly CheckCheck = CheckCheck;
  readonly Trash2 = Trash2;

  notificationStore = inject(NotificationStore);

  activeFilter = signal<FilterType>("all");
  simulating = signal(false);

  formatRelativeTime = formatRelativeTime;

  filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "task_assigned", label: "Assigned" },
    { value: "comment", label: "Comments" },
    { value: "mention", label: "Mentions" },
    { value: "deadline", label: "Deadlines" },
    { value: "project_update", label: "Projects" },
  ];

  ngOnInit() {
    this.notificationStore.load();
  }

  allNotifications = computed(() =>
    [...this.notificationStore.notifications()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  unreadCount = computed(() => this.allNotifications().filter((n) => !n.read).length);

  filteredNotifications = computed<AppNotification[]>(() => {
    const filter = this.activeFilter();
    const notifications = this.allNotifications();
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  });

  iconConfig(type: NotificationType): { icon: typeof Bell; color: string } {
    const map: Record<NotificationType, { icon: typeof Bell; color: string }> = {
      task_assigned: { icon: UserPlus, color: "#6366f1" },
      comment: { icon: MessageSquare, color: "#3b82f6" },
      mention: { icon: AtSign, color: "#f59e0b" },
      deadline: { icon: Calendar, color: "#ef4444" },
      project_update: { icon: FolderKanban, color: "#10b981" },
    };
    return map[type];
  }

  markRead(id: string) {
    this.notificationStore.markAsRead(id);
  }

  markAllRead() {
    this.notificationStore.markAllAsRead();
  }

  simulateNew() {
    this.simulating.set(true);
    this.notificationStore.simulateNew();
    setTimeout(() => this.simulating.set(false), 600);
  }
}
