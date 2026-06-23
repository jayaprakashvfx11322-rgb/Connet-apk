import { useCallback } from "react";

export default function useHapticFeedback() {
  const vibrate = useCallback((duration: number = 50) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }, []);

  return { vibrate };
}
