import { Component, input, computed } from "@angular/core";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: "app-donut-chart",
  template: `
    <div class="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" class="shrink-0">
        <circle cx="70" cy="70" r="56" fill="none" stroke="rgb(var(--surface-active))" stroke-width="14" />
        @for (seg of segments(); track seg.label; let i = $index) {
          <circle
            cx="70" cy="70" r="56" fill="none"
            [attr.stroke]="seg.color"
            stroke-width="14"
            [attr.stroke-dasharray]="dashArray()[i]"
            [attr.stroke-dashoffset]="dashOffset(i)"
            transform="rotate(-90 70 70)"
            class="transition-all duration-500"
          />
        }
        <text x="70" y="65" text-anchor="middle" class="fill-text-primary text-lg font-bold" font-size="22">{{ total() }}</text>
        <text x="70" y="82" text-anchor="middle" class="fill-text-tertiary" font-size="10">{{ centerLabel() }}</text>
      </svg>
      <div class="space-y-2">
        @for (seg of segments(); track seg.label) {
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="seg.color"></span>
            <span class="text-sm text-text-secondary flex-1">{{ seg.label }}</span>
            <span class="text-sm font-medium text-text-primary">{{ seg.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class DonutChartComponent {
  segments = input.required<DonutSegment[]>();
  centerLabel = input<string>("Total");

  readonly circumference = 2 * Math.PI * 56;

  total = computed(() => this.segments().reduce((s, seg) => s + seg.value, 0));

  dashArray = computed(() => {
    return this.segments().map((seg) => {
      const fraction = this.total() > 0 ? seg.value / this.total() : 0;
      return `${fraction * this.circumference} ${this.circumference}`;
    });
  });

  dashOffset(i: number): number {
    let offset = 0;
    const segs = this.segments();
    const total = this.total();
    for (let j = 0; j < i; j++) {
      offset += (segs[j].value / total) * this.circumference;
    }
    return -offset;
  }
}
