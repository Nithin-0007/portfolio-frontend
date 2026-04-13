import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Build a rich system prompt from the portfolio owner's data
async function buildContext(username: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        heroContent: true,
        aboutContent: true,
        skills: { orderBy: { order: "asc" } },
        experiences: { orderBy: { order: "asc" } },
        projects: { where: { published: true }, orderBy: { order: "asc" }, take: 10 },
        achievements: { orderBy: { order: "asc" } },
      },
    });
    if (!user) return `You are a helpful AI assistant for a developer portfolio.`;

    const hero = user.heroContent[0];
    const about = user.aboutContent[0];
    const name = hero?.name || user.name || "The Developer";
    const roles = (hero?.roles || []).join(", ");
    const bio = [about?.bio1, about?.bio2].filter(Boolean).join(" ");
    const skills = user.skills.map((s) => s.label).join(", ");
    const experiences = user.experiences
      .map((e) => `${e.role} at ${e.company} (${e.period})`)
      .join("; ");
    const projects = user.projects
      .map((p) => `${p.title}: ${p.description || ""}${p.tags?.length ? ` [${p.tags.join(", ")}]` : ""}`)
      .join("; ");
    const achievements = user.achievements.map((a) => a.title).join("; ");

    return `You are an AI assistant for ${name}'s professional portfolio website. Be friendly, concise, and helpful.

ABOUT ${name.toUpperCase()}:
${bio || `A skilled developer specializing in ${roles}.`}
Roles: ${roles}
Location: ${about?.location || ""}
Email: ${about?.email || user.email || ""}
GitHub: ${about?.github || ""}
LinkedIn: ${about?.linkedin || ""}

SKILLS: ${skills || "Various programming technologies"}

WORK EXPERIENCE: ${experiences || "Professional experience available on the portfolio"}

PROJECTS: ${projects || "Multiple projects available on the portfolio"}

ACHIEVEMENTS: ${achievements || ""}

INSTRUCTIONS:
- Answer questions about ${name}'s skills, projects, experience, and background
- Help visitors understand how to contact or hire ${name}
- Be professional, friendly, and concise (under 150 words unless more detail is needed)
- If asked something you don't know, say you don't have that information and suggest they use the contact form
- Do NOT make up any information not provided above`;
  } catch {
    return `You are a helpful AI assistant for a developer portfolio. Help visitors learn about the developer's skills and experience.`;
  }
}

// Call Anthropic Claude API
async function callClaude(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const messages = [
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "I couldn't generate a response.";
}

// Keyword-based fallback when no API key is configured
function fallbackResponse(message: string, context: string): string {
  const q = message.toLowerCase();

  // Extract name from context for personalized responses
  const nameMatch = context.match(/ABOUT ([^\n:]+):/);
  const name = nameMatch ? nameMatch[1] : "this developer";

  if (q.includes("skill") || q.includes("tech") || q.includes("language") || q.includes("framework")) {
    const skillsMatch = context.match(/SKILLS: ([^\n]+)/);
    const skills = skillsMatch ? skillsMatch[1] : "various technologies";
    return `${name} is proficient in: ${skills}. Check the Skills section on this page for a detailed breakdown!`;
  }
  if (q.includes("project")) {
    return `You can see ${name}'s projects in the Projects section below. Each project includes a description, tech stack, and links to GitHub and live demos.`;
  }
  if (q.includes("experience") || q.includes("work") || q.includes("job")) {
    const expMatch = context.match(/WORK EXPERIENCE: ([^\n]+)/);
    const exp = expMatch ? expMatch[1] : "multiple companies";
    return `${name}'s experience includes: ${exp}. Visit the Experience section for full details.`;
  }
  if (q.includes("contact") || q.includes("hire") || q.includes("email") || q.includes("reach")) {
    const emailMatch = context.match(/Email: ([^\n]+)/);
    const email = emailMatch ? emailMatch[1].trim() : "";
    return email
      ? `You can contact ${name} at ${email} or use the Contact form at the bottom of this page!`
      : `Use the Contact form at the bottom of this page to reach out to ${name}.`;
  }
  if (q.includes("github") || q.includes("linkedin") || q.includes("social")) {
    const ghMatch = context.match(/GitHub: ([^\n]+)/);
    const liMatch = context.match(/LinkedIn: ([^\n]+)/);
    const links = [ghMatch?.[1]?.trim(), liMatch?.[1]?.trim()].filter(Boolean).join(" | ");
    return links ? `Find ${name} online: ${links}` : `Check the About section for ${name}'s social links.`;
  }
  if (q.includes("about") || q.includes("who") || q.includes("background")) {
    const bioMatch = context.match(/ABOUT[^:]+:\n([^\n]+)/);
    return bioMatch ? bioMatch[1] : `Scroll up to the About section to learn more about ${name}!`;
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Hi there! I'm ${name}'s AI assistant. Ask me about skills, projects, experience, or how to get in touch!`;
  }
  return `I'm ${name}'s portfolio assistant. I can tell you about skills, projects, work experience, or how to contact ${name}. What would you like to know?`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, username, history = [] } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const context = await buildContext(username || "");

    let reply: string;
    try {
      reply = await callClaude(context, history, message);
    } catch (err: any) {
      // Fall back to keyword-matching when no API key or API fails
      if (err.message === "NO_KEY" || err.message?.includes("API error")) {
        reply = fallbackResponse(message, context);
      } else {
        throw err;
      }
    }

    return NextResponse.json({ content: reply, role: "assistant" });
  } catch (error: any) {
    console.error("[/api/chat]", error?.message);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
