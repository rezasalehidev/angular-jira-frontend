import { Injectable, signal } from "@angular/core";
import { Workspace } from "../models";
import { mockWorkspaces } from "../mock/mock-workspaces";

@Injectable({ providedIn: "root" })
export class WorkspaceStore {
  private _workspaces = signal<Workspace[]>(mockWorkspaces);
  private _currentWorkspaceId = signal(mockWorkspaces[0].id);

  readonly workspaces = this._workspaces.asReadonly();
  readonly currentWorkspaceId = this._currentWorkspaceId.asReadonly();
  readonly currentWorkspace = signal<Workspace | null>(mockWorkspaces[0]);

  setWorkspace(id: string) {
    this._currentWorkspaceId.set(id);
    const ws = this._workspaces().find((w) => w.id === id) ?? null;
    this.currentWorkspace.set(ws);
  }
}
