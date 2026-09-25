import { Component, input, output } from "@angular/core";
import { LucideAngularModule, Inbox, type LucideIconData } from "lucide-angular";

@Component({
  selector: "app-empty-state",
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div class="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
        <lucide-icon [img]="icon()" class="w-7 h-7 text-text-tertiary"></lucide-icon>
      </div>
      <h3 class="text-base font-semibold text-text-primary mb-1">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-text-secondary max-w-sm mb-4">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button class="btn-primary" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly Inbox = Inbox;
  icon = input<LucideIconData>(Inbox);
  title = input.required<string>();
  description = input<string>("");
  actionLabel = input<string>("");
  action = output<void>();
}
