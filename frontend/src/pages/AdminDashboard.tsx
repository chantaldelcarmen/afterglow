import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  UserCircle,
  LogOut,
} from "lucide-react";
import { colors, effects } from "../design-tokens";
import { H1, H2, Body, BodySmall } from "../components/Typography";

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-40 md:pb-0">
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
                  <Body style={{ fontSize: "22px" }}>7</Body>
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
                "Assigned reviewer access to 3 team members",
                "Updated sharing defaults for new experiences",
                "Reviewed 2 safety reports from the last week",
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
