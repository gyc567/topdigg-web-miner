import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the input value.
 * - When value is empty string → returns immediately (no delay).
 * - Otherwise waits `delay` ms after the last change before updating.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    if (!value && value !== 0) {
      // Empty string skips debounce for perceived-instant feel
      setDebounced(value);
      return;
    }

    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
