import { Component, input, computed } from "@angular/core";
import { TaskStatus, TaskPriority, ProjectStatus } from "../../../core/models";

type BadgeKind = "task-status" | "priority" | "project-status";

@Component({
  selector: "app-status-badge",
  template: `
    <span class="badge" [class]="classes()">
      @if (dot()) {
        <span class="w-1.5 h-1.5 rounded-full" [style.background]="dotColor()"></span>
      }
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  kind = input.required<BadgeKind>();
  value = input.required<string>();

  label = computed(() => {
    const v = this.value();
    if (this.kind() === "task-status") return taskStatusLabels[v as TaskStatus] ?? v;
    if (this.kind() === "priority") return priorityLabels[v as TaskPriority] ?? v;
    return projectStatusLabels[v as ProjectStatus] ?? v;
  });

  classes = computed(() => {
    const v = this.value();
    if (this.kind() === "task-status") return taskStatusClasses[v as TaskStatus] ?? "";
    if (this.kind() === "priority") return priorityClasses[v as TaskPriority] ?? "";
    return projectStatusClasses[v as ProjectStatus] ?? "";
  });

  dot = computed(() => this.kind() === "task-status");
  dotColor = computed(() => {
    const v = this.value() as TaskStatus;
    return taskStatusDot[v] ?? "currentColor";
  });
}

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const taskStatusClasses: Record<TaskStatus, string> = {
  todo: "bg-surface-hover text-text-secondary",
  in_progress: "bg-accent-soft text-accent",
  review: "bg-warning-soft text-warning",
  done: "bg-success-soft text-success",
};

const taskStatusDot: Record<TaskStatus, string> = {
  todo: "#9ca3af",
  in_progress: "#6366f1",
  review: "#f59e0b",
  done: "#10b981",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-surface-hover text-text-secondary",
  medium: "bg-accent-soft text-accent",
  high: "bg-warning-soft text-warning",
  urgent: "bg-danger-soft text-danger",
};

const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

const projectStatusClasses: Record<ProjectStatus, string> = {
  planning: "bg-accent-soft text-accent",
  active: "bg-success-soft text-success",
  on_hold: "bg-warning-soft text-warning",
  completed: "bg-surface-hover text-text-secondary",
};
