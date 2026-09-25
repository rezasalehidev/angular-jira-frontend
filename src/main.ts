import { Component, inject, OnInit } from "@angular/core";
import { provideRouter } from "@angular/router";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app/app.routes";
import { ProjectStore } from "./app/core/state/project.store";
import { TaskStore } from "./app/core/state/task.store";
import { UserStore } from "./app/core/state/user.store";
import { NotificationStore } from "./app/core/state/notification.store";
import { ActivityStore } from "./app/core/state/activity.store";
import { ThemeService } from "./app/core/state/theme.service";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private projectStore = inject(ProjectStore);
  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private notificationStore = inject(NotificationStore);
  private activityStore = inject(ActivityStore);
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.projectStore.load();
    this.taskStore.load();
    this.userStore.load();
    this.notificationStore.load();
    this.activityStore.load();
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideAnimations()],
});
