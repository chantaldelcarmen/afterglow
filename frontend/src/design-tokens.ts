/**
 * AFTERGLOW DESIGN SYSTEM
 * Single source of truth for colors, typography, and visual effects
 */

// ============================================
// 🎨 COLOR PALETTE (Role-Based Naming)
// ============================================

export const colors = {
  // Core Brand
  brand: {
    primaryPurple: "#783CA0",
    deepPurple: "#16001F",
    midnight: "#0D000F",
  },

  // Surfaces
  surface: {
    backgroundMain: "#16001F",
    backgroundOuter: "#0D000F",
    iphoneFrame: "#1d1d1f",

    glass: "rgba(255,255,255,0.04)",
    glassBorder: "rgba(255,255,255,0.12)",

    // New glass card styling
    glassCard: "rgba(255, 255, 255, 0.08)",
    glassCardBorder: "rgba(255, 255, 255, 0.10)",
    glassCardBorderHover: "rgba(255, 255, 255, 0.30)",

    navBar: "rgba(50,20,50,1)",
    navBorder: "rgba(255,255,255,0.10)",

    // Reusable deep purple tint for consistency across nav and buttons
    purpleTintDark: "rgb(50,20,50)", // Nav bar base - dark
    purpleTintLight: "rgb(150,60,150)", // Button glow - lighter, same hue
  },

  // Text
  text: {
    primary: "#F6EDE3",
    onImage: "#F5F5F0",
    titleGlow: "#EFE6DD",

    muted: "rgba(200,180,210,0.75)",
    mutedDim: "rgba(200,180,210,0.65)",

    navInactive: "rgba(246,237,227,0.5)",
    navActive: "#F6EDE3",

    orbIcon: "#321432",
  },

  // Ambient / Accent
  accent: {
    pink: "#E576AC",
    gold: "#F0C164",
    lavender: "#788BE5",
    turquoise: "#82EBD9",
    coral: "#E57678",

    // Image tint system (FULL COVER version)
    purpleTintTop: "rgba(120,60,160,0.85)",
    purpleTintMid: "rgba(90,40,140,0.90)",
    purpleTintBottom: "rgba(60,20,100,0.95)",

    // Image fade system
    fadeDarkest: "rgba(20,5,30,0.95)",
    fadeDark: "rgba(40,15,50,0.80)",
    fadeMedium: "rgba(60,25,70,0.50)",
  },

  // Buttons
  button: {
    primaryBg: "rgba(150,60,150,0.12)",
    primaryBgHover: "rgba(150,60,150,0.20)",

    primaryBorder: "rgba(200,150,220,0.25)",
    primaryBorderHover: "rgba(220,180,240,0.40)",

    primaryGlow: "rgba(180,120,200,0.20)",
    primaryGlowHover: "rgba(200,140,220,0.30)",

    warmBgStart: "rgba(255,220,190,0.30)",
    warmBgEnd: "rgba(246,237,227,0.12)",
    warmBg: "rgba(246,237,227,0.12)",
    warmBorder: "rgba(200,150,220,0.35)",
    warmGlow: "rgba(180,120,200,0.20)",

    // Warm gradients for convenience
    warmBgGradient: `radial-gradient(circle at 20% 0%, rgba(255,220,190,0.30) 0%, rgba(246,237,227,0.12) 40%)`,
    warmBgGradientHover: `radial-gradient(circle at 20% 0%, rgba(255,220,190,0.35) 0%, rgba(246,237,227,0.18) 40%)`,

    // Plum glass button - transparent with plum tint
    plumGlassBg: "rgba(140,80,180,0.35)",
    plumGlassBgHover: "rgba(150,90,190,0.50)",
    plumGlassBorder: "rgba(200,150,220,0.30)",
    plumGlassBorderHover: "rgba(220,180,240,0.45)",
    plumGlassGlow: "rgba(180,120,200,0.20)",
    plumGlassGlowHover: "rgba(200,140,220,0.30)",
  },

  // Borders
  border: {
    glass: "rgba(255,255,255,0.12)",
  },

  // Glows
  glow: {
    primary: "#9333EA",
    secondary: "#C084FC",
  },

  // Background (aliases for convenience)
  background: {
    base: "#16001F",
  },

  // Floating Orb
  orb: {
    gradient: [
      "rgba(255,255,255,1)",
      "rgba(255,250,235,1)",
      "rgba(255,235,205,1)",
      "rgba(245,215,175,1)",
      "rgba(225,185,145,1)",
      "rgba(195,150,115,1)",
      "rgba(165,120,90,1)",
      "rgba(140,95,70,1)",
    ],
    glowInner: "rgba(255,240,220,1)",
    glowOuter: "rgba(225,185,145,0.5)",
  },
};

// ============================================
// ✨ GRADIENTS
// ============================================

export const gradients = {
  imagePurpleOverlay: `linear-gradient(
    180deg,
    ${colors.accent.purpleTintTop} 0%,
    ${colors.accent.purpleTintMid} 70%,
    ${colors.accent.purpleTintBottom} 100%
  )`,

  imageBottomFade: `linear-gradient(
    to top,
    ${colors.accent.fadeDarkest} 0%,
    ${colors.accent.fadeDark} 25%,
    ${colors.accent.fadeMedium} 45%,
    transparent 70%
  )`,

  warmButton: `radial-gradient(
    circle at 20% 0%,
    ${colors.button.warmBgStart} 0%,
    ${colors.button.warmBgEnd} 40%
  )`,

  warmButtonHover: `radial-gradient(
    circle at 20% 0%,
    rgba(255,220,190,0.35) 0%,
    rgba(246,237,227,0.18) 40%
  )`,

  floatingOrb: `radial-gradient(circle at center, ${colors.orb.gradient.join(
    ", ",
  )})`,
};

// ============================================
// 📝 TYPOGRAPHY
// ============================================

const headerShadow =
  "0 3px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)";

export const typography = {
  fonts: {
    serif: "'Playfair Display', serif",
    sansSerif: "'Inter', sans-serif",
  },

  styles: {
    // Headlines
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "30px",
      color: "#F6EDE3",
      textShadow: headerShadow,
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "20px",
      color: "#F6EDE3",
      textShadow: headerShadow,
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "18px",
      color: "#F6EDE3",
      textShadow: headerShadow,
    },

    // Body text
    body: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      color: "#F6EDE3",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    },
    bodySmall: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "12px",
      color: "rgba(200,180,210,0.75)",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    },

    // Subtitles & labels
    subtitle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      color: "rgba(200,180,210,0.75)",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    },
    label: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "12px",
      color: "rgba(200,180,210,0.65)",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    },
  },

  shadows: {
    // Softer generic text shadow
    text: "0 2px 8px rgba(0,0,0,0.8)",

    // Strong readable shadow for headings
    textStrong: headerShadow,

    // Warm glow for special hero titles (e.g. “Afterglow”)
    titleGlow:
      "0 0 18px rgba(220,170,130,0.7), 0 0 21px rgba(220,170,130,0.5), 0 0 24px rgba(220,170,130,0.3)",
  },
};

// ============================================
// 🎭 EFFECTS
// ============================================

export const effects = {
  blur: {
    card: "xl",
    button: "[18px]",
    navBar: "2xl",
  },

  shadows: {
    card: "0 2px 10px rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.45)",

    button:
      "0 2px 10px rgba(0,0,0,0.35), 0 0 18px rgba(246,237,227,0.25)",

    buttonHover:
      "0 4px 16px rgba(0,0,0,0.35), 0 0 20px rgba(246,237,227,0.40)",

    buttonHero:
      "0 2px 10px rgba(0,0,0,0.35), 0 0 20px rgba(246,237,227,0.30)",

    buttonHeroHover:
      "0 4px 16px rgba(0,0,0,0.35), 0 0 30px rgba(246,237,227,0.45)",

    warmButton:
      "0 6px 18px rgba(0,0,0,0.45), 0 0 26px rgba(246,237,227,0.25)",

    warmButtonHover:
      "0 6px 18px rgba(0,0,0,0.45), 0 0 30px rgba(246,237,227,0.35)",
  },

  radius: {
    card: "3xl",
    button: "full",
  },
};

// ============================================
// 📐 SPACING & SIZING
// ============================================

export const spacing = {
  iphone: {
    width: "390px",
    height: "844px",
    borderRadius: "55px",
    screenRadius: "45px",
  },

  navBar: {
    height: "90px",
    heightNum: 80,
  },

  orb: {
    size: 59,
    bottomOffset: 54,
  },
};