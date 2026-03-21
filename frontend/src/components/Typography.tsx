import type { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function H1({ children, className = "", style }: TypographyProps) {
  return (
    <h1
      className={`font-serif text-h1 md:text-[40px] text-text-primary pt-1 ${className}`}
      style={{ textShadow: "var(--shadow-text-strong)", ...style }}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "", style }: TypographyProps) {
  return (
    <h2
      className={`font-serif text-h2 md:text-[26px] text-text-primary ${className}`}
      style={{ textShadow: "var(--shadow-text-strong)", ...style }}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "", style }: TypographyProps) {
  return (
    <h3
      className={`font-serif text-h3 text-text-primary ${className}`}
      style={{ textShadow: "var(--shadow-text-strong)", ...style }}
    >
      {children}
    </h3>
  );
}

export function Body({ children, className = "", style }: TypographyProps) {
  return (
    <p
      className={`font-sans text-body text-text-primary ${className}`}
      style={{ textShadow: "var(--shadow-text)", ...style }}
    >
      {children}
    </p>
  );
}

export function BodySmall({ children, className = "", style }: TypographyProps) {
  return (
    <p
      className={`font-sans text-body-sm text-text-muted ${className}`}
      style={{ textShadow: "var(--shadow-text)", ...style }}
    >
      {children}
    </p>
  );
}

export function Subtitle({ children, className = "", style }: TypographyProps) {
  return (
    <p
      className={`font-sans text-body text-text-muted ${className}`}
      style={{ textShadow: "var(--shadow-text)", ...style }}
    >
      {children}
    </p>
  );
}

export function Label({ children, className = "", style }: TypographyProps) {
  return (
    <p
      className={`font-sans text-body-sm text-text-muted-dim ${className}`}
      style={{ textShadow: "var(--shadow-text)", ...style }}
    >
      {children}
    </p>
  );
}
