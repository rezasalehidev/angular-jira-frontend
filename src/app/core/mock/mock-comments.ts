import { Comment } from "../models";

const now = new Date("2026-09-24T10:00:00Z");

function hoursAgo(h: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export const mockComments: Comment[] = [
  {
    id: "c1",
    taskId: "t1",
    authorId: "u1",
    content: "Can we prioritize the webhook signature verification? That's a security concern.",
    createdAt: hoursAgo(20),
  },
  {
    id: "c2",
    taskId: "t1",
    authorId: "u2",
    content: "Already done — see PR #142. I'll merge it today and we can test the full flow.",
    createdAt: hoursAgo(18),
  },
  {
    id: "c3",
    taskId: "t1",
    authorId: "u4",
    content: "I'll start on the PayPal integration once the Stripe flow is merged.",
    createdAt: hoursAgo(5),
  },
  {
    id: "c4",
    taskId: "t3",
    authorId: "u5",
    content: "The currency conversion API is ready for review. I've added tests for edge cases.",
    createdAt: hoursAgo(12),
  },
  {
    id: "c5",
    taskId: "t3",
    authorId: "u1",
    content: "Looks good! Just a minor comment on the rounding logic for JPY.",
    createdAt: hoursAgo(8),
  },
  {
    id: "c6",
    taskId: "t9",
    authorId: "u3",
    content: "The dark mode color tokens are ready. Let me know if the contrast ratios need adjusting.",
    createdAt: hoursAgo(15),
  },
  {
    id: "c7",
    taskId: "t10",
    authorId: "u7",
    content: "Found 3 accessibility issues during the audit. I've documented them in the task description.",
    createdAt: hoursAgo(6),
  },
  {
    id: "c8",
    taskId: "t16",
    authorId: "u2",
    content: "The schema is almost ready. I need to finalize the mutation types for subscriptions.",
    createdAt: hoursAgo(3),
  },
  {
    id: "c9",
    taskId: "t17",
    authorId: "u4",
    content: "Rate limiting is implemented. Currently testing with 1000 RPS to verify the token bucket.",
    createdAt: hoursAgo(10),
  },
  {
    id: "c10",
    taskId: "t28",
    authorId: "u4",
    content: "The SLA tracking logic needs a review. I'm not sure about the escalation rules.",
    createdAt: hoursAgo(4),
  },
];
