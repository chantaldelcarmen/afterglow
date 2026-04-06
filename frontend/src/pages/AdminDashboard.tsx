import { AppLogo } from "../components/AppLogo";
import { H2, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";

export function AdminDashboard() {
  return (
    <div className="h-full flex flex-col px-6 pb-8 overflow-y-auto">
      <AppLogo />
      <BackButton className="mb-4" />
      <H2>Admin Dashboard</H2>
      <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)" }}>
        Platform management
      </BodySmall>
    </div>
  );
}
