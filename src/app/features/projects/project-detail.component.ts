import { Component, inject, computed, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, ArrowLeft, Calendar, Users, ListTodo, Activity as ActivityIcon, Settings as SettingsIcon, CheckCircle2, Circle, Clock } from "lucide-angular";
import { ProjectStore } from "../../core/state/project.store";
import { TaskStore } from "../../core/state/task.store";
import { UserStore } from "../../core/state/user.store";
import { ActivityStore } from "../../core/state/activity.store";
import { Project, ProjectStatus } from "../../core/models";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { StatusBadgeComponent } from "../../shared/components/ui/status-badge.component";
import { ProgressBarComponent } from "../../shared/components/ui/progress-bar.component";
import { SkeletonComponent } from "../../shared/components/ui/skeleton.component";
import { formatDate, formatRelativeTime } from "../../shared/utils/format";

type Tab = "overview" | "tasks" | "activity" | "settings";

@Component({
  selector: "app-project-detail",
  imports: [
    FormsModule,
    LucideAngularModule,
    AvatarComponent,
    StatusBadgeComponent,
    ProgressBarComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto animate-fade-in">
      <!-- Back -->
      <button class="btn-ghost mb-4" (click)="router.navigate(['/projects'])">
        <lucide-icon [img]="ArrowLeft" class="w-4 h-4" />
        Back to Projects
      </button>

      @if (project(); as p) {
        <!-- Header -->
        <div class="card p-6 mb-4">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 class="text-2xl font-bold text-text-primary">{{ p.name }}</h1>
              <p class="text-sm text-text-secondary mt-1 max-w-2xl">{{ p.description }}</p>
            </div>
            <app-status-badge kind="project-status" [value]="p.status" />
          </div>
          <div class="flex items-center gap-4 mt-4 flex-wrap">
            <div class="flex items-center gap-1.5 text-sm text-text-secondary">
              <lucide-icon [img]="Calendar" class="w-4 h-4 text-text-tertiary" />
              {{ formatDate(p.deadline) }}
            </div>
            <div class="flex items-center gap-1.5 text-sm text-text-secondary">
              <lucide-icon [img]="Users" class="w-4 h-4 text-text-tertiary" />
              {{ p.memberIds.length }} members
            </div>
            <div class="flex items-center gap-1.5 text-sm text-text-secondary">
              <lucide-icon [img]="ListTodo" class="w-4 h-4 text-text-tertiary" />
              {{ taskCount() }} tasks
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 border-b border-border mb-4">
          @for (t of tabs; track t.key) {
            <button
              class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
              [class.border-accent]="activeTab() === t.key"
              [class.text-accent]="activeTab() === t.key"
              [class.border-transparent]="activeTab() !== t.key"
              [class.text-text-secondary]="activeTab() !== t.key"
              (click)="activeTab.set(t.key)"
            >
              {{ t.label }}
            </button>
          }
        </div>

        <!-- Overview -->
        @if (activeTab() === 'overview') {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card p-5">
              <span class="text-xs text-text-tertiary font-medium">Progress</span>
              <div class="text-2xl font-bold text-text-primary mt-1">{{ progress() }}%</div>
              <app-progress-bar [value]="progress()" />
              <div class="flex justify-between mt-2 text-xs text-text-tertiary">
                <span>{{ completedCount() }} done</span>
                <span>{{ taskCount() - completedCount() }} remaining</span>
              </div>
            </div>
            <div class="card p-5">
              <span class="text-xs text-text-tertiary font-medium">Deadline</span>
              <div class="text-lg font-semibold text-text-primary mt-1">{{ formatDate(p.deadline) }}</div>
              <div class="flex items-center gap-1.5 mt-2 text-xs text-text-tertiary">
                <lucide-icon [img]="Clock" class="w-3.5 h-3.5" />
                {{ daysLeft(p.deadline) }}
              </div>
            </div>
            <div class="card p-5">
              <span class="text-xs text-text-tertiary font-medium">Members</span>
              <div class="flex flex-wrap gap-2 mt-2">
                @for (m of projectMembers(); track m.id) {
                  <app-avatar [name]="m.name" [seed]="m.id" size="sm" />
                }
              </div>
            </div>
          </div>

          <!-- Recent activity -->
          <div class="card p-5 mt-4">
            <h3 class="text-sm font-semibold text-text-primary mb-4">Recent Activity</h3>
            <div class="space-y-3">
              @for (a of projectActivity(); track a.id) {
                <div class="flex gap-3 items-start">
                  <app-avatar [name]="actorName(a.actorId)" [seed]="a.actorId" size="xs" />
                  <div class="flex-1">
                    <p class="text-sm text-text-primary">
                      <span class="font-medium">{{ actorName(a.actorId) }}</span>
                      <span class="text-text-secondary"> {{ a.description }}</span>
                    </p>
                    <span class="text-2xs text-text-tertiary">{{ formatRelativeTime(a.createdAt) }}</span>
                  </div>
                </div>
              }
              @if (projectActivity().length === 0) {
                <p class="text-sm text-text-tertiary">No recent activity.</p>
              }
            </div>
          </div>
        }

        <!-- Tasks -->
        @if (activeTab() === 'tasks') {
          <div class="card divide-y divide-border">
            @for (t of projectTasks(); track t.id) {
              <div class="flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors">
                @if (t.status === 'done') {
                  <lucide-icon [img]="CheckCircle2" class="w-5 h-5 text-success shrink-0" />
                } @else {
                  <lucide-icon [img]="Circle" class="w-5 h-5 text-text-tertiary shrink-0" />
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-text-primary" [class.line-through]="t.status === 'done'" [class.text-text-tertiary]="t.status === 'done'">{{ t.title }}</p>
                  <p class="text-xs text-text-tertiary">{{ formatDate(t.dueDate) }}</p>
                </div>
                <app-status-badge kind="priority" [value]="t.priority" />
                <app-status-badge kind="task-status" [value]="t.status" />
              </div>
            }
            @if (projectTasks().length === 0) {
              <div class="p-8 text-center text-sm text-text-tertiary">No tasks in this project yet.</div>
            }
          </div>
        }

        <!-- Activity -->
        @if (activeTab() === 'activity') {
          <div class="card p-5">
            <div class="space-y-4">
              @for (a of projectActivity(); track a.id) {
                <div class="flex gap-3 items-start">
                  <div class="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                    <lucide-icon [img]="ActivityIcon" class="w-4 h-4 text-text-secondary" />
                  </div>
                  <div class="flex-1">
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
        }

        <!-- Settings -->
        @if (activeTab() === 'settings') {
          <div class="card p-6 space-y-4 max-w-2xl">
            <div>
              <label class="text-xs font-medium text-text-tertiary block mb-1.5">Project Name</label>
              <input type="text" class="input" [ngModel]="p.name" (ngModelChange)="updateField('name', $event)" />
            </div>
            <div>
              <label class="text-xs font-medium text-text-tertiary block mb-1.5">Description</label>
              <textarea class="input min-h-[80px] resize-y" [ngModel]="p.description" (ngModelChange)="updateField('description', $event)"></textarea>
            </div>
            <div>
              <label class="text-xs font-medium text-text-tertiary block mb-1.5">Status</label>
              <select class="input" [ngModel]="p.status" (ngModelChange)="updateField('status', $event)">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ statusLabel(s) }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-text-tertiary block mb-1.5">Deadline</label>
              <input type="date" class="input" [ngModel]="dueDateValue()" (ngModelChange)="updateDeadline($event)" />
            </div>
            <div>
              <label class="text-xs font-medium text-text-tertiary block mb-1.5">Members</label>
              <div class="flex flex-wrap gap-2">
                @for (u of userStore.users(); track u.id) {
                  <button
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm"
                    [class.bg-accent-soft]="p.memberIds.includes(u.id)"
                    [class.border-accent]="p.memberIds.includes(u.id)"
                    [class.text-accent]="p.memberIds.includes(u.id)"
                    [class.bg-surface-hover]="!p.memberIds.includes(u.id)"
                    [class.border-border]="!p.memberIds.includes(u.id)"
                    [class.text-text-secondary]="!p.memberIds.includes(u.id)"
                    (click)="toggleMember(u.id)"
                  >
                    <app-avatar [name]="u.name" [seed]="u.id" size="xs" />
                    {{ u.name }}
                  </button>
                }
              </div>
            </div>
          </div>
        }
      } @else if (projectStore.loading()) {
        <div class="space-y-4">
          <app-skeleton width="100%" height="6rem" rounded="lg" />
          <app-skeleton width="100%" height="3rem" />
          <app-skeleton width="100%" height="10rem" rounded="lg" />
        </div>
      } @else {
        <div class="card p-8 text-center">
          <p class="text-sm text-text-tertiary">Project not found.</p>
        </div>
      }
    </div>
  `,
})
export class ProjectDetailComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly ListTodo = ListTodo;
  readonly ActivityIcon = ActivityIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly CheckCircle2 = CheckCircle2;
  readonly Circle = Circle;
  readonly Clock = Clock;

  private route = inject(ActivatedRoute);
  router = inject(Router);
  projectStore = inject(ProjectStore);
  private taskStore = inject(TaskStore);
  userStore = inject(UserStore);
  private activityStore = inject(ActivityStore);

  activeTab = signal<Tab>("overview");
  statuses: ProjectStatus[] = ["planning", "active", "on_hold", "completed"];
  tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "activity", label: "Activity" },
    { key: "settings", label: "Settings" },
  ];

  readonly formatDate = formatDate;
  readonly formatRelativeTime = formatRelativeTime;

  projectId = computed(() => this.route.snapshot.paramMap.get("id") ?? "");

  project = computed<Project | undefined>(() =>
    this.projectStore.projects().find((p) => p.id === this.projectId()),
  );

  projectTasks = computed(() =>
    this.taskStore.tasks().filter((t) => t.projectId === this.projectId()),
  );

  projectActivity = computed(() =>
    this.activityStore.activities().filter((a) => a.projectId === this.projectId()),
  );

  projectMembers = computed(() => {
    const p = this.project();
    if (!p) return [];
    return p.memberIds
      .map((id) => this.userStore.users().find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => u !== undefined);
  });

  taskCount = computed(() => this.projectTasks().length);
  completedCount = computed(() => this.projectTasks().filter((t) => t.status === "done").length);
  progress = computed(() => {
    const total = this.taskCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  dueDateValue = computed(() => {
    const p = this.project();
    return p?.deadline ? p.deadline.split("T")[0] : "";
  });

  updateField(field: keyof Project, value: string) {
    const p = this.project();
    if (!p) return;
    this.projectStore.updateProject(p.id, { [field]: value } as Partial<Project>);
  }

  updateDeadline(value: string) {
    const p = this.project();
    if (!p) return;
    this.projectStore.updateProject(p.id, { deadline: value ? new Date(value).toISOString() : null });
  }

  toggleMember(userId: string) {
    const p = this.project();
    if (!p) return;
    const members = p.memberIds.includes(userId)
      ? p.memberIds.filter((id) => id !== userId)
      : [...p.memberIds, userId];
    this.projectStore.updateProject(p.id, { memberIds: members });
  }

  actorName(id: string): string {
    return this.userStore.users().find((u) => u.id === id)?.name ?? "Unknown";
  }

  statusLabel(s: ProjectStatus): string {
    return { planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed" }[s];
  }

  daysLeft(deadline: string | null): string {
    if (!deadline) return "No deadline";
    const now = new Date("2026-09-24T10:00:00Z").getTime();
    const due = new Date(deadline).getTime();
    const days = Math.ceil((due - now) / 86400000);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    return `${days} days remaining`;
  }
}
