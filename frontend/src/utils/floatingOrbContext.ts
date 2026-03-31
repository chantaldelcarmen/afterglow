import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type FloatingOrbAction = (() => void) | null;

export interface FloatingOrbContextType {
  uploadOrbAction: FloatingOrbAction;
  setUploadOrbAction: Dispatch<SetStateAction<FloatingOrbAction>>;
}

export const FloatingOrbContext = createContext<FloatingOrbContextType | null>(null);

export function useFloatingOrb() {
  const context = useContext(FloatingOrbContext);

  if (!context) {
    throw new Error("useFloatingOrb must be used within a FloatingOrbProvider");
  }

  return context;
}
