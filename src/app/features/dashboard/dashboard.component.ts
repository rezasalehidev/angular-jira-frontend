import { Component, inject, computed } from "@angular/core";
import { Router } from "@angular/router";
import { LucideAngularModule, FolderKanban, ListTodo, CheckCircle2, AlertTriangle, Users, Clock, ArrowRight, TrendingUp } from "lucide-angular";
import { ProjectStore } from "../../core/state/project.store";
import { TaskStore } from "../../core/state/task.store";
import { UserStore } from "../../core/state/user.store";
import { ActivityStore } from "../../core/state/activity.store";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { StatusBadgeComponent } from "../../shared/components/ui/status-badge.component";
import { ProgressBarComponent } from "../../shared/components/ui/progress-bar.component";
import { LineChartComponent } from "../../shared/components/ui/line-chart.component";
import { DonutChartComponent } from "../../shared/components/ui/donut-chart.component";
import { BarChartComponent } from "../../shared/components/ui/bar-chart.component";
import { SkeletonComponent } from "../../shared/components/ui/skeleton.component";
import { formatDate, formatRelativeTime } from "../../shared/utils/format";

@Component({
  selector: "app-dashboard",
  imports: [
    LucideAngularModule,
    AvatarComponent,
    StatusBadgeComponent,
    ProgressBarComponent,
    LineChartComponent,
    DonutChartComponent,
    BarChartComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p class="text-sm text-text-secondary mt-0.5">Welcome back, Sarah. Here's what's happening today.</p>
      </div>

      <!-- Stat cards -->
      @if (projectStore.loading() || taskStore.loading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card p-4">
              <app-skeleton width="60%" height="0.75rem" />
              <app-skeleton width="40%" height="2rem" class="mt-2" />
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="card p-4">
            <div class="flex items-center gap-2 text-text-tertiary mb-1">
              <lucide-icon [img]="FolderKanban" class="w-4 h-4" />
              <span class="text-xs font-medium">Total Projects</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ projectStore.projects().length }}</div>
          </div>
          <div class="card p-4">
            <div class="flex items-center gap-2 text-success mb-1">
              <lucide-icon [img]="TrendingUp" class="w-4 h-4" />
              <span class="text-xs font-medium">Active</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ projectStore.activeProjects().length }}</div>
          </div>
          <div class="card p-4">
            <div class="flex items-center gap-2 text-text-tertiary mb-1">
              <lucide-icon [img]="ListTodo" class="w-4 h-4" />
              <span class="text-xs font-medium">Total Tasks</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ taskStore.tasks().length }}</div>
          </div>
          <div class="card p-4">
            <div class="flex items-center gap-2 text-success mb-1">
              <lucide-icon [img]="CheckCircle2" class="w-4 h-4" />
              <span class="text-xs font-medium">Completed</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ taskStore.completedTasks().length }}</div>
          </div>
          <div class="card p-4">
            <div class="flex items-center gap-2 text-danger mb-1">
              <lucide-icon [img]="AlertTriangle" class="w-4 h-4" />
              <span class="text-xs font-medium">Overdue</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ taskStore.overdueTasks().length }}</div>
          </div>
          <div class="card p-4">
            <div class="flex items-center gap-2 text-text-tertiary mb-1">
              <lucide-icon [img]="Users" class="w-4 h-4" />
              <span class="text-xs font-medium">Team</span>
            </div>
            <div class="text-2xl font-bold text-text-primary">{{ userStore.users().length }}</div>
          </div>
        </div>
      }

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Task completion line chart -->
        <div class="card p-5 lg:col-span-2">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Task Completion (Last 7 Days)</h3>
          <app-line-chart [points]="completionData()" height="220px" />
        </div>

        <!-- Tasks by status donut -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Tasks by Status</h3>
          <app-donut-chart [segments]="statusSegments()" centerLabel="Tasks" />
        </div>
      </div>

      <!-- Second row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Priority bar chart -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Tasks by Priority</h3>
          <app-bar-chart [data]="priorityData()" height="180px" />
        </div>

        <!-- Recent activity -->
        <div class="card p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-text-primary">Recent Activity</h3>
            <button class="btn-ghost text-xs" (click)="router.navigate(['/dashboard'])">View all</button>
          </div>
          <div class="space-y-3">
            @for (a of recentActivity(); track a.id) {
              <div class="flex gap-3 items-start">
                <app-avatar [name]="actorName(a.actorId)" [seed]="a.actorId" size="xs" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-text-primary">
                    <span class="font-medium">{{ actorName(a.actorId) }}</span>
                    <span class="text-text-secondary"> {{ a.description }}</span>
                  </p>
                  <span class="text-2xs text-text-tertiary">{{ formatRelativeTime(a.createdAt) }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Upcoming deadlines -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <lucide-icon [img]="Clock" class="w-4 h-4 text-warning" />
            Upcoming Deadlines
          </h3>
          <div class="space-y-2">
            @for (t of upcomingDeadlines(); track t.id) {
              <div class="flex items-center justify-between gap-3 py-1.5">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-text-primary truncate">{{ t.title }}</p>
                  <p class="text-xs text-text-tertiary">{{ projectName(t.projectId) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <app-status-badge kind="priority" [value]="t.priority" />
                  <p class="text-xs text-text-tertiary mt-0.5">{{ formatDate(t.dueDate) }}</p>
                </div>
              </div>
            }
            @if (upcomingDeadlines().length === 0) {
              <p class="text-sm text-text-tertiary">No upcoming deadlines.</p>
            }
          </div>
        </div>

        <!-- Recent projects -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-text-primary">Recent Projects</h3>
            <button class="btn-ghost text-xs" (click)="router.navigate(['/projects'])">
              View all
              <lucide-icon [img]="ArrowRight" class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="space-y-3">
            @for (p of recentProjects(); track p.id) {
              <button class="w-full text-left" (click)="router.navigate(['/projects', p.id])">
                <div class="flex items-center justify-between gap-3 mb-1.5">
                  <span class="text-sm font-medium text-text-primary truncate">{{ p.name }}</span>
                  <app-status-badge kind="project-status" [value]="p.status" />
                </div>
                <app-progress-bar [value]="projectProgress(p.id)" />
                <div class="flex justify-between mt-1.5">
                  <span class="text-xs text-text-tertiary">{{ taskCount(p.id) }} tasks</span>
                  <span class="text-xs text-text-tertiary">{{ formatDate(p.deadline) }}</span>
                </div>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  readonly FolderKanban = FolderKanban;
  readonly ListTodo = ListTodo;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertTriangle = AlertTriangle;
  readonly Users = Users;
  readonly Clock = Clock;
  readonly ArrowRight = ArrowRight;
  readonly TrendingUp = TrendingUp;

  projectStore = inject(ProjectStore);
  taskStore = inject(TaskStore);
  userStore = inject(UserStore);
  activityStore = inject(ActivityStore);
  router = inject(Router);

  readonly formatDate = formatDate;
  readonly formatRelativeTime = formatRelativeTime;

  completionData = computed(() => [
    { label: "Mon", value: 4 },
    { label: "Tue", value: 7 },
    { label: "Wed", value: 5 },
    { label: "Thu", value: 9 },
    { label: "Fri", value: 6 },
    { label: "Sat", value: 3 },
    { label: "Sun", value: 8 },
  ]);

  statusSegments = computed(() => {
    const byStatus = this.taskStore.tasksByStatus();
    return [
      { label: "Todo", value: byStatus.todo.length, color: "#9ca3af" },
      { label: "In Progress", value: byStatus.in_progress.length, color: "#6366f1" },
      { label: "Review", value: byStatus.review.length, color: "#f59e0b" },
      { label: "Done", value: byStatus.done.length, color: "#10b981" },
    ];
  });

  priorityData = computed(() => {
    const byP = this.taskStore.tasksByPriority();
    return [
      { label: "Low", value: byP.low.length, color: "#9ca3af" },
      { label: "Medium", value: byP.medium.length, color: "#6366f1" },
      { label: "High", value: byP.high.length, color: "#f59e0b" },
      { label: "Urgent", value: byP.urgent.length, color: "#ef4444" },
    ];
  });

  recentActivity = computed(() => this.activityStore.activities().slice(0, 5));

  upcomingDeadlines = computed(() =>
    this.taskStore
      .tasks()
      .filter((t) => t.dueDate && t.status !== "done")
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
      .slice(0, 5),
  );

  recentProjects = computed(() => [...this.projectStore.projects()].slice(0, 4));

  projectProgress(projectId: string): number {
    const tasks = this.taskStore.tasks().filter((t) => t.projectId === projectId);
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100);
  }

  taskCount(projectId: string): number {
    return this.taskStore.tasks().filter((t) => t.projectId === projectId).length;
  }

  actorName(id: string): string {
    return this.userStore.users().find((u) => u.id === id)?.name ?? "Unknown";
  }

  projectName(id: string): string {
    return this.projectStore.projects().find((p) => p.id === id)?.name ?? "Unknown";
  }
}
