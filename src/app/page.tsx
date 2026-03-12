"use client";
import styles from "./components/Hero.module.css"; // Reuse some beautiful hero styles for the landing page

export default function SaaSLandingPage() {
  return (
    <>
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Portfolio<span className="gradient-text">OS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/admin/login" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
            Login
          </a>
          <a href="/admin/login" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            Get Started
          </a>
        </div>
      </nav>
      
      <main>
        <section className={styles.hero} style={{ minHeight: '85vh', paddingTop: '4rem' }}>
          <div className={styles.bgMesh} />
          <div className={styles.gridBg} />
          <div className={`bg-glow bg-glow-purple ${styles.glow1}`} style={{ opacity: 0.8 }} />
          <div className={`bg-glow bg-glow-cyan ${styles.glow2}`} style={{ opacity: 0.6 }} />
          
          <div className={`container ${styles.heroContent}`} style={{ alignItems: 'center', textAlign: 'center' }}>
            <div className={styles.greeting} style={{ marginBottom: '1.5rem', alignSelf: 'center' }}>
              <span className={styles.greetingDot} style={{ background: 'var(--accent-secondary)', boxShadow: '0 0 10px var(--accent-secondary)' }} />
              The Ultimate Developer Portfolio Builder
            </div>
            
            <h1 className={styles.name} style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.1, maxWidth: '900px', margin: '0 auto 1.5rem' }}>
              Stand Out With A <br/><span className="gradient-text-hero">Professional Portfolio</span>
            </h1>
            
            <p className={styles.description} style={{ maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.125rem' }}>
              Create a stunning, AI-powered portfolio in minutes. Manage your projects, skills, and timeline effortlessly with our powerful CMS, and get your own unique `domain.com/username` link.
            </p>
            
            <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
              <a href="/admin/login" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1.125rem' }}>
                Create Your Free Portfolio
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
            
            <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'center', minWidth: '220px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Lightning Fast</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Server-side rendered next.js app</p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'center', minWidth: '220px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Beautiful Design</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Premium dark-mode glassmorphism</p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'center', minWidth: '220px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>AI Integrated</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Built-in Ollama LLM assistant</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
