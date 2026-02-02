import { useCallback, useEffect, useState } from "react";

export function useConfetti() {
  const [confettiLoaded, setConfettiLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import confetti
    import("canvas-confetti")
      .then(() => setConfettiLoaded(true))
      .catch(() => setConfettiLoaded(false));
  }, []);

  const triggerConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2d6e55', '#10b981', '#059669', '#34d399', '#fbbf24'],
      });

      // Second burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#2d6e55', '#10b981', '#059669'],
        });
      }, 150);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2d6e55', '#10b981', '#059669'],
        });
      }, 300);

    } catch (err) {
      console.debug("Confetti not available:", err);
    }
  }, []);

  return { triggerConfetti, confettiLoaded };
}
