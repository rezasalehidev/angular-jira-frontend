import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { Task, CreateTaskDto, UpdateTaskDto } from "../models";
import { mockTasks } from "../mock/mock-tasks";

@Injectable({ providedIn: "root" })
export class TaskService {
  private tasks: Task[] = [...mockTasks];

  getTasks(): Observable<Task[]> {
    return of([...this.tasks]).pipe(delay(400));
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return of(this.tasks.filter((t) => t.projectId === projectId)).pipe(delay(300));
  }

  getTask(id: string): Observable<Task | undefined> {
    return of(this.tasks.find((t) => t.id === id)).pipe(delay(200));
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: `t${Date.now()}`,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks = [task, ...this.tasks];
    return of(task).pipe(delay(500));
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error("Task not found");
    }
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    return of(this.tasks[idx]).pipe(delay(400));
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return of(void 0).pipe(delay(300));
  }

  updateStatus(id: string, status: Task["status"]): Observable<Task> {
    return this.updateTask(id, { status });
  }
}
