import {
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  effect,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, X, MessageSquare, Clock } from "lucide-angular";
import { Task, TaskStatus, TaskPriority, Label, Comment } from "../../../core/models";
import { TaskStore } from "../../../core/state/task.store";
import { UserStore } from "../../../core/state/user.store";
import { CommentStore } from "../../../core/state/comment.store";
import { ActivityStore } from "../../../core/state/activity.store";
import { ProjectStore } from "../../../core/state/project.store";
import { mockLabels } from "../../../core/mock/mock-tasks";
import { AvatarComponent } from "../../components/ui/avatar.component";
import { StatusBadgeComponent } from "../../components/ui/status-badge.component";
import { LabelChipComponent } from "../../components/ui/label-chip.component";
import { formatDate, formatRelativeTime } from "../../utils/format";

@Component({
  selector: "app-task-drawer",
  imports: [
    FormsModule,
    LucideAngularModule,
    AvatarComponent,
    LabelChipComponent,
  ],
  template: `
    @if (task()) {
      <div class="fixed inset-0 z-[90] flex justify-end">
        <div class="absolute inset-0 bg-black/40 animate-fade-in" (click)="close.emit()"></div>
        <div class="relative w-full max-w-md bg-surface-raised border-l border-border shadow-xl animate-slide-in-right flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
            <span class="text-sm font-semibold text-text-secondary">Task Details</span>
            <button class="btn-ghost p-1.5" (click)="close.emit()" aria-label="Close">
              <lucide-icon [img]="X" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <!-- Title -->
            <input
              type="text"
              class="w-full text-lg font-semibold text-text-primary bg-transparent border-none outline-none focus:bg-surface-hover rounded px-2 py-1 -mx-2 transition-colors"
              [ngModel]="task()!.title"
              (ngModelChange)="updateField('title', $event)"
            />

            <!-- Properties -->
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-text-tertiary w-20 shrink-0">Status</span>
                <select
                  class="input flex-1 py-1"
                  [ngModel]="task()!.status"
              (ngModelChange)="updateField('status', $event)"
                >
                @for (s of statuses; track s) {
                  <option [value]="s">{{ statusLabel(s) }}</option>
                }
                </select>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-text-tertiary w-20 shrink-0">Priority</span>
                <select
                  class="input flex-1 py-1"
                  [ngModel]="task()!.priority"
              (ngModelChange)="updateField('priority', $event)"
                >
                @for (p of priorities; track p) {
                  <option [value]="p">{{ priorityLabel(p) }}</option>
                }
                </select>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-text-tertiary w-20 shrink-0">Assignee</span>
                <select
                  class="input flex-1 py-1"
                  [ngModel]="task()!.assigneeId"
              (ngModelChange)="updateField('assigneeId', $event)"
                >
                <option [ngValue]="null">Unassigned</option>
                @for (u of userStore.users(); track u.id) {
                  <option [value]="u.id">{{ u.name }}</option>
                }
                </select>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-text-tertiary w-20 shrink-0">Due Date</span>
                <input
                  type="date"
                  class="input flex-1 py-1"
                  [ngModel]="dueDateValue()"
              (ngModelChange)="updateDueDate($event)"
                />
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xs font-medium text-text-tertiary w-20 shrink-0 pt-1.5">Labels</span>
                <div class="flex flex-wrap gap-1.5 flex-1">
                  @for (label of taskLabels(); track label.id) {
                    <app-label-chip [label]="label" />
                  }
                  @if (taskLabels().length === 0) {
                    <span class="text-xs text-text-tertiary">No labels</span>
                  }
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h4 class="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Description</h4>
              <textarea
                class="input min-h-[80px] resize-y"
                [ngModel]="task()!.description"
            (ngModelChange)="updateField('description', $event)"
              ></textarea>
            </div>

            <!-- Comments -->
            <div>
              <h4 class="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <lucide-icon [img]="MessageSquare" class="w-3.5 h-3.5"></lucide-icon>
                Comments ({{ commentsForTask().length }})
              </h4>
              <div class="space-y-3">
                @for (c of commentsForTask(); track c.id) {
                  <div class="flex gap-2.5">
                    <app-avatar [name]="authorName(c.authorId)" [seed]="c.authorId" size="xs" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-text-primary">{{ authorName(c.authorId) }}</span>
                        <span class="text-2xs text-text-tertiary">{{ formatRelativeTime(c.createdAt) }}</span>
                      </div>
                      <p class="text-sm text-text-secondary mt-0.5">{{ c.content }}</p>
                    </div>
                  </div>
                }
                @if (commentsForTask().length === 0) {
                  <p class="text-sm text-text-tertiary">No comments yet.</p>
                }
              </div>
              <div class="mt-3 flex gap-2">
                <input
                  type="text"
                  class="input flex-1"
                  placeholder="Add a comment..."
                  [ngModel]="newComment()"
              (ngModelChange)="newComment.set($event)"
                  (keydown.enter)="addComment()"
                />
                <button class="btn-primary" (click)="addComment()" [disabled]="!newComment().trim()">Send</button>
              </div>
            </div>

            <!-- Activity -->
            <div>
              <h4 class="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <lucide-icon [img]="Clock" class="w-3.5 h-3.5"></lucide-icon>
                Activity
              </h4>
              <div class="space-y-2.5">
                @for (a of taskActivity(); track a.id) {
                  <div class="flex gap-2.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-1.5 shrink-0"></div>
                    <div>
                      <p class="text-sm text-text-secondary">{{ a.description }}</p>
                      <span class="text-2xs text-text-tertiary">{{ formatRelativeTime(a.createdAt) }}</span>
                    </div>
                  </div>
                }
                @if (taskActivity().length === 0) {
                  <p class="text-sm text-text-tertiary">No recent activity.</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class TaskDrawerComponent implements OnInit, OnDestroy {
  readonly X = X;
  readonly MessageSquare = MessageSquare;
  readonly Clock = Clock;

  task = input<Task | null>(null);
  close = output<void>();

  private taskStore = inject(TaskStore);
  private commentStore = inject(CommentStore);
  private activityStore = inject(ActivityStore);
  userStore = inject(UserStore);
  private projectStore = inject(ProjectStore);

  newComment = signal("");
  private loadedTaskId: string | null = null;

  statuses: TaskStatus[] = ["todo", "in_progress", "review", "done"];
  priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

  readonly formatDate = formatDate;
  readonly formatRelativeTime = formatRelativeTime;

  taskLabels = computed<Label[]>(() => {
    const t = this.task();
    if (!t) return [];
    return t.labels
      .map((id) => mockLabels.find((l) => l.id === id))
      .filter((l): l is Label => l !== undefined);
  });

  dueDateValue = computed(() => {
    const t = this.task();
    if (!t?.dueDate) return "";
    return t.dueDate.split("T")[0];
  });

  commentsForTask = computed<Comment[]>(() => {
    const t = this.task();
    if (!t) return [];
    return this.commentStore.comments().filter((c) => c.taskId === t.id);
  });

  taskActivity = computed(() => {
    const t = this.task();
    if (!t) return [];
    return this.activityStore.activities().filter((a) => a.taskId === t.id);
  });

  constructor() {
    effect(() => {
      const t = this.task();
      if (t && t.id !== this.loadedTaskId) {
        this.loadedTaskId = t.id;
        this.commentStore.loadForTask(t.id);
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.loadedTaskId = null;
  }

  updateField(field: keyof Task, value: string | null) {
    const t = this.task();
    if (!t) return;
    this.taskStore.updateTask(t.id, { [field]: value } as Partial<Task>);
  }

  updateDueDate(value: string) {
    const t = this.task();
    if (!t) return;
    const iso = value ? new Date(value).toISOString() : null;
    this.taskStore.updateTask(t.id, { dueDate: iso });
  }

  addComment() {
    const t = this.task();
    const text = this.newComment().trim();
    if (!t || !text) return;
    this.commentStore.addComment(t.id, "u1", text);
    this.newComment.set("");
  }

  authorName(id: string): string {
    return this.userStore.users().find((u) => u.id === id)?.name ?? "Unknown";
  }

  statusLabel(s: TaskStatus): string {
    return { todo: "Todo", in_progress: "In Progress", review: "Review", done: "Done" }[s];
  }

  priorityLabel(p: TaskPriority): string {
    return { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" }[p];
  }
}
