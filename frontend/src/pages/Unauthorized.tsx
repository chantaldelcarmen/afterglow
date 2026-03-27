import { useNavigate } from "react-router-dom";
import { AppLogo } from "../components/AppLogo";
import { H2, Body } from "../components/Typography";
import { GlassButton } from "../components/GlassButton";

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <AppLogo />
      <H2 className="mt-6">Access Denied</H2>
      <Body className="mt-3" style={{ color: "var(--color-text-muted)" }}>
        You don't have permission to view this page.
      </Body>
      <GlassButton className="mt-8" onClick={() => navigate("/")}>
        Go Home
      </GlassButton>
    </div>
  );
}
