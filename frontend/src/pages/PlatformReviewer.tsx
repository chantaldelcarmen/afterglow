import { H2, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";

export function PlatformReviewer() {
  return (
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <div className="sticky top-0 z-20 pt-6 pb-4 px-6">
        <div className="relative flex items-center justify-center mb-1">
          <div className="absolute left-0"><BackButton /></div>
          <H2>Reviewer Dashboard</H2>
        </div>
        <BodySmall className="text-center mt-1" style={{ color: "var(--color-text-muted-dim)" }}>
          Review submitted experiences
        </BodySmall>
      </div>
    </div>
  );
}
