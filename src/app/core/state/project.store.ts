import { Injectable, signal, computed, inject } from "@angular/core";
import { Project, CreateProjectDto, UpdateProjectDto } from "../models";
import { ProjectService } from "../services/project.service";

@Injectable({ providedIn: "root" })
export class ProjectStore {
  private projectService = inject(ProjectService);

  private _projects = signal<Project[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeProjects = computed(() =>
    this._projects().filter((p) => p.status === "active")
  );

  readonly completedProjects = computed(() =>
    this._projects().filter((p) => p.status === "completed")
  );

  readonly planningProjects = computed(() =>
    this._projects().filter((p) => p.status === "planning")
  );

  readonly onHoldProjects = computed(() =>
    this._projects().filter((p) => p.status === "on_hold")
  );

  projectById(id: string) {
    return computed(() => this._projects().find((p) => p.id === id));
  }

  load() {
    this._loading.set(true);
    this._error.set(null);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this._projects.set(projects);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.message ?? "Failed to load projects");
        this._loading.set(false);
      },
    });
  }

  createProject(dto: CreateProjectDto, onSuccess?: (project: Project) => void) {
    this.projectService.createProject(dto).subscribe({
      next: (project) => {
        this._projects.update((projects) => [project, ...projects]);
        onSuccess?.(project);
      },
      error: (err) => this._error.set(err.message ?? "Failed to create project"),
    });
  }

  updateProject(id: string, dto: UpdateProjectDto) {
    const prev = this._projects();
    const idx = prev.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const updated = { ...prev[idx], ...dto, updatedAt: new Date().toISOString() };
      this._projects.update((projects) => {
        const copy = [...projects];
        copy[idx] = updated;
        return copy;
      });
    }
    this.projectService.updateProject(id, dto).subscribe({
      error: () => this._projects.set(prev),
    });
  }

  deleteProject(id: string) {
    const prev = this._projects();
    this._projects.update((projects) => projects.filter((p) => p.id !== id));
    this.projectService.deleteProject(id).subscribe({
      error: () => this._projects.set(prev),
    });
  }
}
