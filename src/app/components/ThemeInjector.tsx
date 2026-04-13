// Server component — injects CSS variable overrides based on saved design settings
export default function ThemeInjector({ design }: { design: any }) {
  if (!design) return null;

  const {
    colorPrimary   = "#7c3aed",
    colorSecondary = "#06b6d4",
    colorPink      = "#ec4899",
    bgPrimary      = "#050816",
    bgSecondary    = "#0d1117",
    fontBody       = "Inter",
    animationLevel = "normal",
    borderRadius   = "medium",
  } = design;

  // Derive hex → rgb for glow colours
  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  const primaryRgb   = hexToRgb(colorPrimary);
  const secondaryRgb = hexToRgb(colorSecondary);
  const pinkRgb      = hexToRgb(colorPink);

  const radiusMap: Record<string, string> = {
    sharp:   "4px, 6px, 10px, 16px",
    medium:  "8px, 12px, 20px, 32px",
    rounded: "14px, 20px, 32px, 48px",
  };
  const [rsm, rmd, rlg, rxl] = (radiusMap[borderRadius] || radiusMap.medium).split(", ");

  const animMap: Record<string, string> = {
    none:    "0s",
    subtle:  "0.4s",
    normal:  "0.6s",
    dynamic: "0.9s",
  };
  const animDuration = animMap[animationLevel] || animMap.normal;

  // Font stacks
  const fontMap: Record<string, string> = {
    Inter:         "'Inter', system-ui, -apple-system, sans-serif",
    Poppins:       "'Poppins', system-ui, sans-serif",
    "Space Grotesk": "'Space Grotesk', system-ui, sans-serif",
    Raleway:       "'Raleway', system-ui, sans-serif",
    "DM Sans":     "'DM Sans', system-ui, sans-serif",
  };
  const fontStack = fontMap[fontBody] || fontMap.Inter;

  const css = `
:root {
  --accent-primary: ${colorPrimary};
  --accent-secondary: ${colorSecondary};
  --accent-pink: ${colorPink};
  --bg-primary: ${bgPrimary};
  --bg-secondary: ${bgSecondary};
  --bg-card: rgba(255,255,255,0.04);

  --gradient-primary: linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 100%);
  --gradient-hero: linear-gradient(135deg, ${colorPrimary} 0%, ${colorPink} 50%, ${colorSecondary} 100%);
  --gradient-glow-purple: radial-gradient(ellipse at center, rgba(${primaryRgb}, 0.3) 0%, transparent 70%);
  --gradient-glow-cyan: radial-gradient(ellipse at center, rgba(${secondaryRgb}, 0.2) 0%, transparent 70%);

  --border-accent: rgba(${primaryRgb}, 0.4);
  --shadow-glow: 0 0 40px rgba(${primaryRgb}, 0.3);
  --shadow-glow-cyan: 0 0 40px rgba(${secondaryRgb}, 0.3);

  --radius-sm: ${rsm};
  --radius-md: ${rmd};
  --radius-lg: ${rlg};
  --radius-xl: ${rxl};

  --anim-duration: ${animDuration};
}

body { font-family: ${fontStack}; }

${animationLevel === "none" ? `
*, *::before, *::after {
  animation-duration: 0.001s !important;
  transition-duration: 0.001s !important;
}
` : animationLevel === "subtle" ? `
.reveal { transition-duration: 0.35s !important; }
` : animationLevel === "dynamic" ? `
.reveal { transition-duration: 0.9s !important; }
` : ""}
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
