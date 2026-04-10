import { Home, Library, Plus, UserCircle, Sparkles, Shield, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { useState } from "react";

const ACTIVE_BG = "rgba(120,60,160,0.20)";
const ACTIVE_SHADOW = "inset 0 0 30px rgba(150,80,200,0.4), 0 0 15px rgba(120,60,160,0.3)";

type NavItem = { to: string; icon: LucideIcon; label: string };

const USER_NAV_ITEMS: NavItem[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/library", icon: Library, label: "Library" },
  { to: "/create-experience", icon: Plus, label: "Create" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/profile", icon: UserCircle, label: "Account" },
];

// platform_reviewer sees only their relevant routes
const REVIEWER_NAV_ITEMS: NavItem[] = [
  { to: "/reviewer", icon: Shield, label: "Review Queue" },
  { to: "/profile", icon: UserCircle, label: "Account" },
];

// admin gets their dashboard + reviewer access + profile
const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Admin Dashboard" },
  { to: "/reviewer", icon: Shield, label: "Review Queue" },
  { to: "/profile", icon: UserCircle, label: "Account" },
];

function SideNavLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  const location = useLocation();
  const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
      style={{
        background: active ? ACTIVE_BG : isHovered ? "rgba(120,60,160,0.10)" : "transparent",
        boxShadow: active && isHovered
          ? "inset 0 0 30px rgba(150,80,200,0.5), 0 0 20px rgba(120,60,160,0.4)" // brighter when active + hovered
          : active
            ? ACTIVE_SHADOW
            : isHovered
              ? "inset 0 0 20px rgba(150,80,200,0.15), 0 0 8px rgba(120,60,160,0.15)"
              : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        style={{ color: active || isHovered ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      />
      <span
        className="text-sm font-medium"
        style={{ color: active || isHovered ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </Link>
  );
}

export function DesktopSideNav() {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Default to user role if role fetch fails (better UX than no nav)
  const userRole = role || "user";

  if (!userRole) return null;

  const navItems = userRole === "admin" ? ADMIN_NAV_ITEMS
        : userRole === "platform_reviewer" ? REVIEWER_NAV_ITEMS
        : USER_NAV_ITEMS;

  return (
    <aside
      className="hidden md:flex flex-col w-60 border-r backdrop-blur-xl fixed left-0 top-0 h-screen"
      style={{
        background: "rgba(18,12,24,0.55)",
        borderColor: "var(--color-surface-nav-border)",
        zIndex: 40,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-8">
          <h1
            className="text-4xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-text-title-glow)",
              textShadow: "var(--shadow-title-glow)",
            }}
          >
            Afterglow
          </h1>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <SideNavLink key={item.to} {...item} />
          ))}

        </nav>

        {/* Footer */}
        <div className="px-4 py-6">
          <button
            onClick={() => navigate("/logout")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            <LogOut size={20} strokeWidth={1.5} style={{ color: "inherit" }} />
            <span className="text-sm font-medium" style={{ color: "inherit" }}>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
