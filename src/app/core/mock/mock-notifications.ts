import { AppNotification } from "../models";

const now = new Date("2026-09-24T10:00:00Z");

function hoursAgo(h: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "task_assigned",
    title: "Task assigned to you",
    message: "Sarah Chen assigned you to 'Implement Stripe payment gateway'",
    read: false,
    projectId: "p1",
    taskId: "t1",
    createdAt: hoursAgo(2),
  },
  {
    id: "n2",
    type: "comment",
    title: "New comment",
    message: "Marcus Reid commented on 'Multi-currency support'",
    read: false,
    projectId: "p1",
    taskId: "t3",
    createdAt: hoursAgo(5),
  },
  {
    id: "n3",
    type: "deadline",
    title: "Deadline approaching",
    message: "'GraphQL schema design' is due in 1 day",
    read: false,
    projectId: "p4",
    taskId: "t16",
    createdAt: hoursAgo(8),
  },
  {
    id: "n4",
    type: "mention",
    title: "You were mentioned",
    message: "Elena Vasquez mentioned you in 'Design new navigation system'",
    read: false,
    projectId: "p2",
    taskId: "t8",
    createdAt: hoursAgo(12),
  },
  {
    id: "n5",
    type: "project_update",
    title: "Project updated",
    message: "API Platform v2 status changed to Active",
    read: true,
    projectId: "p4",
    createdAt: daysAgo(1),
  },
  {
    id: "n6",
    type: "task_assigned",
    title: "Task assigned to you",
    message: "David Kim assigned you to 'Knowledge base search'",
    read: true,
    projectId: "p8",
    taskId: "t27",
    createdAt: daysAgo(1),
  },
  {
    id: "n7",
    type: "deadline",
    title: "Deadline approaching",
    message: "'Accessibility audit' is due in 2 days",
    read: true,
    projectId: "p2",
    taskId: "t10",
    createdAt: daysAgo(2),
  },
  {
    id: "n8",
    type: "comment",
    title: "New comment",
    message: "Priya Sharma commented on 'Build chart component library'",
    read: true,
    projectId: "p3",
    taskId: "t14",
    createdAt: daysAgo(2),
  },
  {
    id: "n9",
    type: "project_update",
    title: "Project updated",
    message: "Security Audit has been marked as Completed",
    read: true,
    projectId: "p6",
    createdAt: daysAgo(3),
  },
  {
    id: "n10",
    type: "mention",
    title: "You were mentioned",
    message: "Tom Brucker mentioned you in 'Define chart requirements'",
    read: true,
    projectId: "p3",
    taskId: "t13",
    createdAt: daysAgo(4),
  },
];
