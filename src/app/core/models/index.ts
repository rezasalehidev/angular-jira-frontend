export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  online: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  labels: string[];
  projectId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  labels: string[];
  projectId: string;
  dueDate: string | null;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  memberIds: string[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status: ProjectStatus;
  memberIds: string[];
  deadline: string | null;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

export type ActivityType =
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_assigned"
  | "project_created"
  | "project_updated"
  | "comment_added"
  | "status_changed";

export interface Activity {
  id: string;
  type: ActivityType;
  projectId: string;
  actorId: string;
  description: string;
  taskId?: string;
  createdAt: string;
}

export type NotificationType =
  | "task_assigned"
  | "comment"
  | "mention"
  | "deadline"
  | "project_update";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  projectId?: string;
  taskId?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  logo: string;
  plan: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  theme: ThemeMode;
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminders: boolean;
  weeklyDigest: boolean;
  compactView: boolean;
  language: string;
}
