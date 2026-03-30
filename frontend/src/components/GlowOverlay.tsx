/**
 * Reusable inner glow overlay for cards
 * Creates a subtle radial gradient glow at the top of cards
 */

interface GlowOverlayProps {
  borderRadius?: string;
}

export const GlowOverlay = ({ borderRadius = "rounded-3xl" }: GlowOverlayProps) => {
  return (
    <div
      className={`absolute inset-0 ${borderRadius} opacity-30 pointer-events-none`}
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
      }}
    />
  );
};