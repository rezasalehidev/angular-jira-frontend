import { Component, inject, signal, computed } from "@angular/core";
import {
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPreview,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { LucideAngularModule, Plus, MoreHorizontal } from "lucide-angular";
import { TaskStore } from "../../core/state/task.store";
import { UserStore } from "../../core/state/user.store";
import { Task, TaskStatus } from "../../core/models";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { StatusBadgeComponent } from "../../shared/components/ui/status-badge.component";
import { TaskDrawerComponent } from "../../shared/components/task-drawer/task-drawer.component";
import { formatDate } from "../../shared/utils/format";

interface Column {
  status: TaskStatus;
  title: string;
  color: string;
}

@Component({
  selector: "app-kanban",
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragPreview,
    LucideAngularModule,
    AvatarComponent,
    StatusBadgeComponent,
    TaskDrawerComponent,
  ],
  template: `
    <div class="p-6 animate-fade-in h-full flex flex-col">
      <div class="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Kanban Board</h1>
          <p class="text-sm text-text-secondary mt-0.5">Drag tasks between columns to update status</p>
        </div>
        <button class="btn-primary">
          <lucide-icon [img]="Plus" class="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div cdkDropListGroup class="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        @for (col of columns; track col.status) {
          <div
            cdkDropList
            [cdkDropListData]="tasksByStatus()[col.status]"
            [cdkDropListConnectedTo]="dropListIds"
            (cdkDropListDropped)="drop($event, col.status)"
            class="w-72 shrink-0 bg-surface-hover rounded-xl flex flex-col max-h-full"
          >
            <!-- Column header -->
            <div class="flex items-center justify-between px-4 py-3 shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" [style.background]="col.color"></span>
                <span class="text-sm font-semibold text-text-primary">{{ col.title }}</span>
                <span class="text-xs text-text-tertiary">{{ tasksByStatus()[col.status].length }}</span>
              </div>
              <button class="btn-ghost p-1">
                <lucide-icon [img]="Plus" class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Cards -->
            <div class="px-2 pb-2 space-y-2 overflow-y-auto flex-1 min-h-0">
              @for (task of tasksByStatus()[col.status]; track task.id) {
                <div
                  cdkDrag
                  class="card p-3 cursor-move hover:shadow-md transition-shadow"
                  (click)="openDrawer(task)"
                >
                  <div *cdkDragPreview class="card p-3 opacity-90 rotate-2">
                    <p class="text-sm font-medium text-text-primary">{{ task.title }}</p>
                  </div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <p class="text-sm font-medium text-text-primary line-clamp-2">{{ task.title }}</p>
                    <app-status-badge kind="priority" [value]="task.priority" />
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    @if (assignee(task.assigneeId)) {
                      <app-avatar [name]="assignee(task.assigneeId)!.name" [seed]="task.assigneeId!" size="xs" />
                    } @else {
                      <div class="w-5 h-5 rounded-full bg-surface-active flex items-center justify-center text-2xs text-text-tertiary">—</div>
                    }
                    <span class="text-xs text-text-tertiary">{{ formatDate(task.dueDate) }}</span>
                  </div>
                </div>
              }
              @if (tasksByStatus()[col.status].length === 0) {
                <div class="text-center py-8 text-xs text-text-tertiary border-2 border-dashed border-border rounded-lg">
                  Drop tasks here
                </div>
              }
            </div>
          </div>
        }
      </div>

      <app-task-drawer [task]="selectedTask()" (close)="closeDrawer()" />
    </div>
  `,
})
export class KanbanComponent {
  readonly Plus = Plus;
  readonly MoreHorizontal = MoreHorizontal;

  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);

  selectedTask = signal<Task | null>(null);

  columns: Column[] = [
    { status: "todo", title: "Todo", color: "#9ca3af" },
    { status: "in_progress", title: "In Progress", color: "#6366f1" },
    { status: "review", title: "Review", color: "#f59e0b" },
    { status: "done", title: "Done", color: "#10b981" },
  ];

  dropListIds = ["cdk-drop-list-0", "cdk-drop-list-1", "cdk-drop-list-2", "cdk-drop-list-3"];

  readonly formatDate = formatDate;

  tasksByStatus = computed(() => this.taskStore.tasksByStatus());

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus) {
    const task = event.item.data as Task;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    if (task.status !== targetStatus) {
      this.taskStore.updateStatus(task.id, targetStatus, () => {
        // rollback handled by store
      });
    }
  }

  openDrawer(task: Task) {
    this.selectedTask.set(task);
  }

  closeDrawer() {
    this.selectedTask.set(null);
  }

  assignee(id: string | null) {
    if (!id) return null;
    return this.userStore.users().find((u) => u.id === id) ?? null;
  }
}
