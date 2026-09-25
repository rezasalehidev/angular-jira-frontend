import { Activity } from "../models";

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

export const mockActivities: Activity[] = [
  {
    id: "a1",
    type: "status_changed",
    projectId: "p1",
    actorId: "u2",
    description: "moved 'Webhook signature verification' to Done",
    taskId: "t7",
    createdAt: hoursAgo(3),
  },
  {
    id: "a2",
    type: "task_created",
    projectId: "p8",
    actorId: "u8",
    description: "created 'Support agent dashboard'",
    taskId: "t30",
    createdAt: hoursAgo(5),
  },
  {
    id: "a3",
    type: "comment_added",
    projectId: "p1",
    actorId: "u4",
    description: "commented on 'Implement Stripe payment gateway'",
    taskId: "t1",
    createdAt: hoursAgo(6),
  },
  {
    id: "a4",
    type: "task_assigned",
    projectId: "p4",
    actorId: "u1",
    description: "assigned 'GraphQL schema design' to Marcus Reid",
    taskId: "t16",
    createdAt: hoursAgo(10),
  },
  {
    id: "a5",
    type: "task_completed",
    projectId: "p2",
    actorId: "u3",
    description: "completed 'Design new navigation system'",
    taskId: "t8",
    createdAt: hoursAgo(15),
  },
  {
    id: "a6",
    type: "project_updated",
    projectId: "p4",
    actorId: "u8",
    description: "updated the deadline for API Platform v2",
    createdAt: daysAgo(1),
  },
  {
    id: "a7",
    type: "task_created",
    projectId: "p3",
    actorId: "u2",
    description: "created 'Build chart component library'",
    taskId: "t14",
    createdAt: daysAgo(1),
  },
  {
    id: "a8",
    type: "status_changed",
    projectId: "p4",
    actorId: "u4",
    description: "moved 'Rate limiting middleware' to Review",
    taskId: "t17",
    createdAt: daysAgo(2),
  },
  {
    id: "a9",
    type: "task_completed",
    projectId: "p6",
    actorId: "u6",
    description: "completed 'Security headers configuration'",
    taskId: "t24",
    createdAt: daysAgo(3),
  },
  {
    id: "a10",
    type: "project_created",
    projectId: "p7",
    actorId: "u1",
    description: "created project 'Marketing Website'",
    createdAt: daysAgo(4),
  },
  {
    id: "a11",
    type: "task_assigned",
    projectId: "p2",
    actorId: "u1",
    description: "assigned 'Accessibility audit' to Aisha Patel",
    taskId: "t10",
    createdAt: daysAgo(5),
  },
  {
    id: "a12",
    type: "comment_added",
    projectId: "p8",
    actorId: "u4",
    description: "commented on 'Ticketing system backend'",
    taskId: "t28",
    createdAt: daysAgo(5),
  },
];
