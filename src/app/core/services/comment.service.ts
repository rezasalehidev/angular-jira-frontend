import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { Comment } from "../models";
import { mockComments } from "../mock/mock-comments";

@Injectable({ providedIn: "root" })
export class CommentService {
  private comments: Comment[] = [...mockComments];

  getComments(taskId: string): Observable<Comment[]> {
    return of(this.comments.filter((c) => c.taskId === taskId)).pipe(delay(300));
  }

  addComment(taskId: string, authorId: string, content: string): Observable<Comment> {
    const comment: Comment = {
      id: `c${Date.now()}`,
      taskId,
      authorId,
      content,
      createdAt: new Date().toISOString(),
    };
    this.comments = [...this.comments, comment];
    return of(comment).pipe(delay(400));
  }

  deleteComment(id: string): Observable<void> {
    this.comments = this.comments.filter((c) => c.id !== id);
    return of(void 0).pipe(delay(200));
  }
}
