import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, Search, Plus, ListTodo, X, Trash2 } from "lucide-angular";
import { TaskStore } from "../../core/state/task.store";
import { ProjectStore } from "../../core/state/project.store";
import { UserStore } from "../../core/state/user.store";
import { Task, TaskStatus, TaskPriority, CreateTaskDto } from "../../core/models";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { StatusBadgeComponent } from "../../shared/components/ui/status-badge.component";
import { EmptyStateComponent } from "../../shared/components/ui/empty-state.component";
import { SkeletonComponent } from "../../shared/components/ui/skeleton.component";
import { TaskDrawerComponent } from "../../shared/components/task-drawer/task-drawer.component";
import { formatDate } from "../../shared/utils/format";

@Component({
  selector: "app-tasks",
  imports: [
    FormsModule,
    LucideAngularModule,
    AvatarComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SkeletonComponent,
    TaskDrawerComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Tasks</h1>
          <p class="text-sm text-text-secondary mt-0.5">{{ filteredTasks().length }} tasks</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <lucide-icon [img]="Plus" class="w-4 h-4" />
          New Task
        </button>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-hover border border-border rounded-lg flex-1 max-w-xs">
          <lucide-icon [img]="Search" class="w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Search tasks..."
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
        </div>
        <select class="input w-auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
          <option value="all">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select class="input w-auto" [ngModel]="priorityFilter()" (ngModelChange)="priorityFilter.set($event)">
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select class="input w-auto" [ngModel]="projectFilter()" (ngModelChange)="projectFilter.set($event)">
          <option value="all">All projects</option>
          @for (p of projectStore.projects(); track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>
      </div>

      <!-- Task list -->
      @if (taskStore.loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="card p-4 flex items-center gap-3">
              <app-skeleton width="1.25rem" height="1.25rem" rounded="full" />
              <app-skeleton width="40%" height="0.875rem" />
              <app-skeleton width="3rem" height="1rem" rounded="md" class="ml-auto" />
            </div>
          }
        </div>
      } @else if (filteredTasks().length === 0) {
        <app-empty-state
          [icon]="ListTodo"
          title="No tasks found"
          description="Try changing your filters or create a new task."
          actionLabel="Create Task"
          (action)="openCreateModal()"
        />
      } @else {
        <div class="card divide-y divide-border">
          @for (t of filteredTasks(); track t.id) {
            <button
              class="w-full flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors text-left"
              (click)="openDrawer(t)"
            >
              <div class="w-5 h-5 rounded-full border-2 border-border shrink-0" [class.bg-success]="t.status === 'done'" [class.border-success]="t.status === 'done'"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">{{ t.title }}</p>
                <p class="text-xs text-text-tertiary">{{ projectName(t.projectId) }}</p>
              </div>
              <div class="hidden sm:flex items-center gap-2">
                @if (assignee(t.assigneeId)) {
                  <app-avatar [name]="assignee(t.assigneeId)!.name" [seed]="t.assigneeId!" size="xs" />
                } @else {
                  <div class="w-5 h-5 rounded-full bg-surface-active flex items-center justify-center text-2xs text-text-tertiary">—</div>
                }
              </div>
              <app-status-badge kind="priority" [value]="t.priority" />
              <app-status-badge kind="task-status" [value]="t.status" />
              <span class="text-xs text-text-tertiary whitespace-nowrap hidden md:block">{{ formatDate(t.dueDate) }}</span>
            </button>
          }
        </div>
      }

      <!-- Task drawer -->
      <app-task-drawer [task]="selectedTask()" (close)="closeDrawer()" />

      <!-- Create/Edit modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 animate-fade-in" (click)="closeModal()"></div>
          <div class="relative w-full max-w-lg bg-surface-raised border border-border rounded-2xl shadow-popover animate-scale-in p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-text-primary">New Task</h2>
              <button class="btn-ghost p-1.5" (click)="closeModal()">
                <lucide-icon [img]="X" class="w-4 h-4" />
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-medium text-text-tertiary block mb-1.5">Title *</label>
                <input type="text" class="input" placeholder="Task title..." [ngModel]="formTitle()" (ngModelChange)="formTitle.set($event)" />
              </div>
              <div>
                <label class="text-xs font-medium text-text-tertiary block mb-1.5">Description</label>
                <textarea class="input min-h-[60px] resize-y" placeholder="Describe the task..." [ngModel]="formDesc()" (ngModelChange)="formDesc.set($event)"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-medium text-text-tertiary block mb-1.5">Status</label>
                  <select class="input" [ngModel]="formStatus()" (ngModelChange)="formStatus.set($event)">
                    @for (s of statuses; track s) { <option [value]="s">{{ statusLabel(s) }}</option> }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-text-tertiary block mb-1.5">Priority</label>
                  <select class="input" [ngModel]="formPriority()" (ngModelChange)="formPriority.set($event)">
                    @for (p of priorities; track p) { <option [value]="p">{{ priorityLabel(p) }}</option> }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-medium text-text-tertiary block mb-1.5">Assignee</label>
                  <select class="input" [ngModel]="formAssignee()" (ngModelChange)="formAssignee.set($event)">
                    <option [ngValue]="null">Unassigned</option>
                    @for (u of userStore.users(); track u.id) { <option [value]="u.id">{{ u.name }}</option> }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-text-tertiary block mb-1.5">Project</label>
                  <select class="input" [ngModel]="formProject()" (ngModelChange)="formProject.set($event)">
                    @for (p of projectStore.projects(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }
                  </select>
                </div>
              </div>
              <div>
                <label class="text-xs font-medium text-text-tertiary block mb-1.5">Due Date</label>
                <input type="date" class="input" [ngModel]="formDueDate()" (ngModelChange)="formDueDate.set($event)" />
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <button class="btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn-primary" (click)="createTask()" [disabled]="!formTitle().trim()">Create Task</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TasksComponent {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly ListTodo = ListTodo;
  readonly X = X;
  readonly Trash2 = Trash2;

  taskStore = inject(TaskStore);
  projectStore = inject(ProjectStore);
  userStore = inject(UserStore);

  search = signal("");
  statusFilter = signal<string>("all");
  priorityFilter = signal<string>("all");
  projectFilter = signal<string>("all");

  selectedTask = signal<Task | null>(null);
  showModal = signal(false);

  formTitle = signal("");
  formDesc = signal("");
  formStatus = signal<TaskStatus>("todo");
  formPriority = signal<TaskPriority>("medium");
  formAssignee = signal<string | null>(null);
  formProject = signal<string>("");
  formDueDate = signal<string>("");

  statuses: TaskStatus[] = ["todo", "in_progress", "review", "done"];
  priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

  readonly formatDate = formatDate;

  filteredTasks = computed<Task[]>(() => {
    let list = this.taskStore.tasks();
    const q = this.search().toLowerCase().trim();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    const sf = this.statusFilter();
    if (sf !== "all") list = list.filter((t) => t.status === sf);
    const pf = this.priorityFilter();
    if (pf !== "all") list = list.filter((t) => t.priority === pf);
    const proj = this.projectFilter();
    if (proj !== "all") list = list.filter((t) => t.projectId === proj);
    return list;
  });

  openDrawer(task: Task) {
    this.selectedTask.set(task);
  }

  closeDrawer() {
    this.selectedTask.set(null);
  }

  openCreateModal() {
    this.formTitle.set("");
    this.formDesc.set("");
    this.formStatus.set("todo");
    this.formPriority.set("medium");
    this.formAssignee.set(null);
    this.formProject.set(this.projectStore.projects()[0]?.id ?? "");
    this.formDueDate.set("");
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  createTask() {
    if (!this.formTitle().trim()) return;
    const dto: CreateTaskDto = {
      title: this.formTitle().trim(),
      description: this.formDesc().trim(),
      status: this.formStatus(),
      priority: this.formPriority(),
      assigneeId: this.formAssignee(),
      labels: [],
      projectId: this.formProject(),
      dueDate: this.formDueDate() ? new Date(this.formDueDate()).toISOString() : null,
    };
    this.taskStore.createTask(dto, () => this.closeModal());
  }

  assignee(id: string | null) {
    if (!id) return null;
    return this.userStore.users().find((u) => u.id === id) ?? null;
  }

  projectName(id: string): string {
    return this.projectStore.projects().find((p) => p.id === id)?.name ?? "Unknown";
  }

  statusLabel(s: TaskStatus): string {
    return { todo: "Todo", in_progress: "In Progress", review: "Review", done: "Done" }[s];
  }

  priorityLabel(p: TaskPriority): string {
    return { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" }[p];
  }
}
