import { Project } from "../models";

const now = new Date("2026-09-24T10:00:00Z");

function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Payment Gateway Integration",
    description: "Integrate Stripe and PayPal payment gateways with multi-currency support and automated invoicing.",
    status: "active",
    memberIds: ["u1", "u2", "u4", "u5"],
    deadline: daysFromNow(12),
    createdAt: daysFromNow(-45),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "p2",
    name: "Mobile App Redesign",
    description: "Complete overhaul of the mobile application with a focus on accessibility and performance.",
    status: "active",
    memberIds: ["u1", "u3", "u5", "u7"],
    deadline: daysFromNow(30),
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-2),
  },
  {
    id: "p3",
    name: "Analytics Dashboard",
    description: "Build a real-time analytics dashboard with custom charting and exportable reports.",
    status: "planning",
    memberIds: ["u2", "u4", "u8"],
    deadline: daysFromNow(60),
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-3),
  },
  {
    id: "p4",
    name: "API Platform v2",
    description: "Redesign the public API with GraphQL support, rate limiting, and developer documentation.",
    status: "active",
    memberIds: ["u2", "u4", "u6"],
    deadline: daysFromNow(20),
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "p5",
    name: "Onboarding Flow",
    description: "Streamline the user onboarding experience with interactive tutorials and progress tracking.",
    status: "on_hold",
    memberIds: ["u1", "u3", "u8"],
    deadline: daysFromNow(45),
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-5),
  },
  {
    id: "p6",
    name: "Security Audit",
    description: "Comprehensive security audit including penetration testing and vulnerability remediation.",
    status: "completed",
    memberIds: ["u4", "u6", "u7"],
    deadline: daysFromNow(-10),
    createdAt: daysFromNow(-90),
    updatedAt: daysFromNow(-7),
  },
  {
    id: "p7",
    name: "Marketing Website",
    description: "Launch the new marketing site with CMS integration and SEO optimization.",
    status: "planning",
    memberIds: ["u1", "u3", "u8"],
    deadline: daysFromNow(50),
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "p8",
    name: "Customer Support Portal",
    description: "Build a self-service support portal with knowledge base, ticketing, and live chat.",
    status: "active",
    memberIds: ["u2", "u5", "u7", "u8"],
    deadline: daysFromNow(15),
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-1),
  },
];
