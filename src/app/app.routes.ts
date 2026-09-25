import { Routes } from "@angular/router";
import { ShellComponent } from "./layout/shell/shell.component";

export const routes: Routes = [
  {
    path: "",
    component: ShellComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "projects",
        loadComponent: () =>
          import("./features/projects/projects.component").then(
            (m) => m.ProjectsComponent
          ),
      },
      {
        path: "projects/:id",
        loadComponent: () =>
          import("./features/projects/project-detail.component").then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: "tasks",
        loadComponent: () =>
          import("./features/tasks/tasks.component").then(
            (m) => m.TasksComponent
          ),
      },
      {
        path: "kanban",
        loadComponent: () =>
          import("./features/kanban/kanban.component").then(
            (m) => m.KanbanComponent
          ),
      },
      {
        path: "team",
        loadComponent: () =>
          import("./features/team/team.component").then(
            (m) => m.TeamComponent
          ),
      },
      {
        path: "analytics",
        loadComponent: () =>
          import("./features/analytics/analytics.component").then(
            (m) => m.AnalyticsComponent
          ),
      },
      {
        path: "notifications",
        loadComponent: () =>
          import("./features/notifications/notifications.component").then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: "ai-assistant",
        loadComponent: () =>
          import("./features/ai-assistant/ai-assistant.component").then(
            (m) => m.AiAssistantComponent
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./features/settings/settings.component").then(
            (m) => m.SettingsComponent
          ),
      },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
