import { Component, input } from "@angular/core";

@Component({
  selector: "app-skeleton",
  template: `
    <div
      class="skeleton"
      [class]="classes()"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
})
export class SkeletonComponent {
  width = input<string>("100%");
  height = input<string>("1rem");
  rounded = input<"sm" | "md" | "lg" | "full">("md");

  classes() {
    const map: Record<string, string> = {
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };
    return map[this.rounded()];
  }
}
