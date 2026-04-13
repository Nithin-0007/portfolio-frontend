import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Projects from "@/app/components/Projects";
import Experience from "@/app/components/Experience";
import Events from "@/app/components/Events";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";
import ChatWidget from "@/app/components/ChatWidget";
import ThemeInjector from "@/app/components/ThemeInjector";
import { graphqlClient } from "@/lib/graphql-client";
import { prisma } from "@/lib/prisma";

const GET_PORTFOLIO = `
  query GetPortfolio($username: String!) {
    getPortfolio(username: $username) {
      user { id username name email phone avatar }
      hero { id greeting name roles description }
      about { 
        id bio1 bio2 highlights location email phone availability 
        github linkedin twitter profileImage cvUrl 
        snippetRole snippetPassion snippetCoffee
      }
      projects { id title description tags category icon color github live featured published order }
      skills { id label value category icon order }
      experiences { id role company period type icon color points order }
      achievements { id title order }
      events { id title description date endDate location virtual meetingUrl type status featured image tags capacity }
      siteSettings { id heroTagline footerText heroStats quickLinks contactSubtitle contactLocation contactEmail contactPhone contactAvailability }
    }
  }
`;

function parseSettings(siteSettings: any) {
  if (!siteSettings) return siteSettings;
  return {
    ...siteSettings,
    heroStats: siteSettings.heroStats?.map((s: string) => {
      const [value, label] = s.split("|");
      return { value: value || "", label: label || "" };
    }) || [],
    quickLinks: siteSettings.quickLinks?.map((l: string) => {
      const [label, href] = l.split("|");
      return { label: label || "", href: href || "" };
    }) || [],
  };
}

// React cache() deduplicates calls within the same request — 
// generateMetadata and the page component share one fetch
const getPortfolioData = cache(async (username: string) => {
  // Try AppSync first
  try {
    const data = await graphqlClient.query(GET_PORTFOLIO, { username }, { revalidate: 60 });
    const result = data?.getPortfolio;
    if (result) {
      result.siteSettings = parseSettings(result.siteSettings);
      return result;
    }
  } catch (error) {
    console.error("AppSync error, falling back to Prisma:", error);
  }

  // Prisma fallback
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        heroContent: true,
        aboutContent: true,
        projects: { where: { published: true }, orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        experiences: { orderBy: { order: "asc" } },
        achievements: { orderBy: { order: "asc" } },
        events: { orderBy: { date: "desc" } },
        siteSettings: true,
      },
    });

    if (!user) return null;

    return {
      user: { id: user.id, username: user.username, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
      hero: user.heroContent[0] || null,
      about: user.aboutContent[0] || null,
      projects: user.projects,
      skills: user.skills,
      experiences: user.experiences,
      achievements: user.achievements,
      events: user.events,
      siteSettings: parseSettings(user.siteSettings[0] || null),
    };
  } catch (error) {
    console.error("Prisma error:", error);
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const data = await getPortfolioData(username);

  if (!data) return { title: "Portfolio Not Found" };

  const name = data.hero?.name || data.user?.name || "The Developer";
  const role = data.hero?.roles?.[0] || "Full-Stack Developer";

  return {
    title: `${name} | ${role}`,
    description: data.hero?.description || `Professional portfolio of ${name}.`,
    openGraph: {
      title: `${name} | Professional Portfolio`,
      description: data.hero?.description || `Professional portfolio of ${name}.`,
      type: "website",
    },
  };
}

export default async function Home({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  // Same cache() call — returns the already-fetched result, zero extra network call
  const data = await getPortfolioData(username);

  if (!data) notFound();

  const design = data.siteSettings;
  const show = {
    skills:     design?.showSkills     !== false,
    projects:   design?.showProjects   !== false,
    experience: design?.showExperience !== false,
    events:     design?.showEvents     !== false,
  };

  return (
    <>
      <ThemeInjector design={design} />
      <Navbar data={data.siteSettings} user={data.user} />
      <main>
        <Hero data={data.hero} stats={data.siteSettings?.heroStats} skills={data.skills?.slice(0, 5)} />
        <About data={data.about} />
        {show.skills     && <Skills data={data.skills} />}
        {show.projects   && <Projects data={data.projects} github={data.about?.github} />}
        {show.experience && <Experience data={data.experiences} achievements={data.achievements} />}
        {show.events     && <Events data={data.events} />}
        <Contact data={data.about} siteSettings={data.siteSettings} userId={data.user.id} user={data.user} />
      </main>
      <Footer data={data.siteSettings} contact={data.about} />
      <ChatWidget username={username} />
    </>
  );
}
