import { SubpageHeader } from "../components/SubpageHeader";

export function AdminDashboard() {
  return (
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <SubpageHeader title="Admin Dashboard" subtitle="Platform management" />
    </div>
  );
}
