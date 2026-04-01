import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type FragmentType = "photo" | "video" | "text";
export type FragmentTypeCallback = ((type: FragmentType) => void) | null;

export interface FloatingOrbContextType {
  isOrbExpanded: boolean;
  setOrbExpanded: Dispatch<SetStateAction<boolean>>;
  fragmentTypeCallback: FragmentTypeCallback;
  setFragmentTypeCallback: Dispatch<SetStateAction<FragmentTypeCallback>>;
}

export const FloatingOrbContext = createContext<FloatingOrbContextType | null>(null);

export function useFloatingOrb() {
  const context = useContext(FloatingOrbContext);

  if (!context) {
    throw new Error("useFloatingOrb must be used within a FloatingOrbProvider");
  }

  return context;
}
