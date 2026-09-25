import { Injectable, signal, computed, inject } from "@angular/core";
import { Comment } from "../models";
import { CommentService } from "../services/comment.service";

@Injectable({ providedIn: "root" })
export class CommentStore {
  private commentService = inject(CommentService);

  private _comments = signal<Comment[]>([]);

  readonly comments = this._comments.asReadonly();

  commentsForTask(taskId: string) {
    return computed(() => this._comments().filter((c) => c.taskId === taskId));
  }

  loadForTask(taskId: string) {
    this.commentService.getComments(taskId).subscribe({
      next: (comments) => this._comments.set(comments),
    });
  }

  addComment(taskId: string, authorId: string, content: string) {
    this.commentService.addComment(taskId, authorId, content).subscribe({
      next: (comment) => {
        this._comments.update((comments) => [...comments, comment]);
      },
    });
  }

  deleteComment(id: string) {
    this._comments.update((comments) => comments.filter((c) => c.id !== id));
    this.commentService.deleteComment(id).subscribe();
  }
}
