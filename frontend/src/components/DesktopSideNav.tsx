import { Home, Library, Plus, UserCircle, Sparkles, Shield, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../utils/AuthContext";

const ACTIVE_BG = "rgba(120,60,160,0.20)";
const ACTIVE_SHADOW = "inset 0 0 30px rgba(150,80,200,0.4), 0 0 15px rgba(120,60,160,0.3)";

const NAV_ITEMS: { to: string; icon: LucideIcon; label: string }[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/library", icon: Library, label: "Library" },
  { to: "/create-experience", icon: Plus, label: "Create" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/profile", icon: UserCircle, label: "Profile" },
];

function SideNavLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  const location = useLocation();
  const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
      style={{
        background: active ? ACTIVE_BG : "transparent",
        boxShadow: active ? ACTIVE_SHADOW : "none",
      }}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        style={{ color: active ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      />
      <span
        className="text-sm font-medium"
        style={{ color: active ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </Link>
  );
}

export function DesktopSideNav() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const isReviewer = role === "platform_reviewer" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <aside
      className="hidden md:flex flex-col w-60 border-r backdrop-blur-xl shrink-0 self-stretch"
      style={{
        background: "var(--color-surface-glass-card)",
        borderColor: "var(--color-surface-glass-card-border)",
        zIndex: 40,
      }}
    >
      <div className="sticky top-0 h-screen flex flex-col">
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
          {NAV_ITEMS.map((item) => (
            <SideNavLink key={item.to} {...item} />
          ))}

          {/* Role-based items */}
          {isReviewer && (
            <div
              className="pt-4 mt-4 border-t space-y-1"
              style={{ borderColor: "var(--color-surface-glass-card-border)" }}
            >
              {isAdmin && (
                <SideNavLink to="/admin" icon={Shield} label="Admin Dashboard" />
              )}
              <SideNavLink to="/reviewer" icon={Shield} label="Review Queue" />
            </div>
          )}
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
