import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { User } from "../models";
import { mockUsers } from "../mock/mock-users";

@Injectable({ providedIn: "root" })
export class UserService {
  private users: User[] = [...mockUsers];

  getUsers(): Observable<User[]> {
    return of([...this.users]).pipe(delay(300));
  }

  getUser(id: string): Observable<User | undefined> {
    return of(this.users.find((u) => u.id === id)).pipe(delay(150));
  }
}
