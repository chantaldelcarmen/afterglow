import { Home, Library, Sparkles, UserCircle, Shield, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { FloatingOrb } from "./FloatingOrb";
import {
  BOTTOM_NAV_HEIGHT,
  FLOATING_ORB_BOTTOM_OFFSET,
  FLOATING_ORB_CUTOUT_CENTER_FROM_NAV_TOP,
  FLOATING_ORB_CUTOUT_RADIUS,
  FLOATING_ORB_SIZE,
} from "./floatingOrbLayout";
import { useAuth } from "../utils/AuthContext";

const ACTIVE_GLOW = "drop-shadow(0 0 8px rgba(246, 237, 227, 0.6)) drop-shadow(0 0 16px rgba(246, 237, 227, 0.4))";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
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
  const location = useLocation();
  const { role, loading } = useAuth();
  const isUploadPage = location.pathname === "/upload";

  // Default to user role if role fetch fails (better UX than no nav)
  const userRole = role || "user";

  if (loading) return null;

  // Reviewer and admin get a plain nav bar - no orb or cutout
  if (userRole === "platform_reviewer" || userRole === "admin") {
    const items = userRole === "admin"
      ? [
          { to: "/admin", icon: <LayoutDashboard size={30} strokeWidth={1.5} />, label: "Admin" },
          { to: "/reviewer", icon: <Shield size={30} strokeWidth={1.5} />, label: "Review Queue" },
          { to: "/profile", icon: <UserCircle size={30} strokeWidth={1.5} />, label: "Account" },
        ]
      : [
          { to: "/reviewer", icon: <Shield size={30} strokeWidth={1.5} />, label: "Review Queue" },
          { to: "/profile", icon: <UserCircle size={30} strokeWidth={1.5} />, label: "Account" },
        ];

    return (
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t pointer-events-auto"
        style={{
          height: `${BOTTOM_NAV_HEIGHT}px`,
          zIndex: 40,
          background: "var(--color-surface-nav)",
          borderColor: "var(--color-surface-nav-border)",
        }}
      >
        <div className="flex items-center justify-around h-full" style={{ paddingBottom: "22px" }}>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.icon}</NavLink>
          ))}
        </div>
      </div>
    );
  }

  // User role — existing layout with orb cutout
  return (
    <>
      {/* Nav bar with CSS cutout for center orb */}
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t pointer-events-auto"
        style={{
          height: `${BOTTOM_NAV_HEIGHT}px`,
          zIndex: 40,
          background: "var(--color-surface-nav)",
          borderColor: "var(--color-surface-nav-border)",
          WebkitMaskImage: `radial-gradient(circle ${FLOATING_ORB_CUTOUT_RADIUS}px at center ${FLOATING_ORB_CUTOUT_CENTER_FROM_NAV_TOP}px, transparent ${FLOATING_ORB_CUTOUT_RADIUS}px, black ${FLOATING_ORB_CUTOUT_RADIUS + 3}px)`,
          maskImage: `radial-gradient(circle ${FLOATING_ORB_CUTOUT_RADIUS}px at center ${FLOATING_ORB_CUTOUT_CENTER_FROM_NAV_TOP}px, transparent ${FLOATING_ORB_CUTOUT_RADIUS}px, black ${FLOATING_ORB_CUTOUT_RADIUS + 3}px)`,
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
          <div style={{ width: `${FLOATING_ORB_SIZE + 42}px`, flexShrink: 0 }} />

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
      <FloatingOrb
        mode={isUploadPage ? "upload" : "default"}
        orbSize={FLOATING_ORB_SIZE}
        orbBottomOffset={FLOATING_ORB_BOTTOM_OFFSET}
      />
    </>
  );
}
