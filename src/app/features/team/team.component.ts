import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, Search } from "lucide-angular";
import { UserStore } from "../../core/state/user.store";
import { TaskStore } from "../../core/state/task.store";
import { User } from "../../core/models";
import { AvatarComponent } from "../../shared/components/ui/avatar.component";
import { ProgressBarComponent } from "../../shared/components/ui/progress-bar.component";
import { SkeletonComponent } from "../../shared/components/ui/skeleton.component";

@Component({
  selector: "app-team",
  imports: [FormsModule, LucideAngularModule, AvatarComponent, ProgressBarComponent, SkeletonComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Team</h1>
        <p class="text-sm text-text-secondary mt-0.5">{{ filteredUsers().length }} members</p>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-hover border border-border rounded-lg flex-1 max-w-xs">
          <lucide-icon [img]="Search" class="w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Search team..."
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
        </div>
        <select class="input w-auto" [ngModel]="roleFilter()" (ngModelChange)="roleFilter.set($event)">
          <option value="all">All roles</option>
          @for (r of roles(); track r) { <option [value]="r">{{ r }}</option> }
        </select>
        <select class="input w-auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
          <option value="all">All status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <!-- Cards -->
      @if (userStore.loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card p-5">
              <div class="flex items-center gap-3">
                <app-skeleton width="3rem" height="3rem" rounded="full" />
                <div class="flex-1">
                  <app-skeleton width="60%" height="0.875rem" />
                  <app-skeleton width="40%" height="0.75rem" class="mt-1" />
                </div>
              </div>
              <app-skeleton width="100%" height="0.5rem" class="mt-4" />
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (u of filteredUsers(); track u.id) {
            <div class="card p-5">
              <div class="flex items-start gap-3">
                <div class="relative">
                  <app-avatar [name]="u.name" [seed]="u.id" size="lg" />
                  <span
                    class="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-surface-raised"
                    [class.bg-success]="u.online"
                    [class.bg-text-tertiary]="!u.online"
                  ></span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-text-primary truncate">{{ u.name }}</h3>
                  <p class="text-xs text-text-tertiary">{{ u.role }}</p>
                  <p class="text-xs text-text-tertiary truncate">{{ u.email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <div class="text-lg font-bold text-text-primary">{{ activeTaskCount(u.id) }}</div>
                  <div class="text-2xs text-text-tertiary">Active</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-text-primary">{{ completedTaskCount(u.id) }}</div>
                  <div class="text-2xs text-text-tertiary">Done</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-text-primary">{{ workload(u.id) }}%</div>
                  <div class="text-2xs text-text-tertiary">Workload</div>
                </div>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-xs text-text-tertiary mb-1">
                  <span>Capacity</span>
                  <span>{{ workloadLabel(u.id) }}</span>
                </div>
                <app-progress-bar [value]="workload(u.id)" [color]="workloadColor(u.id)" />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TeamComponent {
  readonly Search = Search;

  userStore = inject(UserStore);
  private taskStore = inject(TaskStore);

  search = signal("");
  roleFilter = signal<string>("all");
  statusFilter = signal<string>("all");

  roles = computed(() => [...new Set(this.userStore.users().map((u) => u.role))].sort());

  filteredUsers = computed<User[]>(() => {
    let list = this.userStore.users();
    const q = this.search().toLowerCase().trim();
    if (q) list = list.filter((u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
    const rf = this.roleFilter();
    if (rf !== "all") list = list.filter((u) => u.role === rf);
    const sf = this.statusFilter();
    if (sf === "online") list = list.filter((u) => u.online);
    if (sf === "offline") list = list.filter((u) => !u.online);
    return list;
  });

  activeTaskCount(userId: string): number {
    return this.taskStore.tasks().filter((t) => t.assigneeId === userId && t.status !== "done").length;
  }

  completedTaskCount(userId: string): number {
    return this.taskStore.tasks().filter((t) => t.assigneeId === userId && t.status === "done").length;
  }

  workload(userId: string): number {
    const active = this.activeTaskCount(userId);
    return Math.min(active * 15, 100);
  }

  workloadLabel(userId: string): string {
    const w = this.workload(userId);
    if (w >= 80) return "Overloaded";
    if (w >= 50) return "Busy";
    if (w >= 25) return "Moderate";
    return "Available";
  }

  workloadColor(userId: string): string {
    const w = this.workload(userId);
    if (w >= 80) return "rgb(var(--danger))";
    if (w >= 50) return "rgb(var(--warning))";
    return "rgb(var(--success))";
  }
}
