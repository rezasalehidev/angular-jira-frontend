import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { Project, CreateProjectDto, UpdateProjectDto } from "../models";
import { mockProjects } from "../mock/mock-projects";

@Injectable({ providedIn: "root" })
export class ProjectService {
  private projects: Project[] = [...mockProjects];

  getProjects(): Observable<Project[]> {
    return of([...this.projects]).pipe(delay(400));
  }

  getProject(id: string): Observable<Project | undefined> {
    return of(this.projects.find((p) => p.id === id)).pipe(delay(300));
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: `p${Date.now()}`,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    this.projects = [project, ...this.projects];
    return of(project).pipe(delay(500));
  }

  updateProject(id: string, dto: UpdateProjectDto): Observable<Project> {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error("Project not found");
    }
    this.projects[idx] = {
      ...this.projects[idx],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    return of(this.projects[idx]).pipe(delay(400));
  }

  deleteProject(id: string): Observable<void> {
    this.projects = this.projects.filter((p) => p.id !== id);
    return of(void 0).pipe(delay(300));
  }
}
