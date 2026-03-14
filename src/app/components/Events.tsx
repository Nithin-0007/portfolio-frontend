"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Events.module.css";

export default function Events({ data }: { data: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const initialEvents = [
    { title: "React Conf 2024", date: "2024-05-15T10:00:00Z", location: "Las Vegas, NV", type: "CONFERENCE", description: "Speaking about 'The Future of Agentic AI in Web Development' and how we're building autonomous coding assistants.", featured: true, tags: ["React", "AI", "Frontend"] },
    { title: "Node.js Interactive", date: "2024-06-20T09:00:00Z", location: "Austin, TX", type: "WORKSHOP", description: "Hands-on workshop on building high-performance microservices with Node.js and Rust using napi-rs.", featured: false, tags: ["Node.js", "Performance", "Rust"] },
    { title: "Global Developer Meetup", date: "2024-07-12T18:00:00Z", location: "Online / Virtual", type: "MEETUP", description: "Hosting a virtual roundtable discussion on open-source sustainability and developer health.", featured: true, virtual: true, tags: ["Community", "OSS"] }
  ];

  const displayEvents = data && data.length > 0 ? data : initialEvents;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          entry.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="events" className={`section ${styles.events}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-pink ${styles.bgGlow}`} />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">
            <span>📅</span> Events & Speaking
          </div>
          <h2 className="section-title reveal">
            Upcoming <span className="gradient-text">Engagements</span>
          </h2>
          <p className="section-subtitle reveal" style={{ margin: "0 auto" }}>
            Catch me at conferences, workshops, and meetups where I share my journey and latest tech insights.
          </p>
        </div>

        <div className={styles.grid}>
          {displayEvents.map((event, i) => (
            <div 
              key={`${event.title}-${i}`} 
              className={`${styles.card} reveal ${event.featured ? styles.featured : ""}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.date}>
                  <span className={styles.day}>{new Date(event.date).toLocaleDateString("en-US", { day: "2-digit" })}</span>
                  <span className={styles.month}>{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</span>
                </div>
                <div className={styles.typeTag}>
                  {event.type}
                </div>
              </div>

              <h3 className={styles.title}>{event.title}</h3>
              <p className={styles.desc}>{event.description}</p>
              
              <div className={styles.meta}>
                <div className={styles.location}>
                  {event.virtual ? "🌐 Virtual" : `📍 ${event.location}`}
                </div>
                <div className={styles.tags}>
                  {event.tags?.map((t: string) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>

              {event.featured && <div className={styles.featuredBadge}>⭐ Featured</div>}
              <div className={styles.cardGlow} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
