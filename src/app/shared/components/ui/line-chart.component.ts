import { Component, input, computed } from "@angular/core";

interface LinePoint {
  label: string;
  value: number;
}

@Component({
  selector: "app-line-chart",
  template: `
    <div class="w-full" [style.height]="height()">
      <svg [attr.viewBox]="viewBox()" class="w-full h-full" preserveAspectRatio="none">
        <!-- Grid lines -->
        @for (i of [0, 1, 2, 3, 4]; track i) {
          <line
            [attr.x1]="0" [attr.x2]="width"
            [attr.y1]="i * (chartHeight / 4)"
            [attr.y2]="i * (chartHeight / 4)"
            stroke="rgb(var(--border))" stroke-width="0.5"
          />
        }
        <!-- Area fill -->
        <path [attr.d]="areaPath()" fill="rgb(var(--accent) / 0.1)" />
        <!-- Line -->
        <path [attr.d]="linePath()" fill="none" stroke="rgb(var(--accent))" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Dots -->
        @for (p of points(); track p.label; let i = $index) {
          <circle [attr.cx]="x(i)" [attr.cy]="y(p.value)" r="2.5" fill="rgb(var(--accent))" />
        }
      </svg>
      <div class="flex justify-between mt-2">
        @for (p of points(); track p.label) {
          <span class="text-2xs text-text-tertiary">{{ p.label }}</span>
        }
      </div>
    </div>
  `,
})
export class LineChartComponent {
  points = input.required<LinePoint[]>();
  height = input<string>("200px");

  readonly width = 300;
  readonly chartHeight = 180;

  viewBox = computed(() => `0 0 ${this.width} ${this.chartHeight}`);

  maxVal = computed(() => {
    const max = Math.max(...this.points().map((p) => p.value), 1);
    return max * 1.1;
  });

  x(i: number): number {
    const n = this.points().length;
    if (n <= 1) return 0;
    return (i / (n - 1)) * this.width;
  }

  y(val: number): number {
    return this.chartHeight - (val / this.maxVal()) * this.chartHeight;
  }

  linePath = computed(() => {
    const pts = this.points();
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${this.x(i)} ${this.y(p.value)}`).join(" ");
  });

  areaPath = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return "";
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${this.x(i)} ${this.y(p.value)}`).join(" ");
    return `${line} L ${this.width} ${this.chartHeight} L 0 ${this.chartHeight} Z`;
  });
}
