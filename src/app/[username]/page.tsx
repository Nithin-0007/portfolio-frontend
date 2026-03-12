import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Projects from "@/app/components/Projects";
import Experience from "@/app/components/Experience";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";
import ChatWidget from "@/app/components/ChatWidget";
import { graphqlClient } from "@/lib/graphql-client";

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
      siteSettings { id heroTagline footerText heroStats quickLinks }
    }
  }
`;

async function getPortfolioData(username: string) {
  try {
    const data = await graphqlClient.query(GET_PORTFOLIO, { username });
    return data?.getPortfolio;
  } catch (error) {
    console.error("Error fetching portfolio via GraphQL:", error);
    return null;
  }
}

export default async function Home({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getPortfolioData(username);

  // If username does not exist in our Multi-Tenant database, throw a 404
  if (!data) {
    notFound(); 
  }

  return (
    <>
      <Navbar data={data.settings} user={data.user} />
      <main>
        <Hero data={data.hero} stats={data.settings?.heroStats} />
        <About data={data.about} />
        <Skills data={data.skills} />
        <Projects data={data.projects} />
        <Experience data={data.experiences} achievements={data.achievements} />
        <Contact data={data.about} userId={data.user.id} />
      </main>
      <Footer data={data.settings} contact={data.about} />
      <ChatWidget />
    </>
  );
}
