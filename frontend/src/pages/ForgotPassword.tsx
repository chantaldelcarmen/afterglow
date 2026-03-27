import { AppLogo } from "../components/AppLogo";
import { H2, BodySmall } from "../components/Typography";

export function ForgotPassword() {
  return (
    <div className="h-full flex flex-col px-6 pb-8 overflow-y-auto">
      <AppLogo />
      <H2>Reset Password</H2>
      <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)" }}>
        Coming soon
      </BodySmall>
    </div>
  );
}
