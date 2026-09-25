import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { Activity } from "../models";
import { mockActivities } from "../mock/mock-activities";

@Injectable({ providedIn: "root" })
export class ActivityService {
  private activities: Activity[] = [...mockActivities];

  getActivities(): Observable<Activity[]> {
    return of([...this.activities]).pipe(delay(400));
  }

  getActivitiesByProject(projectId: string): Observable<Activity[]> {
    return of(this.activities.filter((a) => a.projectId === projectId)).pipe(delay(300));
  }
}
