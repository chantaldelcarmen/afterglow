import { Home, Library, Sparkles, UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_HEIGHT = 80;
const ORB_SIZE = 59;
const ORB_BOTTOM_OFFSET = 54;
const ORB_RADIUS = ORB_SIZE / 2;
const CUTOUT_RADIUS = ORB_RADIUS + 10;
const CUTOUT_CENTER_FROM_NAV_TOP = NAV_HEIGHT - (ORB_BOTTOM_OFFSET + ORB_RADIUS);

const ACTIVE_GLOW = "drop-shadow(0 0 8px rgba(246, 237, 227, 0.6)) drop-shadow(0 0 16px rgba(246, 237, 227, 0.4))";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className="p-2 transition-all duration-300"
      style={{
        color: active ? "var(--color-text-nav-active)" : "var(--color-text-nav-inactive)",
        filter: active ? ACTIVE_GLOW : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--color-text-nav-active)";
        e.currentTarget.style.filter = ACTIVE_GLOW;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = active ? "var(--color-text-nav-active)" : "var(--color-text-nav-inactive)";
        e.currentTarget.style.filter = active ? ACTIVE_GLOW : "none";
      }}
    >
      {children}
    </Link>
  );
}

export function BottomNav() {
  return (
    <>
      {/* Nav bar with CSS cutout for center orb */}
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t pointer-events-auto"
        style={{
          height: `${NAV_HEIGHT}px`,
          zIndex: 40,
          background: "var(--color-surface-nav)",
          borderColor: "var(--color-surface-nav-border)",
          WebkitMaskImage: `radial-gradient(circle ${CUTOUT_RADIUS}px at center ${CUTOUT_CENTER_FROM_NAV_TOP}px, transparent ${CUTOUT_RADIUS}px, black ${CUTOUT_RADIUS + 3}px)`,
          maskImage: `radial-gradient(circle ${CUTOUT_RADIUS}px at center ${CUTOUT_CENTER_FROM_NAV_TOP}px, transparent ${CUTOUT_RADIUS}px, black ${CUTOUT_RADIUS + 3}px)`,
        }}
      >
        <div className="flex items-center h-full" style={{ paddingBottom: "22px" }}>
          {/* Left icons */}
          <div className="flex items-center justify-around flex-1">
            <NavLink to="/">
              <Home size={30} strokeWidth={1.5} />
            </NavLink>
            <NavLink to="/library">
              <Library size={30} strokeWidth={1.5} />
            </NavLink>
          </div>

          {/* Spacer for center orb */}
          <div style={{ width: `${ORB_SIZE + 42}px`, flexShrink: 0 }} />

          {/* Right icons */}
          <div className="flex items-center justify-around flex-1">
            <NavLink to="/insights">
              <Sparkles size={30} strokeWidth={1.5} />
            </NavLink>
            <NavLink to="/profile">
              <UserCircle size={30} strokeWidth={1.5} />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Shadow behind orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${ORB_BOTTOM_OFFSET - 6}px`,
          zIndex: 41,
          width: `${ORB_SIZE}px`,
          height: "12px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 30%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Large blurred glow behind orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${ORB_BOTTOM_OFFSET}px`,
          zIndex: 41,
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(255, 240, 220, 1) 0%, rgba(250, 225, 200, 0.95) 20%, rgba(245, 210, 175, 0.8) 40%, rgba(225, 185, 145, 0.5) 65%, transparent 100%)",
          filter: "blur(45px)",
        }}
      />

      {/* Dark shadow ring around orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${ORB_BOTTOM_OFFSET}px`,
          zIndex: 42,
          width: `${ORB_SIZE + 24}px`,
          height: `${ORB_SIZE + 24}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)",
          filter: "blur(12px)",
        }}
      />

      {/* Orb button */}
      <Link
        to="/create-experience"
        className="fixed rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-105"
        style={{
          width: `${ORB_SIZE}px`,
          height: `${ORB_SIZE}px`,
          bottom: `${ORB_BOTTOM_OFFSET}px`,
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 43,
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 235, 1) 15%, rgba(255, 235, 205, 1) 28%, rgba(245, 215, 175, 1) 42%, rgba(225, 185, 145, 1) 58%, rgba(195, 150, 115, 1) 72%, rgba(165, 120, 90, 1) 85%, rgba(140, 95, 70, 1) 100%)",
          boxShadow: "inset 0 2px 20px rgba(255, 255, 255, 0.9), inset 0 -2px 15px rgba(140, 95, 70, 0.4), inset 0 0 30px rgba(255, 245, 225, 0.3), 0 0 20px rgba(205, 160, 135, 0.35), 0 0 35px rgba(195, 150, 125, 0.25), 0 8px 20px rgba(0, 0, 0, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translate(-50%, 0) scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translate(-50%, 0) scale(1)";
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#321432" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </>
  );
}