import { Body } from "./Typography";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 md:left-60 flex items-center justify-center">
      <Body style={{ color: "var(--color-text-muted)" }}>Loading...</Body>
    </div>
  );
}
