import { Component, input, computed } from "@angular/core";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: "app-bar-chart",
  template: `
    <div class="flex items-end gap-2 w-full" [style.height]="height()">
      @for (item of data(); track item.label) {
        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span class="text-2xs font-medium text-text-secondary">{{ item.value }}</span>
          <div
            class="w-full rounded-md transition-all duration-500 ease-spring min-h-[2px]"
            [style.height]="barHeight(item.value)"
            [style.background]="item.color || 'rgb(var(--accent))'"
          ></div>
          <span class="text-2xs text-text-tertiary truncate">{{ item.label }}</span>
        </div>
      }
    </div>
  `,
})
export class BarChartComponent {
  data = input.required<BarItem[]>();
  height = input<string>("200px");

  maxVal = computed(() => Math.max(...this.data().map((d) => d.value), 1));

  barHeight(val: number): string {
    return `${(val / this.maxVal()) * 100}%`;
  }
}
