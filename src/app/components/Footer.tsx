"use client";

import { useEffect, useState } from "react";
import styles from "./Footer.module.css";

const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

export default function Footer({ data, contact }: { data?: any; contact?: any }) {
  const year = new Date().getFullYear();

  const tagline = data?.heroTagline || "";
  const copyright = data?.footerText || `© ${year} ${contact?.name || "Developer"}. All rights reserved.`;
  const links = data?.quickLinks || [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={`container ${styles.topContent}`}>
          <div className={styles.brand}>
            <a href="#home" className={styles.logo} onClick={(e) => handleNav(e, "#home")}>
              <span className={styles.logoIcon}>&lt;</span>
              <span className={styles.logoText}>
                {contact?.name ? contact.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "DEV"}
              </span>
              <span className={styles.logoIcon}>/&gt;</span>
            </a>
            <p className={styles.tagline}>{tagline}</p>
          </div>

          <nav className={styles.footerNav}>
            <span className={styles.navHeader}>Quick Links</span>
            {links.map((l: any, i: number) => (
              <a key={`${l.href}-${i}`} href={l.href} className={styles.footerLink} onClick={(e) => handleNav(e, l.href)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className={styles.footerContact}>
            <span className={styles.navHeader}>Contact</span>
            {contact?.email && <a href={`mailto:${contact.email}`} className={styles.footerLink}>{contact.email}</a>}
            {contact?.phone && <a href={`tel:${contact.phone}`} className={styles.footerLink}>{contact.phone}</a>}
            {contact?.location && <span className={styles.footerLink} style={{ color: "var(--text-muted)" }}>{contact.location}</span>}
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.bottomContent}>
            <span className={styles.copyright}>{copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
