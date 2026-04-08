import { H2, BodySmall } from "../components/Typography";
import { SubpageHeader } from "../components/SubpageHeader";

export function PlatformReviewer() {
  return (
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <SubpageHeader title="Reviewer Dashboard" subtitle="Review submitted experiences" />
    </div>
  );
}
