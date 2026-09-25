import { Injectable, signal, computed, inject } from "@angular/core";
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from "../models";
import { TaskService } from "../services/task.service";

@Injectable({ providedIn: "root" })
export class TaskStore {
  private taskService = inject(TaskService);

  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly tasksByStatus = computed(() => {
    const tasks = this._tasks();
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };
  });

  readonly tasksByPriority = computed(() => {
    const tasks = this._tasks();
    return {
      low: tasks.filter((t) => t.priority === "low"),
      medium: tasks.filter((t) => t.priority === "medium"),
      high: tasks.filter((t) => t.priority === "high"),
      urgent: tasks.filter((t) => t.priority === "urgent"),
    };
  });

  readonly overdueTasks = computed(() => {
    const now = new Date().toISOString();
    return this._tasks().filter(
      (t) => t.dueDate !== null && t.dueDate < now && t.status !== "done"
    );
  });

  readonly completedTasks = computed(() =>
    this._tasks().filter((t) => t.status === "done")
  );

  tasksForProject(projectId: string) {
    return computed(() => this._tasks().filter((t) => t.projectId === projectId));
  }

  taskById(id: string) {
    return computed(() => this._tasks().find((t) => t.id === id));
  }

  load() {
    this._loading.set(true);
    this._error.set(null);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this._tasks.set(tasks);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.message ?? "Failed to load tasks");
        this._loading.set(false);
      },
    });
  }

  createTask(dto: CreateTaskDto, onSuccess?: (task: Task) => void) {
    this.taskService.createTask(dto).subscribe({
      next: (task) => {
        this._tasks.update((tasks) => [task, ...tasks]);
        onSuccess?.(task);
      },
      error: (err) => this._error.set(err.message ?? "Failed to create task"),
    });
  }

  updateTask(id: string, dto: UpdateTaskDto, onError?: () => void) {
    const prevTasks = this._tasks();
    const idx = prevTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const updated = { ...prevTasks[idx], ...dto, updatedAt: new Date().toISOString() };
      this._tasks.update((tasks) => {
        const copy = [...tasks];
        copy[idx] = updated;
        return copy;
      });
    }
    this.taskService.updateTask(id, dto).subscribe({
      error: () => {
        this._tasks.set(prevTasks);
        onError?.();
      },
    });
  }

  updateStatus(id: string, status: TaskStatus, onError?: () => void) {
    this.updateTask(id, { status }, onError);
  }

  deleteTask(id: string) {
    const prevTasks = this._tasks();
    this._tasks.update((tasks) => tasks.filter((t) => t.id !== id));
    this.taskService.deleteTask(id).subscribe({
      error: () => this._tasks.set(prevTasks),
    });
  }
}
