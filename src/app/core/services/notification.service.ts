import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { AppNotification } from "../models";
import { mockNotifications } from "../mock/mock-notifications";

@Injectable({ providedIn: "root" })
export class NotificationService {
  private notifications: AppNotification[] = [...mockNotifications];

  getNotifications(): Observable<AppNotification[]> {
    return of([...this.notifications]).pipe(delay(400));
  }

  markAsRead(id: string): Observable<void> {
    const n = this.notifications.find((n) => n.id === id);
    if (n) n.read = true;
    return of(void 0).pipe(delay(150));
  }

  markAllAsRead(): Observable<void> {
    this.notifications.forEach((n) => (n.read = true));
    return of(void 0).pipe(delay(200));
  }

  simulateNewNotification(): Observable<AppNotification> {
    const types: AppNotification["type"][] = [
      "task_assigned",
      "comment",
      "mention",
      "deadline",
      "project_update",
    ];
    const messages = [
      "You have been assigned to a new task",
      "Someone commented on your task",
      "You were mentioned in a comment",
      "A task deadline is approaching",
      "A project status has been updated",
    ];
    const idx = Math.floor(Math.random() * types.length);
    const notification: AppNotification = {
      id: `n${Date.now()}`,
      type: types[idx],
      title: "New notification",
      message: messages[idx],
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications = [notification, ...this.notifications];
    return of(notification).pipe(delay(200));
  }
}
