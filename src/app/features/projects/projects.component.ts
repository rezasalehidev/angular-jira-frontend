import { Component, inject, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, Search, LayoutGrid, List, Plus, FolderKanban, Calendar } from "lucide-angular";
import { ProjectStore } from "../../core/state/project.store";
import { TaskStore } from "../../core/state/task.store";
import { UserStore } from "../../core/state/user.store";
import { Project, ProjectStatus } from "../../core/models";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { StatusBadgeComponent } from "../../shared/components/ui/status-badge.component";
import { ProgressBarComponent } from "../../shared/components/ui/progress-bar.component";
import { EmptyStateComponent } from "../../shared/components/ui/empty-state.component";
import { SkeletonComponent } from "../../shared/components/ui/skeleton.component";
import { formatDate } from "../../shared/utils/format";

type SortKey = "name" | "deadline" | "progress" | "status";

@Component({
  selector: "app-projects",
  imports: [
    FormsModule,
    LucideAngularModule,
    AvatarComponent,
    StatusBadgeComponent,
    ProgressBarComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Projects</h1>
          <p class="text-sm text-text-secondary mt-0.5">{{ filteredProjects().length }} projects</p>
        </div>
        <button class="btn-primary">
          <lucide-icon [img]="Plus" class="w-4 h-4" />
          New Project
        </button>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-hover border border-border rounded-lg flex-1 max-w-xs">
          <lucide-icon [img]="Search" class="w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Search projects..."
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
        </div>
        <select class="input w-auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
          <option value="all">All statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <select class="input w-auto" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
          <option value="name">Sort: Name</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="progress">Sort: Progress</option>
          <option value="status">Sort: Status</option>
        </select>
        <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-hover border border-border">
          <button class="p-1.5 rounded-md transition-colors" [class.bg-surface-raised]="viewMode() === 'grid'" [class.text-accent]="viewMode() === 'grid'" (click)="viewMode.set('grid')">
            <lucide-icon [img]="LayoutGrid" class="w-4 h-4" />
          </button>
          <button class="p-1.5 rounded-md transition-colors" [class.bg-surface-raised]="viewMode() === 'list'" [class.text-accent]="viewMode() === 'list'" (click)="viewMode.set('list')">
            <lucide-icon [img]="List" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Content -->
      @if (projectStore.loading()) {
        <div [class]="viewMode() === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card p-5">
              <app-skeleton width="60%" height="1rem" />
              <app-skeleton width="100%" height="0.75rem" class="mt-2" />
              <app-skeleton width="100%" height="0.5rem" class="mt-4" />
              <app-skeleton width="50%" height="0.75rem" class="mt-3" />
            </div>
          }
        </div>
      } @else if (filteredProjects().length === 0) {
        <app-empty-state
          [icon]="FolderKanban"
          title="No projects found"
          description="Try changing your filters or create a new project to get started."
          actionLabel="Create Project"
        />
      } @else {
        <!-- Grid view -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (p of filteredProjects(); track p.id) {
              <button class="card p-5 text-left hover:shadow-md hover:border-border-strong transition-all duration-200 group" (click)="openProject(p.id)">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-base font-semibold text-text-primary group-hover:text-accent transition-colors">{{ p.name }}</h3>
                  <app-status-badge kind="project-status" [value]="p.status" />
                </div>
                <p class="text-sm text-text-secondary line-clamp-2 mb-4">{{ p.description }}</p>
                <app-progress-bar [value]="progress(p.id)" />
                <div class="flex items-center justify-between mt-3">
                  <div class="flex -space-x-2">
                    @for (m of members(p); track m.id) {
                      <div class="ring-2 ring-surface-raised rounded-full">
                        <app-avatar [name]="m.name" [seed]="m.id" size="xs" />
                      </div>
                    }
                    @if (members(p).length > 4) {
                      <div class="w-5 h-5 rounded-full bg-surface-active ring-2 ring-surface-raised flex items-center justify-center text-2xs font-medium text-text-secondary">+{{ p.memberIds.length - 4 }}</div>
                    }
                  </div>
                  <span class="text-xs text-text-tertiary">{{ taskCount(p.id) }} tasks</span>
                </div>
                <div class="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                  <lucide-icon [img]="CalendarIcon" class="w-3.5 h-3.5 text-text-tertiary" />
                  <span class="text-xs text-text-tertiary">{{ formatDate(p.deadline) }}</span>
                </div>
              </button>
            }
          </div>
        } @else {
          <!-- List view -->
          <div class="space-y-2">
            @for (p of filteredProjects(); track p.id) {
              <button class="card p-4 w-full text-left hover:shadow-sm hover:border-border-strong transition-all flex items-center gap-4" (click)="openProject(p.id)">
                <div class="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <lucide-icon [img]="FolderKanban" class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-text-primary">{{ p.name }}</h3>
                    <app-status-badge kind="project-status" [value]="p.status" />
                  </div>
                  <p class="text-xs text-text-secondary truncate">{{ p.description }}</p>
                </div>
                <div class="hidden md:flex items-center gap-2 w-32">
                  <app-progress-bar [value]="progress(p.id)" />
                  <span class="text-xs text-text-tertiary w-8 text-right">{{ progress(p.id) }}%</span>
                </div>
                <div class="hidden lg:flex -space-x-2">
                  @for (m of members(p).slice(0, 3); track m.id) {
                    <div class="ring-2 ring-surface-raised rounded-full">
                      <app-avatar [name]="m.name" [seed]="m.id" size="xs" />
                    </div>
                  }
                </div>
                <span class="text-xs text-text-tertiary whitespace-nowrap">{{ formatDate(p.deadline) }}</span>
              </button>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ProjectsComponent {
  readonly FolderKanban = FolderKanban;
  readonly Search = Search;
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;
  readonly Plus = Plus;
  readonly CalendarIcon = Calendar;

  projectStore = inject(ProjectStore);
  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  search = signal("");
  statusFilter = signal<string>("all");
  sortBy = signal<SortKey>("name");
  viewMode = signal<"grid" | "list">("grid");

  readonly formatDate = formatDate;

  filteredProjects = computed<Project[]>(() => {
    let list = this.projectStore.projects();
    const q = this.search().toLowerCase().trim();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    const sf = this.statusFilter();
    if (sf !== "all") list = list.filter((p) => p.status === sf);
    const key = this.sortBy();
    return [...list].sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name);
      if (key === "deadline") return (a.deadline ?? "").localeCompare(b.deadline ?? "");
      if (key === "progress") return this.progress(b.id) - this.progress(a.id);
      return a.status.localeCompare(b.status);
    });
  });

  progress(projectId: string): number {
    const tasks = this.taskStore.tasks().filter((t) => t.projectId === projectId);
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100);
  }

  taskCount(projectId: string): number {
    return this.taskStore.tasks().filter((t) => t.projectId === projectId).length;
  }

  members(p: Project) {
    return p.memberIds
      .map((id) => this.userStore.users().find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => u !== undefined)
      .slice(0, 4);
  }

  openProject(id: string) {
    this.router.navigate(["/projects", id]);
  }
}
