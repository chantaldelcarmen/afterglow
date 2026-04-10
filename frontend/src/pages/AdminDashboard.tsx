import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Ban,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  UserCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { colors, effects } from "../design-tokens";
import { H1, H2, Body, BodySmall } from "../components/Typography";
import { useAuth } from "../utils/AuthContext";

type UserEntry = {
  id: string;
  username: string;
  email: string;
  role: "experience_creator" | "platform_reviewer";
  suspended: boolean;
};

const MOCK_USERS: UserEntry[] = [
  { id: "u1", username: "alex", email: "alex@afterglow.dev", role: "experience_creator", suspended: false },
  { id: "u2", username: "sam", email: "sam@afterglow.dev", role: "platform_reviewer", suspended: false },
  { id: "u3", username: "jordan", email: "jordan@afterglow.dev", role: "platform_reviewer", suspended: false },
  { id: "u4", username: "riley", email: "riley@afterglow.dev", role: "experience_creator", suspended: false },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserEntry[]>(MOCK_USERS);
  const [activityLog, setActivityLog] = useState<string[]>([
    "Assigned reviewer access to 2 team members",
    "Updated sharing defaults for new experiences",
    "Reviewed 7 safety reports from the last week",
  ]);


  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  const handleToggleRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const newRole =
          u.role === "platform_reviewer" ? "experience_creator" : "platform_reviewer";
        setActivityLog((log) => [
          `Changed @${u.username} role to ${newRole.replace("_", " ")}`,
          ...log.slice(0, 4),
        ]);
        return { ...u, role: newRole };
      })
    );
  };
 
  const handleToggleSuspend = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const action = u.suspended ? "Reinstated" : "Suspended";
        setActivityLog((log) => [
          `${action} @${u.username}`,
          ...log.slice(0, 4),
        ]);
        return { ...u, suspended: !u.suspended };
      })
    );
  };
 
  const handleResetUsers = () => {
    setUsers(MOCK_USERS);
    setActivityLog((log) => ["Reset user list to defaults", ...log.slice(0, 4)]);
  };
 
  if (!authLoading && role !== "admin") {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 overflow-y-auto px-6 pb-40 md:pb-0 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "50ms",
        }}
      >
        <div className="space-y-8 md:space-y-12">
          {/* Header with Navigation */}
          <div className="flex items-start justify-between mb-2 pt-6">
            <div className="flex-1">
              <H1>Admin Dashboard</H1>
              <BodySmall
                style={{
                  color: colors.text.mutedDim,
                  fontSize: "13px",
                }}
              >
                Internal controls for roles, safety, and platform health
              </BodySmall>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 mt-[42px] md:mt-[50px]">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300"
                style={{
                  background: colors.surface.glass,
                  borderColor: colors.button.warmBorder,
                  boxShadow: effects.shadows.button,
                }}
                onClick={() => navigate("/profile")}
                title="Profile"
              >
                <UserCircle size={18} style={{ color: colors.text.primary }} />
              </button>

              <button
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300"
                style={{
                  background: colors.surface.glass,
                  borderColor: colors.button.warmBorder,
                  boxShadow: effects.shadows.button,
                }}
                onClick={() => navigate("/logout")}
                title="Logout"
              >
                <LogOut
                  size={18}
                  style={{ color: "#F5F5F0", strokeWidth: 2.5 }}
                />
              </button>
            </div>
          </div>

          {/* System Overview */}
          <div className="space-y-3">
            <H2>System Overview</H2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Card: Active Creators */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <BodySmall
                  style={{
                    color: colors.text.mutedDim,
                    fontSize: "12px",
                  }}
                >
                  Active Creators
                </BodySmall>
                <div className="mt-1 flex items-baseline gap-1">
                  <Body style={{ fontSize: "22px" }}>128</Body>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "11px",
                    }}
                  >
                    last 30 days
                  </BodySmall>
                </div>
              </div>

              {/* Card: Items in Review */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <BodySmall
                  style={{
                    color: colors.text.mutedDim,
                    fontSize: "12px",
                  }}
                >
                  Items in review
                </BodySmall>
                <div className="mt-1 flex items-baseline gap-1">
                  <Body style={{ fontSize: "22px" }}>2</Body>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "11px",
                    }}
                  >
                    pending decisions
                  </BodySmall>
                </div>
              </div>

              {/* Card: Safety Signals */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4 flex items-start gap-2"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <AlertTriangle
                  size={18}
                  style={{ color: colors.accent.coral, marginTop: 2 }}
                />
                <div>
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Safety signals
                  </BodySmall>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "11px",
                    }}
                  >
                    2 recent reports related to sharing settings
                  </BodySmall>
                </div>
              </div>

              {/* Card: Platform Health */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4 flex items-start gap-2"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <Activity
                  size={18}
                  style={{ color: colors.accent.lavender, marginTop: 2 }}
                />
                <div>
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Platform health
                  </BodySmall>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "11px",
                    }}
                  >
                    All services operational
                  </BodySmall>
                </div>
              </div>
            </div>
          </div>

          {/* Roles and Access */}
          <div className="space-y-3">
            <H2>Roles and access</H2>
            <div className="space-y-3">
              {/* Experience Creator */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4 flex gap-3"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <Users
                  size={20}
                  style={{ color: colors.text.primary, marginTop: 4 }}
                />
                <div>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "13px",
                    }}
                  >
                    Experience Creator
                  </BodySmall>
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Can create private experiences, add fragments, and write
                    reflections. Content is private by default and never public.
                  </BodySmall>
                </div>
              </div>

              {/* Platform Reviewer */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4 flex gap-3"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <Shield
                  size={20}
                  style={{ color: colors.accent.lavender, marginTop: 4 }}
                />
                <div>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "13px",
                    }}
                  >
                    Platform Reviewer
                  </BodySmall>
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Reviews metadata only. Never sees raw photos or videos.
                    Approves or escalates items that affect safety, sharing, or
                    platform policy.
                  </BodySmall>

                  <button
                    className="mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs backdrop-blur-xl"
                    style={{
                      background: colors.surface.glass,
                      borderColor: colors.button.warmBorder,
                    }}
                    onClick={() => navigate("/reviewer")}
                  >
                    <BodySmall
                      style={{
                        color: colors.text.primary,
                        fontSize: "11px",
                      }}
                    >
                      Open review queue
                    </BodySmall>
                  </button>
                </div>
              </div>

              {/* Admin */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-4 flex gap-3"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <CheckCircle2
                  size={20}
                  style={{ color: colors.accent.gold, marginTop: 4 }}
                />
                <div>
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "13px",
                    }}
                  >
                    Admin
                  </BodySmall>
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Manages roles, high level safety settings, and platform wide
                    controls. Does not override private content by default.
                  </BodySmall>
                </div>
              </div>
            </div>
          </div>

          {/* User Management - Admin only */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <H2>User management</H2>
                <BodySmall style={{ color: colors.text.mutedDim, fontSize: "12px" }}>
                  Assign roles and manage platform access
                </BodySmall>
              </div>
              <button
                onClick={handleResetUsers}
                className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                style={{
                  borderColor: colors.button.warmBorder,
                  color: colors.text.muted,
                  boxShadow: `0 0 10px ${colors.button.warmGlow}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.text.muted;
                }}
                title="Reset demo"
              >
                <RefreshCw size={11} />
                Reset
              </button>
            </div>
 
            <div
              className="rounded-2xl border backdrop-blur-xl overflow-hidden"
              style={{
                background: colors.surface.glassCard,
                borderColor: colors.surface.glassCardBorder,
                boxShadow: effects.shadows.card,
              }}
            >
              {users.map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3 transition-all duration-200"
                  style={{
                    borderBottom:
                      i < users.length - 1
                        ? `1px solid ${colors.surface.glassCardBorder}`
                        : undefined,
                    opacity: user.suspended ? 0.5 : 1,
                  }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <UserCircle size={18} style={{ color: colors.text.muted }} />
                    <div>
                      <Body
                        style={{
                          fontSize: "13px",
                          textDecoration: user.suspended ? "line-through" : "none",
                          color: user.suspended ? colors.text.mutedDim : colors.text.primary,
                        }}
                      >
                        @{user.username}
                      </Body>
                      <BodySmall style={{ color: colors.text.mutedDim, fontSize: "11px" }}>
                        {user.email}
                      </BodySmall>
                    </div>
                  </div>
 
                  {/* Role badge + actions */}
                  <div className="flex items-center gap-2">
                    {/* Clickable role badge — toggles role */}
                    <button
                      onClick={() => !user.suspended && handleToggleRole(user.id)}
                      disabled={user.suspended}
                      className="px-2 py-0.5 rounded-full border transition-all duration-200"
                      style={{
                        background: colors.surface.glass,
                        borderColor:
                          user.role === "platform_reviewer"
                            ? colors.accent.lavender
                            : colors.button.warmBorder,
                        color:
                          user.role === "platform_reviewer"
                            ? colors.accent.lavender
                            : colors.text.muted,
                        fontSize: "11px",
                        cursor: user.suspended ? "not-allowed" : "pointer",
                      }}
                      title={user.suspended ? "Reinstate user first" : "Click to toggle role"}
                    >
                      {user.role === "platform_reviewer" ? "reviewer" : "creator"}
                    </button>
 
                    {/* Suspend / reinstate button */}
                    <button
                      onClick={() => handleToggleSuspend(user.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200"
                      style={{
                        background: colors.surface.glass,
                        borderColor: user.suspended
                          ? colors.accent.coral
                          : colors.surface.glassCardBorder,
                      }}
                      title={user.suspended ? "Reinstate user" : "Suspend user"}
                    >
                      <Ban
                        size={13}
                        style={{
                          color: user.suspended ? colors.accent.coral : colors.text.muted,
                        }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Controls */}
            <div className="space-y-3">
              <H2>Admin controls</H2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Manage reviewer access */}
                <div
                  className="rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 cursor-pointer"
                  style={{
                    background: colors.surface.glassCard,
                    borderColor: colors.surface.glassCardBorder,
                    boxShadow: effects.shadows.card,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.button.warmBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.surface.glassCardBorder;
                  }}
                >
                  <Body style={{ fontSize: "15px" }}>
                    Manage reviewer access
                  </Body>

                  <BodySmall
                    className="mt-1"
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    Assign or remove reviewer privileges for team members
                  </BodySmall>
                </div>

                {/* Platform settings */}
                <div
                  className="rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 cursor-pointer"
                  style={{
                    background: colors.surface.glassCard,
                    borderColor: colors.surface.glassCardBorder,
                    boxShadow: effects.shadows.card,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.button.warmBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.surface.glassCardBorder;
                  }}
                >
                  <Body style={{ fontSize: "15px" }}>
                    Platform settings
                  </Body>

                  <BodySmall
                    className="mt-1"
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "12px",
                    }}
                  >
                    View safety defaults and platform-wide configuration
                  </BodySmall>
                </div>
              </div>
            </div>

          {/* Recent activity */}
          <div className="space-y-3">
            <H2>Recent admin activity</H2>
            <div
              className="rounded-2xl border backdrop-blur-xl p-4 space-y-2"
              style={{
                background: colors.surface.glassCard,
                borderColor: colors.surface.glassCardBorder,
                boxShadow: effects.shadows.card,
              }}
            >
              {[
                "Assigned reviewer access to 2 team members",
                "Updated sharing defaults for new experiences",
                "Reviewed 7 safety reports from the last week",
              ].map((item, index) => (
                <div key={index} className="flex gap-2">
                  <div
                    className="mt-1 w-1.5 h-1.5 rounded-full"
                    style={{
                      background: colors.accent.lavender,
                    }}
                  />
                  <BodySmall
                    style={{
                      color: colors.text.muted,
                      fontSize: "12px",
                    }}
                  >
                    {item}
                  </BodySmall>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
