export const themes = [
  {
    id: "default",
    name: "Midnight",
    bg: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    card: "rgba(255,255,255,0.06)",
    cardHover: "rgba(255,255,255,0.12)",
    text: "#ffffff",
    subtext: "rgba(255,255,255,0.65)",
    border: "rgba(255,255,255,0.1)",
    accent: "#7c6fea",
    buttonRadius: "12px",
  },
  {
    id: "aurora",
    name: "Aurora",
    bg: "linear-gradient(135deg, #0d1b2a, #1b4332, #0d1b2a)",
    card: "rgba(52,211,153,0.1)",
    cardHover: "rgba(52,211,153,0.2)",
    text: "#e6fffa",
    subtext: "rgba(230,255,250,0.65)",
    border: "rgba(52,211,153,0.2)",
    accent: "#34d399",
    buttonRadius: "12px",
  },
  {
    id: "rose",
    name: "Rose Quartz",
    bg: "linear-gradient(135deg, #1a0a14, #3b1829, #1a0a14)",
    card: "rgba(251,113,133,0.1)",
    cardHover: "rgba(251,113,133,0.2)",
    text: "#fff1f2",
    subtext: "rgba(255,241,242,0.65)",
    border: "rgba(251,113,133,0.2)",
    accent: "#fb7185",
    buttonRadius: "999px",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    bg: "linear-gradient(135deg, #020617, #0c1a3a, #020617)",
    card: "rgba(56,189,248,0.08)",
    cardHover: "rgba(56,189,248,0.16)",
    text: "#f0f9ff",
    subtext: "rgba(240,249,255,0.65)",
    border: "rgba(56,189,248,0.15)",
    accent: "#38bdf8",
    buttonRadius: "12px",
  },
  {
    id: "ember",
    name: "Ember",
    bg: "linear-gradient(135deg, #1a0500, #3b1200, #1a0500)",
    card: "rgba(251,146,60,0.1)",
    cardHover: "rgba(251,146,60,0.2)",
    text: "#fff7ed",
    subtext: "rgba(255,247,237,0.65)",
    border: "rgba(251,146,60,0.2)",
    accent: "#fb923c",
    buttonRadius: "8px",
  },
] as const;

export type Theme = (typeof themes)[number];
export type ThemeId = Theme["id"];

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
