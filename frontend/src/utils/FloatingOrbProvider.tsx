import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FloatingOrbContext } from "./floatingOrbContext";
import type { FragmentTypeCallback } from "./floatingOrbContext";

export function FloatingOrbProvider({ children }: { children: ReactNode }) {
  const [isOrbExpanded, setOrbExpanded] = useState(false);
  const [fragmentTypeCallback, setFragmentTypeCallback] = useState<FragmentTypeCallback>(null);

  const value = useMemo(
    () => ({ isOrbExpanded, setOrbExpanded, fragmentTypeCallback, setFragmentTypeCallback }),
    [isOrbExpanded, fragmentTypeCallback],
  );

  return (
    <FloatingOrbContext.Provider value={value}>
      {children}
    </FloatingOrbContext.Provider>
  );
}
