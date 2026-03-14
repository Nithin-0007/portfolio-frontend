"use client";

import { useState, useEffect } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";

const GET_CONTENT = `
  query GetContent($username: String!) {
    getPortfolio(username: $username) {
      hero { id greeting name roles description }
      about { 
        id bio1 bio2 highlights location email phone availability 
        github linkedin twitter profileImage cvUrl snippetRole snippetPassion snippetCoffee 
      }
    }
  }
`;

const SAVE_HERO = `
  mutation SaveHero($userId: ID!, $input: HeroInput!) {
    saveHero(userId: $userId, input: $input) { id }
  }
`;

const SAVE_ABOUT = `
  mutation SaveAbout($userId: ID!, $input: AboutInput!) {
    saveAbout(userId: $userId, input: $input) { id }
  }
`;

export default function ContentManager() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const [heroData, setHeroData] = useState({
    greeting: "",
    name: "",
    roles: [""],
    description: "",
  });

  const [aboutData, setAboutData] = useState({
    bio1: "",
    bio2: "",
    highlights: [""],
    location: "",
    email: "",
    phone: "",
    availability: "",
    github: "",
    linkedin: "",
    twitter: "",
    profileImage: "",
    cvUrl: "",
    experienceTitle: "",
    snippetRole: "",
    snippetPassion: "",
    snippetCoffee: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!username) return;
    graphqlClient.query(GET_CONTENT, { username }).then(data => {
      if (data?.getPortfolio?.hero) setHeroData(data.getPortfolio.hero);
      if (data?.getPortfolio?.about) setAboutData(data.getPortfolio.about);
    }).finally(() => setLoading(false));
  }, [username]);

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHeroData({ ...heroData, [e.target.name]: e.target.value });
  };
  
  const handleAboutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAboutData({ ...aboutData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (index: number, value: string) => {
    const newRoles = [...heroData.roles];
    newRoles[index] = value;
    setHeroData({ ...heroData, roles: newRoles });
  };
  const addRole = () => setHeroData({ ...heroData, roles: [...heroData.roles, ""] });
  const removeRole = (index: number) => setHeroData({ ...heroData, roles: heroData.roles.filter((_, i) => i !== index) });

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...aboutData.highlights];
    newHighlights[index] = value;
    setAboutData({ ...aboutData, highlights: newHighlights });
  };
  const addHighlight = () => setAboutData({ ...aboutData, highlights: [...aboutData.highlights, ""] });
  const removeHighlight = (index: number) => setAboutData({ ...aboutData, highlights: aboutData.highlights.filter((_, i) => i !== index) });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profileImage" | "cvUrl") => {
    // Skipping file upload implementation for now as it requires S3/Storage setup
    alert("File upload is currently being migrated to AWS S3. Please provide a URL for now.");
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Remove metadata for mutation
      const { id: hId, ...heroInput } = heroData as any;
      heroInput.roles = heroInput.roles.filter((r:string) => r.trim() !== "");
      
      const { id: aId, ...aboutInput } = aboutData as any;
      aboutInput.highlights = aboutInput.highlights.filter((h:string) => h.trim() !== "");

      await Promise.all([
        graphqlClient.query(SAVE_HERO, { userId, input: heroInput }),
        graphqlClient.query(SAVE_ABOUT, { userId, input: aboutInput })
      ]);
      
      alert("All content saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading content...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.pageTitle}>Profile Content</h1>
          <p className={styles.pageSubtitle}>Manage your hero text, bio, and contact information</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className={styles.formGrid}>
        
        <div className={styles.card} 
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const isImage = file.type.startsWith('image/');
              handleFileUpload({ target: { files: [file] } } as any, isImage ? "profileImage" : "cvUrl");
            }
          }}
        >
          <h2 className={styles.cardTitle}>Visual Assets</h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>Management for your profile photo and downloadable resume. <strong>Tip: Drag and drop files here!</strong></p>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Profile Image (URL or Upload)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input className={styles.input} style={{ flex: 1 }} name="profileImage" value={aboutData.profileImage || ""} onChange={handleAboutChange} placeholder="https://example.com/photo.jpg" />
              <input type="file" id="profile-upload" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, "profileImage")} />
              <button className={styles.btnSecondary} onClick={() => document.getElementById("profile-upload")?.click()}>📁 Upload</button>
            </div>
            {aboutData.profileImage && (
              <div style={{ marginTop: '8px', position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <img src={aboutData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Resume / CV (URL or Upload)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input className={styles.input} style={{ flex: 1 }} name="cvUrl" value={aboutData.cvUrl || ""} onChange={handleAboutChange} placeholder="https://example.com/resume.pdf" />
              <input type="file" id="cv-upload" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, "cvUrl")} />
              <button className={styles.btnSecondary} onClick={() => document.getElementById("cv-upload")?.click()}>📁 Upload</button>
            </div>
            {aboutData.cvUrl && (
              <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--accent-primary)' }}>✓ File linked: {aboutData.cvUrl.split('/').pop()}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Experience Badge Text (e.g. 3+ Years Exp.)</label>
            <input className={styles.input} name="experienceTitle" value={aboutData.experienceTitle || ""} onChange={handleAboutChange} placeholder="e.g. 3+ Years Exp." />
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f8fafc' }}>Decorative Code Snippet</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Snippet Role</label>
                <input className={styles.input} name="snippetRole" value={aboutData.snippetRole || ""} onChange={handleAboutChange} placeholder="Full-Stack Dev" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Snippet Passion</label>
                <input className={styles.input} name="snippetPassion" value={aboutData.snippetPassion || ""} onChange={handleAboutChange} placeholder="Building" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Snippet Coffee</label>
                <input className={styles.input} name="snippetCoffee" value={aboutData.snippetCoffee || ""} onChange={handleAboutChange} placeholder="Infinity" />
              </div>
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Hero Header Section</h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>The large text displayed at the very top of your site.</p>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Greeting Text</label>
              <input className={styles.input} name="greeting" value={heroData.greeting || ""} onChange={handleHeroChange} placeholder="Hello, World! I'm" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Display Name</label>
              <input className={styles.input} name="name" value={heroData.name || ""} onChange={handleHeroChange} placeholder="Nithish Kumar" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description Text</label>
            <textarea className={styles.textarea} rows={3} name="description" value={heroData.description || ""} onChange={handleHeroChange} placeholder="I craft beautiful, high-performance web experiences..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Animated Typing Roles</label>
            {heroData.roles && heroData.roles.map((role, i) => (
              <div key={i} className={styles.highlightRow} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className={styles.input} style={{ flex: 1 }} value={role} onChange={(e) => handleRoleChange(i, e.target.value)} placeholder="e.g., Full-Stack Developer" />
                <button className={styles.btnDanger} onClick={() => removeRole(i)}>Remove</button>
              </div>
            ))}
            <button className={styles.btnSecondary} onClick={addRole} style={{ width: 'fit-content' }}>+ Add Role</button>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>About Biography</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Biography Paragraph 1</label>
            <textarea className={styles.textarea} rows={4} name="bio1" value={aboutData.bio1 || ""} onChange={handleAboutChange} placeholder="First paragraph about yourself..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Biography Paragraph 2</label>
            <textarea className={styles.textarea} rows={4} name="bio2" value={aboutData.bio2 || ""} onChange={handleAboutChange} placeholder="Second paragraph..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Highlights (Bullet Points)</label>
            {aboutData.highlights && aboutData.highlights.map((hlt, i) => (
              <div key={i} className={styles.highlightRow} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className={styles.input} style={{ flex: 1 }} value={hlt} onChange={(e) => handleHighlightChange(i, e.target.value)} placeholder="e.g., 5+ Years Experience" />
                <button className={styles.btnDanger} onClick={() => removeHighlight(i)}>Remove</button>
              </div>
            ))}
            <button className={styles.btnSecondary} onClick={addHighlight} style={{ width: 'fit-content' }}>+ Add Highlight</button>
          </div>
        </div>

        {/* CONTACT SECTION */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Contact Information</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Location</label>
            <input className={styles.input} name="location" value={aboutData.location || ""} onChange={handleAboutChange} placeholder="e.g., Chennai, India" />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Contact Email</label>
            <input className={styles.input} type="email" name="email" value={aboutData.email || ""} onChange={handleAboutChange} placeholder="hello@example.com" />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <input className={styles.input} name="phone" value={aboutData.phone || ""} onChange={handleAboutChange} placeholder="+91 98765 43210" />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Availability Status</label>
            <input className={styles.input} name="availability" value={aboutData.availability || ""} onChange={handleAboutChange} placeholder="Open to opportunities" />
          </div>

          <h2 className={styles.cardTitle} style={{ marginTop: 32 }}>Social Links</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>GitHub URL</label>
            <input className={styles.input} type="url" name="github" value={aboutData.github || ""} onChange={handleAboutChange} placeholder="https://github.com/yourusername" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>LinkedIn URL</label>
            <input className={styles.input} type="url" name="linkedin" value={aboutData.linkedin || ""} onChange={handleAboutChange} placeholder="https://linkedin.com/in/yourusername" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Twitter / X URL</label>
            <input className={styles.input} type="url" name="twitter" value={aboutData.twitter || ""} onChange={handleAboutChange} placeholder="https://twitter.com/yourusername" />
          </div>

        </div>
      </div>
    </div>
  );
}
