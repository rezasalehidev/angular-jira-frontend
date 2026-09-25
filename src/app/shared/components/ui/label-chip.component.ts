import { Component, input } from "@angular/core";
import { Label } from "../../../core/models";

@Component({
  selector: "app-label-chip",
  template: `
    <span
      class="badge"
      [style.background]="label().color + '1a'"
      [style.color]="label().color"
      [style.border]="'1px solid ' + label().color + '33'"
    >
      {{ label().name }}
    </span>
  `,
})
export class LabelChipComponent {
  label = input.required<Label>();
}
