import { prisma } from "@/lib/prisma";

export const tools = {
  getProjects: {
    description: "Fetch all professional projects from the portfolio",
    execute: async () => {
      return await prisma.project.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      });
    },
  },
  getSkills: {
    description: "List technical skills and expertise levels",
    execute: async () => {
      return await prisma.skill.findMany({
        orderBy: { order: "asc" },
      });
    },
  },
  getExperiences: {
    description: "Retrieve professional work experience and history",
    execute: async () => {
      return await prisma.experience.findMany({
        orderBy: { order: "asc" },
      });
    },
  },
  getRecentMessages: {
    description: "Get recent contact form messages (Admin only)",
    execute: async () => {
      return await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    },
  },
  getSiteStats: {
    description: "Get summary statistics of the portfolio (Admin only)",
    execute: async () => {
      const projectsCount = await prisma.project.count();
      const skillsCount = await prisma.skill.count();
      const messagesCount = await prisma.contactMessage.count();
      const lastMessage = await prisma.contactMessage.findFirst({
        orderBy: { createdAt: "desc" },
      });

      return {
        totalProjects: projectsCount,
        totalSkills: skillsCount,
        totalMessages: messagesCount,
        lastMessageDate: lastMessage?.createdAt,
      };
    },
  },
};

export type ToolName = keyof typeof tools;
