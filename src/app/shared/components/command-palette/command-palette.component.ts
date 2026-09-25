import {
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  HostListener,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subject, of } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { LucideAngularModule, Search, FolderKanban, ListTodo, User, Activity } from "lucide-angular";
import { ProjectStore } from "../../../core/state/project.store";
import { TaskStore } from "../../../core/state/task.store";
import { UserStore } from "../../../core/state/user.store";
import { ActivityStore } from "../../../core/state/activity.store";

interface SearchResult {
  id: string;
  label: string;
  subtitle: string;
  type: "project" | "task" | "user" | "activity";
  route: string;
}

@Component({
  selector: "app-command-palette",
  imports: [LucideAngularModule, FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <div class="absolute inset-0 bg-black/40 animate-fade-in" (click)="close.emit()"></div>
        <div class="relative w-full max-w-xl bg-surface-raised border border-border rounded-2xl shadow-popover animate-scale-in overflow-hidden">
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
            <lucide-icon [img]="Search" class="w-5 h-5 text-text-tertiary"></lucide-icon>
            <input
              #searchInput
              type="text"
              class="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
              placeholder="Search projects, tasks, people..."
              [ngModel]="query()"
              (ngModelChange)="onQueryChange($event)"
            />
            <kbd class="text-2xs font-mono px-1.5 py-0.5 rounded border border-border text-text-tertiary">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-[400px] overflow-y-auto p-2">
            @if (loading()) {
              <div class="px-3 py-6 text-center text-sm text-text-tertiary">Searching...</div>
            } @else if (results().length === 0) {
              <div class="px-3 py-6 text-center text-sm text-text-tertiary">
                @if (query().length > 0) {
                  No results for "{{ query() }}"
                } @else {
                  Start typing to search...
                }
              </div>
            } @else {
              @for (result of results(); track result.id; let i = $index) {
                <button
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                  [class.bg-surface-hover]="i === selectedIndex()"
                  (click)="selectResult(result)"
                  (mouseenter)="selectedIndex.set(i)"
                >
                  <span class="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                    <lucide-icon [img]="iconFor(result.type)" class="w-4 h-4 text-text-secondary"></lucide-icon>
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-text-primary truncate">{{ result.label }}</div>
                    <div class="text-xs text-text-tertiary truncate">{{ result.subtitle }}</div>
                  </div>
                  <span class="text-2xs text-text-tertiary uppercase tracking-wide">{{ result.type }}</span>
                </button>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent implements OnInit, OnDestroy {
  @HostListener("document:keydown", ["$event"])
  handleKeydown(event: KeyboardEvent) {
    if (!this.open()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.close.emit();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.selectedIndex.update((i) => Math.min(i + 1, this.results().length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.selectedIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && this.results()[this.selectedIndex()]) {
      event.preventDefault();
      this.selectResult(this.results()[this.selectedIndex()]);
    }
  }

  open = input(false);
  close = output<void>();

  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private activityStore = inject(ActivityStore);

  query = signal("");
  loading = signal(false);
  selectedIndex = signal(0);
  private querySubject = new Subject<string>();

  results = computed<SearchResult[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    const out: SearchResult[] = [];
    for (const p of this.projectStore.projects()) {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        out.push({ id: p.id, label: p.name, subtitle: "Project", type: "project", route: `/projects/${p.id}` });
      }
    }
    for (const t of this.taskStore.tasks()) {
      if (t.title.toLowerCase().includes(q)) {
        out.push({ id: t.id, label: t.title, subtitle: "Task", type: "task", route: "/tasks" });
      }
    }
    for (const u of this.userStore.users()) {
      if (u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
        out.push({ id: u.id, label: u.name, subtitle: u.role, type: "user", route: "/team" });
      }
    }
    for (const a of this.activityStore.activities()) {
      if (a.description.toLowerCase().includes(q)) {
        out.push({ id: a.id, label: a.description, subtitle: "Activity", type: "activity", route: "/dashboard" });
      }
    }
    return out.slice(0, 12);
  });

  ngOnInit() {
    this.querySubject
      .pipe(
        debounceTime(200),
        switchMap((q) => {
          this.loading.set(true);
          return of(q).pipe(debounceTime(50));
        }),
      )
      .subscribe(() => {
        this.loading.set(false);
        this.selectedIndex.set(0);
      });
  }

  ngOnDestroy() {
    this.querySubject.complete();
  }

  onQueryChange(value: string) {
    this.query.set(value);
    this.querySubject.next(value);
  }

  selectResult(result: SearchResult) {
    this.router.navigate([result.route]);
    this.close.emit();
  }

  iconFor(type: string) {
    const map: Record<string, typeof FolderKanban> = {
      project: FolderKanban,
      task: ListTodo,
      user: User,
      activity: Activity,
    };
    return map[type] ?? Search;
  }

  readonly Search = Search;
  readonly FolderKanban = FolderKanban;
  readonly ListTodo = ListTodo;
  readonly User = User;
  readonly Activity = Activity;
}
