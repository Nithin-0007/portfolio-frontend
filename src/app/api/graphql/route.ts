import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pageInfo(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit) || 1;
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

function pagination(args: any) {
  const page = Math.max(1, parseInt(args.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(args.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function sortOrder(args: any, defaultField = "order") {
  const field = args.sortBy || defaultField;
  const dir = args.sortOrder === "desc" ? "desc" : "asc";
  return { [field]: dir };
}

// MongoDB case-insensitive regex search
function iSearch(value: string) {
  return { $regex: value, $options: "i" };
}

function sanitize(input: any, allowedFields: string[]): any {
  const result: any = {};
  for (const key of allowedFields) {
    if (input[key] !== undefined && input[key] !== null) {
      result[key] = input[key];
    }
  }
  return result;
}

// Extract root field name from a GraphQL query string
// e.g. "query GetProjects(...) { getProjects(...) {" → "getProjects"
function extractFieldName(query: string): string | null {
  const match =
    query.match(/(?:query|mutation)\s+\w*\s*(?:\([^)]*\))?\s*\{[\s\n]*(\w+)/i) ||
    query.match(/\{[\s\n]*(\w+)/);
  return match ? match[1] : null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function getPortfolio(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      heroContent: true,
      aboutContent: true,
      projects: { where: { published: true }, orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
      events: { orderBy: { date: "asc" } },
      siteSettings: true,
    },
  });
  if (!user) return null;
  return {
    user,
    hero: user.heroContent[0] || null,
    about: user.aboutContent[0] || null,
    projects: user.projects,
    skills: user.skills,
    experiences: user.experiences,
    achievements: user.achievements,
    events: user.events,
    siteSettings: user.siteSettings[0] || null,
  };
}

async function getProjects(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (!args.admin) where.published = true;
  if (args.category) where.category = args.category;
  if (args.featured != null) where.featured = args.featured;
  if (args.published != null && args.admin) where.published = args.published;
  if (args.search) {
    where.OR = [
      { title: iSearch(args.search) },
      { description: iSearch(args.search) },
      { category: iSearch(args.search) },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.project.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.project.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getSkills(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.category) where.category = args.category;
  if (args.search) {
    where.OR = [
      { label: iSearch(args.search) },
      { category: iSearch(args.search) },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.skill.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.skill.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getExperiences(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.type) where.type = args.type;
  if (args.search) {
    where.OR = [
      { role: iSearch(args.search) },
      { company: iSearch(args.search) },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.experience.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.experience.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getAchievements(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.search) where.title = iSearch(args.search);

  const [items, total] = await Promise.all([
    prisma.achievement.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.achievement.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getEvents(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.type) where.type = args.type;
  if (args.status) where.status = args.status;
  if (args.featured != null) where.featured = args.featured;
  if (args.search) {
    where.OR = [
      { title: iSearch(args.search) },
      { description: iSearch(args.search) },
      { location: iSearch(args.search) },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.event.findMany({ where, orderBy: sortOrder(args, "date"), skip, take: limit }),
    prisma.event.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getMessages(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.read != null) where.read = args.read;
  if (args.search) {
    where.OR = [
      { name: iSearch(args.search) },
      { email: iSearch(args.search) },
      { subject: iSearch(args.search) },
      { message: iSearch(args.search) },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: sortOrder(args, "createdAt"), skip, take: limit }),
    prisma.contactMessage.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getNotifications(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { OR: [{ userId: user.id }, { broadcast: true }] };
  if (args.read != null) where.read = args.read;
  if (args.type) where.type = args.type;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: sortOrder(args, "createdAt"), skip, take: limit }),
    prisma.notification.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

async function saveHero(userId: string, input: any) {
  const data = sanitize(input, ["greeting", "name", "roles", "description"]);
  return prisma.heroContent.upsert({ where: { userId }, update: data, create: { userId, ...data } });
}

async function saveAbout(userId: string, input: any) {
  const data = sanitize(input, [
    "bio1", "bio2", "highlights", "location", "email", "phone", "availability",
    "github", "linkedin", "twitter", "profileImage", "cvUrl",
    "experienceTitle", "snippetRole", "snippetPassion", "snippetCoffee",
  ]);
  return prisma.aboutContent.upsert({ where: { userId }, update: data, create: { userId, ...data } });
}

async function saveSiteSettings(userId: string, input: any) {
  const data = sanitize(input, [
    "heroTagline", "footerText", "heroStats", "quickLinks",
    "contactSubtitle", "contactLocation", "contactEmail", "contactPhone", "contactAvailability",
  ]);
  return prisma.siteSettings.upsert({ where: { userId }, update: data, create: { userId, ...data } });
}

async function upsertProject(userId: string, input: any) {
  const { id, ...raw } = input;
  const data = sanitize(raw, ["title", "description", "tags", "category", "icon", "color", "github", "live", "featured", "published", "order"]);
  if (id) return prisma.project.update({ where: { id }, data });
  return prisma.project.create({ data: { userId, ...data } });
}

async function upsertSkill(userId: string, input: any) {
  const { id, ...raw } = input;
  const data = sanitize(raw, ["label", "value", "category", "icon", "order"]);
  if (id) return prisma.skill.update({ where: { id }, data });
  return prisma.skill.create({ data: { userId, ...data } });
}

async function upsertExperience(userId: string, input: any) {
  const { id, ...raw } = input;
  const data = sanitize(raw, ["role", "company", "period", "type", "icon", "color", "points", "order"]);
  if (id) return prisma.experience.update({ where: { id }, data });
  return prisma.experience.create({ data: { userId, ...data } });
}

async function upsertAchievement(userId: string, input: any) {
  const { id, ...raw } = input;
  const data = sanitize(raw, ["title", "order"]);
  if (id) return prisma.achievement.update({ where: { id }, data });
  return prisma.achievement.create({ data: { userId, ...data } });
}

async function upsertEvent(userId: string, input: any) {
  const { id, ...raw } = input;
  const data = sanitize(raw, [
    "title", "description", "date", "endDate", "location",
    "virtual", "meetingUrl", "type", "status", "featured", "image", "tags", "capacity",
  ]);
  if (data.date) data.date = new Date(data.date);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (id) return prisma.event.update({ where: { id }, data });
  return prisma.event.create({ data: { userId, ...data } });
}

async function deleteById(model: string, id: string) {
  await (prisma as any)[model].delete({ where: { id } });
  return true;
}

async function markMessageRead(id: string) {
  return prisma.contactMessage.update({ where: { id }, data: { read: true } });
}

async function sendMessage(targetUsername: string, args: any) {
  const user = await prisma.user.findUnique({ where: { username: targetUsername } });
  if (!user) throw new Error("Recipient user not found");
  return prisma.contactMessage.create({
    data: {
      userId: user.id,
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
    },
  });
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

async function dispatch(fieldName: string, variables: any): Promise<any> {
  switch (fieldName) {
    case "getPortfolio":      return getPortfolio(variables.username);
    case "getProjects":       return getProjects(variables);
    case "getSkills":         return getSkills(variables);
    case "getExperiences":    return getExperiences(variables);
    case "getAchievements":   return getAchievements(variables);
    case "getEvents":         return getEvents(variables);
    case "getMessages":       return getMessages(variables);
    case "getNotifications":  return getNotifications(variables);

    case "saveHero":          return saveHero(variables.userId, variables.input);
    case "saveAbout":         return saveAbout(variables.userId, variables.input);
    case "saveSiteSettings":  return saveSiteSettings(variables.userId, variables.input);

    case "upsertProject":     return upsertProject(variables.userId, variables.input);
    case "deleteProject":     return deleteById("project", variables.id);

    case "upsertSkill":       return upsertSkill(variables.userId, variables.input);
    case "deleteSkill":       return deleteById("skill", variables.id);

    case "upsertExperience":  return upsertExperience(variables.userId, variables.input);
    case "deleteExperience":  return deleteById("experience", variables.id);

    case "upsertAchievement": return upsertAchievement(variables.userId, variables.input);
    case "deleteAchievement": return deleteById("achievement", variables.id);

    case "upsertEvent":       return upsertEvent(variables.userId, variables.input);
    case "deleteEvent":       return deleteById("event", variables.id);

    case "deleteMessage":     return deleteById("contactMessage", variables.id);
    case "markMessageRead":   return markMessageRead(variables.id);

    case "sendMessage":       return sendMessage(variables.targetUsername, variables);

    default:
      throw new Error(`Unknown operation: ${fieldName}`);
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, variables = {} } = await req.json();

    const fieldName = extractFieldName(query);
    if (!fieldName) {
      return NextResponse.json(
        { errors: [{ message: "Could not parse GraphQL operation" }] },
        { status: 400 }
      );
    }

    const result = await dispatch(fieldName, variables);
    return NextResponse.json({ data: { [fieldName]: result } });
  } catch (error: any) {
    console.error("[/api/graphql]", error?.message);
    return NextResponse.json(
      { errors: [{ message: error?.message || "Internal server error" }] },
      { status: 500 }
    );
  }
}
