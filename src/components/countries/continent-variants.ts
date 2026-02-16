// Continent-to-variant color mapping
// Follows the same structure as feature-card variantStyles

export interface ContinentStyle {
  /** Tailwind gradient classes for the country name */
  nameGradient: string;
  /** Hover variant of the name gradient */
  nameGradientHover: string;
  /** Badge background Tailwind class */
  badgeBg: string;
  /** Badge text Tailwind class */
  badgeText: string;
  /** Radial glow color (CSS rgba) for card hover */
  glowColor: string;
  /** Border glow color (CSS rgba) for card hover overlay */
  borderGlow: string;
  /** Box-shadow string for whileHover */
  hoverShadow: string;
  /** Tailwind class for the top accent bar on detail page InfoCard */
  accentBorder: string;
  /** Icon color class for section headers on detail page */
  iconColor: string;
  /** Icon background class for section headers on detail page */
  iconBg: string;
}

export const continentVariants: Record<string, ContinentStyle> = {
  Africa: {
    nameGradient: "",
    nameGradientHover: "group-hover:from-amber-300 group-hover:to-orange-500",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.07)",
    borderGlow: "rgba(245, 158, 11, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(245, 158, 11, 0.15)",
    accentBorder: "border-t-amber-500",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  Antarctica: {
    nameGradient: "",
    nameGradientHover: "group-hover:from-cyan-200 group-hover:to-sky-400",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-600 dark:text-sky-400",
    glowColor: "rgba(14, 165, 233, 0.07)",
    borderGlow: "rgba(14, 165, 233, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(14, 165, 233, 0.15)",
    accentBorder: "border-t-sky-500",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
  },
  Asia: {
    nameGradient: "",
    nameGradientHover: "group-hover:from-rose-300 group-hover:to-red-500",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400",
    glowColor: "rgba(244, 63, 94, 0.07)",
    borderGlow: "rgba(244, 63, 94, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(244, 63, 94, 0.15)",
    accentBorder: "border-t-rose-500",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
  Europe: {
    nameGradient: "",
    nameGradientHover: "group-hover:from-blue-300 group-hover:to-indigo-500",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.07)",
    borderGlow: "rgba(59, 130, 246, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.15)",
    accentBorder: "border-t-blue-500",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  "North America": {
    nameGradient: "",
    nameGradientHover: "group-hover:from-emerald-300 group-hover:to-green-500",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.07)",
    borderGlow: "rgba(16, 185, 129, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.15)",
    accentBorder: "border-t-emerald-500",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  Oceania: {
    nameGradient: "",
    nameGradientHover: "group-hover:from-teal-300 group-hover:to-cyan-500",
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-600 dark:text-teal-400",
    glowColor: "rgba(20, 184, 166, 0.07)",
    borderGlow: "rgba(20, 184, 166, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(20, 184, 166, 0.15)",
    accentBorder: "border-t-teal-500",
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
  },
  "South America": {
    nameGradient: "",
    nameGradientHover: "group-hover:from-violet-300 group-hover:to-purple-500",
    badgeBg: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.07)",
    borderGlow: "rgba(139, 92, 246, 0.35)",
    hoverShadow: "0 20px 40px -12px rgba(139, 92, 246, 0.15)",
    accentBorder: "border-t-violet-500",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
};

/** Fallback to Europe (blue) if continent unknown */
export function getContinentStyle(continent: string): ContinentStyle {
  return continentVariants[continent] ?? continentVariants["Europe"];
}
