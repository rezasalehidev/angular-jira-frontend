import { Injectable, signal, computed, inject } from "@angular/core";
import { User } from "../models";
import { UserService } from "../services/user.service";

@Injectable({ providedIn: "root" })
export class UserStore {
  private userService = inject(UserService);

  private _users = signal<User[]>([]);
  private _loading = signal(false);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly onlineUsers = computed(() => this._users().filter((u) => u.online));

  userById(id: string) {
    return computed(() => this._users().find((u) => u.id === id) ?? null);
  }

  load() {
    this._loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this._users.set(users);
        this._loading.set(false);
      },
    });
  }
}
