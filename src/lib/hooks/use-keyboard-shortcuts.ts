"use client";

import { useEffect, useCallback, useState } from "react";

interface KeyboardShortcuts {
	onPrevious?: () => void;
	onNext?: () => void;
	onFlag?: () => void;
	onCancel?: () => void;
	onGoToQuestion?: (index: number) => void;
	enabled?: boolean;
}

export function useKeyboardShortcuts({
	onPrevious,
	onNext,
	onFlag,
	onCancel,
	onGoToQuestion,
	enabled = true,
}: KeyboardShortcuts) {
	const [showShortcuts, setShowShortcuts] = useState(false);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return;

			// Don't trigger shortcuts when typing in inputs
			const target = event.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			if (isInput) return;

			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					onPrevious?.();
					break;
				case "ArrowRight":
				case "Enter":
					event.preventDefault();
					onNext?.();
					break;
				case "f":
				case "F":
					event.preventDefault();
					onFlag?.();
					break;
				case "Escape":
					event.preventDefault();
					onCancel?.();
					break;
				case "?":
					event.preventDefault();
					setShowShortcuts((prev) => !prev);
					break;
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					event.preventDefault();
					const questionIndex = parseInt(event.key) - 1;
					onGoToQuestion?.(questionIndex);
					break;
			}
		},
		[enabled, onPrevious, onNext, onFlag, onCancel, onGoToQuestion]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return {
		showShortcuts,
		setShowShortcuts,
	};
}

export const keyboardShortcutsList = [
	{ key: "←", description: "Vorherige Frage" },
	{ key: "→", description: "Nächste Frage" },
	{ key: "Enter", description: "Nächste Frage" },
	{ key: "F", description: "Frage markieren" },
	{ key: "1-9", description: "Zur Frage springen" },
	{ key: "Esc", description: "Quiz abbrechen" },
	{ key: "?", description: "Hilfe anzeigen" },
];

export default useKeyboardShortcuts;
