import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProjectsSection from "../components/ProjectsSection";
import BlogSection from "../components/BlogSection";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <Navbar />
      <Hero />
      <ProjectsSection />
      <StatsSection />
      <BlogSection />
      <Footer />
    </main>
  );
}

