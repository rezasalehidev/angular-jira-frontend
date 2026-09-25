import { Component, computed, inject, signal, ElementRef, ViewChild, AfterViewChecked, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";
import { Send, Bot, User as UserIcon, Sparkles, Wrench, CheckCircle2, Loader2, ChevronDown } from "lucide-angular";
import { TaskStore } from "../../core/state/task.store";
import { ProjectStore } from "../../core/state/project.store";
import { UserStore } from "../../core/state/user.store";
import { isOverdue, formatDateShort } from "../../shared/utils/format";
import { Task, Project } from "../../core/models";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  streaming?: boolean;
}

interface ToolCall {
  name: string;
  label: string;
  status: "pending" | "running" | "done";
}

interface SuggestedPrompt {
  text: string;
  icon: typeof Sparkles;
}

@Component({
  selector: "app-ai-assistant",
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex h-[calc(100vh-3.5rem)]">
      <!-- Conversation panel -->
      <div class="flex-1 flex flex-col min-w-0 border-r border-border">
        <!-- Header -->
        <div class="px-5 py-3 border-b border-border flex items-center gap-2 shrink-0">
          <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <lucide-icon [img]="Bot" class="w-5 h-5 text-white"></lucide-icon>
          </div>
          <div>
            <h1 class="text-sm font-semibold text-text-primary">AI Assistant</h1>
            <p class="text-2xs text-text-tertiary">Powered by TaskForge AI</p>
          </div>
        </div>

        <!-- Messages -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-5 space-y-4">
          @if (messages().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center py-12">
              <div class="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
                <lucide-icon [img]="Sparkles" class="w-7 h-7 text-accent"></lucide-icon>
              </div>
              <h2 class="text-lg font-semibold text-text-primary mb-2">Ask me anything about your projects</h2>
              <p class="text-sm text-text-secondary max-w-md mb-6">I can analyze your tasks, identify blockers, check team workload, and help you stay on track.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                @for (prompt of suggestedPrompts; track prompt.text) {
                  <button
                    class="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-surface-hover hover:border-border-strong hover:bg-surface-active transition-all text-left group"
                    (click)="sendPrompt(prompt.text)"
                  >
                    <lucide-icon [img]="prompt.icon" class="w-4 h-4 text-accent shrink-0 mt-0.5"></lucide-icon>
                    <span class="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{{ prompt.text }}</span>
                  </button>
                }
              </div>
            </div>
          } @else {
            @for (message of messages(); track message.id) {
              <div class="flex gap-3" [class.flex-row-reverse]="message.role === 'user'">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  [class.bg-accent]="message.role === 'assistant'"
                  [class.bg-brand-500]="message.role === 'user'"
                >
                  <lucide-icon
                    [img]="message.role === 'assistant' ? Bot : UserIcon"
                    class="w-5 h-5 text-white"
                  ></lucide-icon>
                </div>

                <div class="flex-1 min-w-0 max-w-2xl" [class.items-end]="message.role === 'user'" [class.flex]="message.role === 'user'" [class.flex-col]="message.role === 'user'">
                  <!-- Tool calls -->
                  @if (message.toolCalls && message.toolCalls.length > 0) {
                    <div class="mb-2 p-3 rounded-lg bg-surface-hover border border-border space-y-1.5">
                      <div class="text-2xs font-medium text-text-tertiary uppercase tracking-wide flex items-center gap-1.5 mb-1">
                        <lucide-icon [img]="Wrench" class="w-3 h-3"></lucide-icon>
                        Tool Execution
                      </div>
                      @for (tool of message.toolCalls; track tool.name) {
                        <div class="flex items-center gap-2 text-xs">
                          @if (tool.status === "done") {
                            <lucide-icon [img]="CheckCircle2" class="w-3.5 h-3.5 text-success"></lucide-icon>
                          } @else if (tool.status === "running") {
                            <div class="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                          } @else {
                            <div class="w-3.5 h-3.5 rounded-full border-2 border-border"></div>
                          }
                          <span [class.text-text-primary]="tool.status === 'done'" [class.text-text-tertiary]="tool.status !== 'done'">{{ tool.label }}</span>
                          <span class="text-2xs text-text-tertiary font-mono">{{ tool.name }}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Message bubble -->
                  <div
                    class="inline-block px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap"
                    [class.bg-accent]="message.role === 'assistant'"
                    [class.text-white]="message.role === 'assistant'"
                    [class.bg-surface-hover]="message.role === 'user'"
                    [class.text-text-primary]="message.role === 'user'"
                  >{{ message.content }}@if (message.streaming) {<span class="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse align-middle"></span>}</div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-border shrink-0">
          <div class="flex items-end gap-2">
            <textarea
              #messageInput
              class="input flex-1 resize-none min-h-10 max-h-32"
              placeholder="Ask AI about your projects, tasks, or team..."
              [(ngModel)]="inputText"
              (keydown.enter)="onEnter($event)"
              [disabled]="isProcessing()"
            ></textarea>
            <button
              class="btn-primary p-2.5 shrink-0"
              (click)="sendPrompt(inputText)"
              [disabled]="!inputText.trim() || isProcessing()"
            >
              @if (isProcessing()) {
                <lucide-icon [img]="Loader2" class="w-4 h-4 animate-spin"></lucide-icon>
              } @else {
                <lucide-icon [img]="Send" class="w-4 h-4"></lucide-icon>
              }
            </button>
          </div>
          <p class="text-2xs text-text-tertiary mt-2 text-center">AI responses are simulated for demonstration. No real AI is used.</p>
        </div>
      </div>

      <!-- Project context panel -->
      <div class="w-80 shrink-0 hidden lg:flex flex-col bg-surface-hover/30 overflow-y-auto">
        <div class="p-4 border-b border-border">
          <h3 class="text-sm font-semibold text-text-primary mb-3">Project Context</h3>
          <select class="input text-sm" [ngModel]="selectedProjectId()" (ngModelChange)="selectedProjectId.set($event)">
            @for (project of projectStore.projects(); track project.id) {
              <option [value]="project.id">{{ project.name }}</option>
            }
          </select>
        </div>

        @if (selectedProject()) {
          <div class="p-4 space-y-4">
            <!-- Progress -->
            <div class="card p-4">
              <div class="text-xs text-text-tertiary mb-2">Progress</div>
              <div class="text-2xl font-bold text-text-primary mb-2">{{ projectProgress() }}%</div>
              <div class="w-full bg-surface-active rounded-full h-1.5 overflow-hidden">
                <div class="h-full bg-accent rounded-full transition-all duration-500" [style.width.%]="projectProgress()"></div>
              </div>
              <div class="text-2xs text-text-tertiary mt-2">{{ completedCount() }} of {{ projectTaskCount() }} tasks completed</div>
            </div>

            <!-- Stats -->
            <div class="card p-4">
              <h4 class="text-xs font-semibold text-text-primary mb-3">Quick Stats</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-text-secondary">Total Tasks</span>
                  <span class="text-sm font-semibold text-text-primary">{{ projectTaskCount() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-text-secondary">Overdue</span>
                  <span class="text-sm font-semibold" [class.text-danger]="overdueCount() > 0" [class.text-text-primary]="overdueCount() === 0">{{ overdueCount() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-text-secondary">Blockers</span>
                  <span class="text-sm font-semibold" [class.text-warning]="blockerCount() > 0" [class.text-text-primary]="blockerCount() === 0">{{ blockerCount() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-text-secondary">Deadline</span>
                  <span class="text-sm font-semibold text-text-primary">{{ formatDateShort(selectedProject()!.deadline) }}</span>
                </div>
              </div>
            </div>

            <!-- Overdue tasks -->
            @if (projectOverdueTasks().length > 0) {
              <div class="card p-4">
                <h4 class="text-xs font-semibold text-text-primary mb-3">Overdue Tasks</h4>
                <div class="space-y-2">
                  @for (task of projectOverdueTasks().slice(0, 5); track task.id) {
                    <div class="flex items-start gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0"></span>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-text-primary truncate">{{ task.title }}</div>
                        <div class="text-2xs text-text-tertiary">{{ formatDateShort(task.dueDate) }} · {{ task.priority }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Team members -->
            <div class="card p-4">
              <h4 class="text-xs font-semibold text-text-primary mb-3">Assigned Team</h4>
              <div class="space-y-2">
                @for (task of projectTasks().slice(0, 5); track task.id) {
                  @if (task.assigneeId) {
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xs font-medium">
                        {{ getInitials(getUser(task.assigneeId)?.name ?? '?') }}
                      </div>
                      <span class="text-xs text-text-secondary truncate">{{ getUser(task.assigneeId)?.name }}</span>
                      <span class="text-2xs text-text-tertiary ml-auto">{{ task.priority }}</span>
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AiAssistantComponent implements AfterViewChecked {
  readonly Send = Send;
  readonly Bot = Bot;
  readonly UserIcon = UserIcon;
  readonly Sparkles = Sparkles;
  readonly Wrench = Wrench;
  readonly CheckCircle2 = CheckCircle2;
  readonly Loader2 = Loader2;
  readonly ChevronDown = ChevronDown;

  taskStore = inject(TaskStore);
  projectStore = inject(ProjectStore);
  userStore = inject(UserStore);

  @ViewChild("scrollContainer") scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild("messageInput") messageInput?: ElementRef<HTMLTextAreaElement>;

  inputText = "";
  isProcessing = signal(false);
  selectedProjectId = signal(this.projectStore.projects()[0]?.id ?? "");

  messages = signal<ChatMessage[]>([]);

  suggestedPrompts: SuggestedPrompt[] = [
    { text: "Why is this project behind schedule?", icon: Sparkles },
    { text: "Which tasks are overdue?", icon: Sparkles },
    { text: "What's the team workload like?", icon: Sparkles },
    { text: "Summarize the project status", icon: Sparkles },
  ];

  formatDateShort = formatDateShort;

  selectedProject = computed<Project | undefined>(() =>
    this.projectStore.projects().find((p) => p.id === this.selectedProjectId())
  );

  projectTasks = computed(() =>
    this.taskStore.tasks().filter((t) => t.projectId === this.selectedProjectId())
  );

  projectTaskCount = computed(() => this.projectTasks().length);
  completedCount = computed(() => this.projectTasks().filter((t) => t.status === "done").length);
  overdueCount = computed(() => this.projectTasks().filter((t) => isOverdue(t.dueDate) && t.status !== "done").length);
  blockerCount = computed(() => this.projectTasks().filter((t) => t.priority === "urgent" && t.status !== "done").length);

  projectProgress = computed(() => {
    const total = this.projectTaskCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  projectOverdueTasks = computed(() =>
    this.projectTasks().filter((t) => isOverdue(t.dueDate) && t.status !== "done")
  );

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  getUser(id: string) {
    return this.userStore.users().find((u) => u.id === id) ?? null;
  }

  getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  }

  onEnter(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    ke.preventDefault();
    if (this.inputText.trim() && !this.isProcessing()) {
      this.sendPrompt(this.inputText);
    }
  }

  sendPrompt(text: string) {
    const prompt = text.trim();
    if (!prompt || this.isProcessing()) return;

    this.inputText = "";
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content: prompt,
    };
    this.messages.update((m) => [...m, userMsg]);

    this.isProcessing.set(true);

    // Determine which tools to call based on the prompt
    const tools = this.determineTools(prompt);
    const assistantId = `a${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      toolCalls: tools.map((t) => ({ ...t, status: "pending" as const })),
      streaming: true,
    };
    this.messages.update((m) => [...m, assistantMsg]);

    // Simulate tool execution
    this.simulateToolCalls(assistantId, tools, () => {
      // Generate response
      const response = this.generateResponse(prompt, tools);
      this.streamResponse(assistantId, response);
    });
  }

  private determineTools(prompt: string): { name: string; label: string }[] {
    const lower = prompt.toLowerCase();
    const tools: { name: string; label: string }[] = [];

    if (lower.includes("overdue") || lower.includes("late") || lower.includes("behind") || lower.includes("delay")) {
      tools.push({ name: "getOverdueTasks()", label: "Checking overdue tasks" });
    }
    if (lower.includes("workload") || lower.includes("team") || lower.includes("busy") || lower.includes("capacity")) {
      tools.push({ name: "getTeamWorkload()", label: "Analyzing team workload" });
    }
    if (lower.includes("status") || lower.includes("progress") || lower.includes("summary") || lower.includes("project")) {
      tools.push({ name: "getProjectStats()", label: "Fetching project statistics" });
    }
    if (lower.includes("task") || lower.includes("block") || lower.includes("priority")) {
      tools.push({ name: "getProjectTasks()", label: "Searching project tasks" });
    }
    if (lower.includes("depend") || lower.includes("blocker")) {
      tools.push({ name: "analyzeDependencies()", label: "Analyzing dependencies" });
    }

    if (tools.length === 0) {
      tools.push(
        { name: "getProjectStats()", label: "Fetching project statistics" },
        { name: "getProjectTasks()", label: "Searching project tasks" },
      );
    }

    return tools;
  }

  private simulateToolCalls(assistantId: string, tools: { name: string; label: string }[], onComplete: () => void) {
    let delay = 400;
    tools.forEach((tool, idx) => {
      // Mark as running
      setTimeout(() => {
        this.messages.update((msgs) =>
          msgs.map((m) =>
            m.id === assistantId && m.toolCalls
              ? { ...m, toolCalls: m.toolCalls.map((tc, i) => i === idx ? { ...tc, status: "running" } : tc) }
              : m
          )
        );
      }, delay);

      // Mark as done
      setTimeout(() => {
        this.messages.update((msgs) =>
          msgs.map((m) =>
            m.id === assistantId && m.toolCalls
              ? { ...m, toolCalls: m.toolCalls.map((tc, i) => i === idx ? { ...tc, status: "done" } : tc) }
              : m
          )
        );
      }, delay + 300);

      delay += 600;
    });

    setTimeout(onComplete, delay + 200);
  }

  private generateResponse(prompt: string, tools: { name: string; label: string }[]): string {
    const lower = prompt.toLowerCase();
    const project = this.selectedProject();
    const tasks = this.projectTasks();
    const overdue = this.projectOverdueTasks();
    const blockers = tasks.filter((t) => t.priority === "urgent" && t.status !== "done");

    if (lower.includes("behind") || lower.includes("late") || lower.includes("delay") || lower.includes("overdue")) {
      if (overdue.length === 0) {
        return `Good news! "${project?.name ?? 'This project'}" is on track with no overdue tasks. ${this.completedCount()} of ${tasks.length} tasks are completed (${this.projectProgress()}% progress).`;
      }
      let response = `I found ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} in "${project?.name ?? 'this project'}".\n\n`;
      if (overdue.length <= 3) {
        overdue.forEach((t) => {
          response += `• "${t.title}" — Due: ${formatDateShort(t.dueDate)}, Priority: ${t.priority}\n`;
        });
      } else {
        overdue.slice(0, 3).forEach((t) => {
          response += `• "${t.title}" — Due: ${formatDateShort(t.dueDate)}, Priority: ${t.priority}\n`;
        });
        response += `• ...and ${overdue.length - 3} more\n`;
      }
      if (blockers.length > 0) {
        response += `\nThe highest priority blocker is:\n\n"${blockers[0].title}"\nDue: ${formatDateShort(blockers[0].dueDate)}\nPriority: ${blockers[0].priority}`;
      }
      return response;
    }

    if (lower.includes("workload") || lower.includes("team") || lower.includes("busy") || lower.includes("capacity")) {
      const userTasks = this.userStore.users().map((u) => {
        const active = tasks.filter((t) => t.assigneeId === u.id && t.status !== "done").length;
        return { name: u.name, active };
      }).filter((u) => u.active > 0).sort((a, b) => b.active - a.active);

      if (userTasks.length === 0) {
        return `No team members are currently assigned to tasks in "${project?.name ?? 'this project'}".`;
      }

      let response = `Here's the current team workload for "${project?.name ?? 'this project'}":\n\n`;
      userTasks.forEach((u) => {
        const level = u.active <= 2 ? "Low" : u.active <= 4 ? "Medium" : "High";
        response += `• ${u.name}: ${u.active} active task${u.active > 1 ? 's' : ''} (${level})\n`;
      });
      const maxUser = userTasks[0];
      response += `\n${maxUser.name} has the highest workload with ${maxUser.active} active tasks. Consider redistributing if needed.`;
      return response;
    }

    if (lower.includes("summary") || lower.includes("status") || lower.includes("progress")) {
      return `Project Summary: "${project?.name ?? 'Unknown'}"\n\nProgress: ${this.projectProgress()}% (${this.completedCount()}/${tasks.length} tasks completed)\nOverdue: ${overdue.length} task${overdue.length !== 1 ? 's' : ''}\nBlockers: ${blockers.length} urgent task${blockers.length !== 1 ? 's' : ''} remaining\nDeadline: ${formatDateShort(project?.deadline ?? null)}\n\nThe project is ${this.projectProgress() > 70 ? 'in good shape and nearing completion' : this.projectProgress() > 40 ? 'making steady progress' : 'in early stages'}. ${overdue.length > 0 ? 'Consider addressing the overdue tasks to maintain momentum.' : 'No overdue tasks — keep up the good work!'}`;
    }

    if (lower.includes("block") || lower.includes("priority") || lower.includes("urgent")) {
      if (blockers.length === 0) {
        return `No urgent blockers found in "${project?.name ?? 'this project'}". All high-priority tasks have been completed.`;
      }
      let response = `Found ${blockers.length} urgent task${blockers.length > 1 ? 's' : ''} that need attention:\n\n`;
      blockers.forEach((t) => {
        response += `• "${t.title}"\n  Status: ${t.status}, Due: ${formatDateShort(t.dueDate)}\n`;
      });
      return response;
    }

    // Default response
    return `I've analyzed "${project?.name ?? 'this project'}" and found ${tasks.length} total tasks. ${this.completedCount()} are completed (${this.projectProgress()}%), ${overdue.length} are overdue, and ${blockers.length} are urgent. Feel free to ask me about specific tasks, team workload, or overdue items.`;
  }

  private streamResponse(assistantId: string, response: string) {
    const words = response.split(" ");
    let index = 0;

    const stream = () => {
      if (index >= words.length) {
        this.messages.update((msgs) =>
          msgs.map((m) => m.id === assistantId ? { ...m, streaming: false } : m)
        );
        this.isProcessing.set(false);
        return;
      }

      const chunk = words.slice(index, index + 3).join(" ");
      index += 3;

      this.messages.update((msgs) =>
        msgs.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content + (index > 3 ? " " : "") + chunk }
            : m
        )
      );

      setTimeout(stream, 40);
    };

    stream();
  }
}
