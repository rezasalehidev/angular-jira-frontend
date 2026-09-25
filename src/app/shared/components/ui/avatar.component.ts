import { Component, input, computed } from "@angular/core";
import { getInitials } from "../../utils/format";

@Component({
  selector: "app-avatar",
  template: `
    <div
      class="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      [class]="sizeClass()"
      [style.background]="color()"
      [title]="name()"
    >
      {{ initials() }}
    </div>
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  seed = input("");
  size = input<"xs" | "sm" | "md" | "lg">("sm");

  initials = computed(() => getInitials(this.name()));
  sizeClass = computed(() => {
    const map: Record<string, string> = {
      xs: "w-5 h-5 text-2xs",
      sm: "w-7 h-7 text-xs",
      md: "w-9 h-9 text-sm",
      lg: "w-12 h-12 text-base",
    };
    return map[this.size()];
  });
  color = computed(() => {
    const palette = [
      "#6366f1", "#ec4899", "#f59e0b", "#10b981",
      "#06b6d4", "#8b5cf6", "#ef4444", "#3b82f6",
    ];
    const s = this.seed() || this.name();
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  });
}
