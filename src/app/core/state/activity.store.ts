import { Injectable, signal, computed, inject } from "@angular/core";
import { Activity } from "../models";
import { ActivityService } from "../services/activity.service";

@Injectable({ providedIn: "root" })
export class ActivityStore {
  private activityService = inject(ActivityService);

  private _activities = signal<Activity[]>([]);
  private _loading = signal(false);

  readonly activities = this._activities.asReadonly();
  readonly loading = this._loading.asReadonly();

  activitiesForProject(projectId: string) {
    return computed(() =>
      this._activities().filter((a) => a.projectId === projectId)
    );
  }

  load() {
    this._loading.set(true);
    this.activityService.getActivities().subscribe({
      next: (activities) => {
        this._activities.set(activities);
        this._loading.set(false);
      },
    });
  }

  loadByProject(projectId: string) {
    this._loading.set(true);
    this.activityService.getActivitiesByProject(projectId).subscribe({
      next: (activities) => {
        this._activities.set(activities);
        this._loading.set(false);
      },
    });
  }
}
