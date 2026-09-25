import { Component, inject, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, TrendingUp, CheckCircle2, AlertTriangle, Clock, Zap } from "lucide-angular";
import { TaskStore } from "../../core/state/task.store";
import { ProjectStore } from "../../core/state/project.store";
import { UserStore } from "../../core/state/user.store";
import { LineChartComponent } from "../../shared/components/ui/line-chart.component";
import { BarChartComponent } from "../../shared/components/ui/bar-chart.component";
import { DonutChartComponent } from "../../shared/components/ui/donut-chart.component";
import { ProgressBarComponent } from "../../shared/components/ui/progress-bar.component";

type Range = "7" | "30" | "90";

@Component({
  selector: "app-analytics",
  imports: [
    FormsModule,
    LucideAngularModule,
    LineChartComponent,
    BarChartComponent,
    DonutChartComponent,
    ProgressBarComponent,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Analytics</h1>
          <p class="text-sm text-text-secondary mt-0.5">Productivity insights and team performance</p>
        </div>
        <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-hover border border-border">
          @for (r of ranges; track r.value) {
            <button
              class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
              [class.bg-surface-raised]="range() === r.value"
              [class.text-accent]="range() === r.value"
              [class.text-text-secondary]="range() !== r.value"
              (click)="range.set(r.value)"
            >
              {{ r.label }}
            </button>
          }
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="card p-4">
          <div class="flex items-center gap-2 text-text-tertiary mb-1">
            <lucide-icon [img]="TrendingUp" class="w-4 h-4" />
            <span class="text-xs font-medium">Productivity</span>
          </div>
          <div class="text-2xl font-bold text-text-primary">{{ productivity() }}%</div>
          <div class="text-xs text-success mt-0.5">+{{ productivityTrend() }}% vs last period</div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-2 text-text-tertiary mb-1">
            <lucide-icon [img]="CheckCircle2" class="w-4 h-4" />
            <span class="text-xs font-medium">Completion Rate</span>
          </div>
          <div class="text-2xl font-bold text-text-primary">{{ completionRate() }}%</div>
          <div class="text-xs text-success mt-0.5">{{ completedCount() }} of {{ totalCount() }} tasks</div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-2 text-text-tertiary mb-1">
            <lucide-icon [img]="AlertTriangle" class="w-4 h-4" />
            <span class="text-xs font-medium">Overdue</span>
          </div>
          <div class="text-2xl font-bold text-text-primary">{{ overdueCount() }}</div>
          <div class="text-xs text-danger mt-0.5">{{ overdueCount() }} tasks past due</div>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-2 text-text-tertiary mb-1">
            <lucide-icon [img]="Zap" class="w-4 h-4" />
            <span class="text-xs font-medium">Velocity</span>
          </div>
          <div class="text-2xl font-bold text-text-primary">{{ velocity() }}</div>
          <div class="text-xs text-text-tertiary mt-0.5">tasks / week</div>
        </div>
      </div>

      <!-- Charts row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-5 lg:col-span-2">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Task Completion Trend</h3>
          <app-line-chart [points]="trendData()" height="220px" />
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Priority Distribution</h3>
          <app-donut-chart [segments]="prioritySegments()" centerLabel="Tasks" />
        </div>
      </div>

      <!-- Charts row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Team Workload</h3>
          <app-bar-chart [data]="workloadData()" height="200px" />
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Project Velocity</h3>
          <div class="space-y-3">
            @for (p of projectVelocity(); track p.id) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-text-secondary truncate">{{ p.name }}</span>
                  <span class="text-text-tertiary">{{ p.completed }}/{{ p.total }}</span>
                </div>
                <app-progress-bar [value]="p.progress" />
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsComponent {
  readonly TrendingUp = TrendingUp;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertTriangle = AlertTriangle;
  readonly Clock = Clock;
  readonly Zap = Zap;

  private taskStore = inject(TaskStore);
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);

  range = signal<Range>("30");
  ranges: { value: Range; label: string }[] = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
  ];

  totalCount = computed(() => this.taskStore.tasks().length);
  completedCount = computed(() => this.taskStore.completedTasks().length);
  overdueCount = computed(() => this.taskStore.overdueTasks().length);

  completionRate = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  productivity = computed(() => {
    const r = this.range();
    const base = this.completionRate();
    const factor = r === "7" ? 1.05 : r === "30" ? 1.0 : 0.92;
    return Math.round(base * factor);
  });

  productivityTrend = computed(() => {
    const r = this.range();
    return r === "7" ? 12 : r === "30" ? 8 : 5;
  });

  velocity = computed(() => {
    const r = this.range();
    const weekly = this.completedCount() / 4;
    const factor = r === "7" ? 0.5 : r === "30" ? 1 : 1.8;
    return Math.round(weekly * factor);
  });

  trendData = computed(() => {
    const r = this.range();
    const points = r === "7" ? 7 : r === "30" ? 8 : 10;
    const base = Math.round(this.completedCount() / points);
    return Array.from({ length: points }, (_, i) => ({
      label: r === "7" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] : `W${i + 1}`,
      value: Math.max(1, Math.round(base * (0.7 + Math.random() * 0.6))),
    }));
  });

  prioritySegments = computed(() => {
    const byP = this.taskStore.tasksByPriority();
    return [
      { label: "Low", value: byP.low.length, color: "#9ca3af" },
      { label: "Medium", value: byP.medium.length, color: "#6366f1" },
      { label: "High", value: byP.high.length, color: "#f59e0b" },
      { label: "Urgent", value: byP.urgent.length, color: "#ef4444" },
    ];
  });

  workloadData = computed(() =>
    this.userStore.users().slice(0, 6).map((u) => ({
      label: u.name.split(" ")[0],
      value: this.taskStore.tasks().filter((t) => t.assigneeId === u.id && t.status !== "done").length,
      color: "#6366f1",
    })),
  );

  projectVelocity = computed(() =>
    this.projectStore.projects().slice(0, 5).map((p) => {
      const tasks = this.taskStore.tasks().filter((t) => t.projectId === p.id);
      const completed = tasks.filter((t) => t.status === "done").length;
      const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      return { id: p.id, name: p.name, completed, total: tasks.length, progress };
    }),
  );
}
