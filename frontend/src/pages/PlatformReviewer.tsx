import { H2, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";

export function PlatformReviewer() {
  return (
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <div className="sticky top-0 z-20 pt-8 px-6 pb-4">
        <BackButton />
      </div>
      <div className="px-6">
        <H2>Reviewer Dashboard</H2>
        <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)" }}>
          Review submitted experiences
        </BodySmall>
      </div>
    </div>
  );
}
