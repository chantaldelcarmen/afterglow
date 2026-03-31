import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FloatingOrbContext } from "./floatingOrbContext";
import type { FloatingOrbAction } from "./floatingOrbContext";

export function FloatingOrbProvider({ children }: { children: ReactNode }) {
  const [uploadOrbAction, setUploadOrbAction] = useState<FloatingOrbAction>(null);

  const value = useMemo(
    () => ({ uploadOrbAction, setUploadOrbAction }),
    [uploadOrbAction],
  );

  return (
    <FloatingOrbContext.Provider value={value}>
      {children}
    </FloatingOrbContext.Provider>
  );
}
