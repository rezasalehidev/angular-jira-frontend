import { Injectable, signal, computed, inject } from "@angular/core";
import { AppNotification } from "../models";
import { NotificationService } from "../services/notification.service";

@Injectable({ providedIn: "root" })
export class NotificationStore {
  private notificationService = inject(NotificationService);

  private _notifications = signal<AppNotification[]>([]);
  private _loading = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly unreadCount = computed(() =>
    this._notifications().filter((n) => !n.read).length
  );

  load() {
    this._loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this._notifications.set(notifications);
        this._loading.set(false);
      },
    });
  }

  markAsRead(id: string) {
    this._notifications.update((notifications) =>
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this._notifications.update((notifications) =>
      notifications.map((n) => ({ ...n, read: true }))
    );
    this.notificationService.markAllAsRead().subscribe();
  }

  simulateNew() {
    this.notificationService.simulateNewNotification().subscribe((notification) => {
      this._notifications.update((notifications) => [notification, ...notifications]);
    });
  }
}
