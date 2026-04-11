import { useEffect, useRef, useState, useCallback } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

interface UseInactivityTimerOptions {
  timeoutMs: number;
  warningMs: number;
  onTimeout: () => void;
}

export function useInactivityTimer({ timeoutMs, warningMs, onTimeout }: UseInactivityTimerOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningMs / 1000));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(Math.floor(warningMs / 1000));

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      let secs = Math.floor(warningMs / 1000);
      setSecondsLeft(secs);
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setSecondsLeft(secs);
      }, 1000);
    }, timeoutMs - warningMs);

    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      onTimeoutRef.current();
    }, timeoutMs);
  }, [timeoutMs, warningMs, clearAllTimers]);

  useEffect(() => {
    resetTimer();
    const handler = () => resetTimer();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [resetTimer, clearAllTimers]);

  return { showWarning, secondsLeft, resetTimer };
}
