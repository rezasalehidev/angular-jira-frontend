import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { ProjectStore } from "./core/state/project.store";
import { TaskStore } from "./core/state/task.store";
import { UserStore } from "./core/state/user.store";
import { NotificationStore } from "./core/state/notification.store";
import { ActivityStore } from "./core/state/activity.store";

export function initializeStores() {
  return () => {
    const projectStore = new ProjectStore();
    const taskStore = new TaskStore();
    const userStore = new UserStore();
    const notificationStore = new NotificationStore();
    const activityStore = new ActivityStore();

    projectStore.load();
    taskStore.load();
    userStore.load();
    notificationStore.load();
    activityStore.load();
  };
}
