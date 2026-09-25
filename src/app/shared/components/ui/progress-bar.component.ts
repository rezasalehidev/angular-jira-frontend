import { Component, input, computed } from "@angular/core";

@Component({
  selector: "app-progress-bar",
  template: `
    <div class="w-full h-2 bg-surface-active rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-spring"
        [style.width]="clamped() + '%'"
        [style.background]="color()"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent {
  value = input<number>(0);
  color = input<string>("rgb(var(--accent))");

  clamped = computed(() => Math.max(0, Math.min(100, this.value())));
}
