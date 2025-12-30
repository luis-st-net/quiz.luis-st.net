"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface UseConfettiOptions {
	enabled?: boolean;
	triggerOnMount?: boolean;
}

export function useConfetti({ enabled = true, triggerOnMount = true }: UseConfettiOptions = {}) {
	const fireConfetti = useCallback(() => {
		if (!enabled) return;

		// Fire multiple confetti bursts
		const count = 200;
		const defaults = {
			origin: { y: 0.7 },
			zIndex: 9999,
		};

		function fire(particleRatio: number, opts: confetti.Options) {
			confetti({
				...defaults,
				...opts,
				particleCount: Math.floor(count * particleRatio),
			});
		}

		// Fire in sequence for a more impressive effect
		fire(0.25, {
			spread: 26,
			startVelocity: 55,
		});

		fire(0.2, {
			spread: 60,
		});

		fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8,
		});

		fire(0.1, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2,
		});

		fire(0.1, {
			spread: 120,
			startVelocity: 45,
		});
	}, [enabled]);

	useEffect(() => {
		if (triggerOnMount) {
			// Small delay to let the page render first
			const timer = setTimeout(fireConfetti, 300);
			return () => clearTimeout(timer);
		}
	}, [triggerOnMount, fireConfetti]);

	return { fireConfetti };
}

export default useConfetti;
