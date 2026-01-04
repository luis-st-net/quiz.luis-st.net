"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseResizableSidebarOptions {
	minWidth?: number;
	maxWidth?: number;
	defaultWidth?: number;
	storageKey?: string;
}

interface UseResizableSidebarReturn {
	width: number;
	isResizing: boolean;
	handleMouseDown: (e: React.MouseEvent) => void;
	resetWidth: () => void;
}

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MAX_WIDTH = 400;
const DEFAULT_WIDTH = 256; // 16rem = 256px

export function useResizableSidebar({
	minWidth = DEFAULT_MIN_WIDTH,
	maxWidth = DEFAULT_MAX_WIDTH,
	defaultWidth = DEFAULT_WIDTH,
	storageKey = "sidebar-width",
}: UseResizableSidebarOptions = {}): UseResizableSidebarReturn {
	const [width, setWidth] = useState(defaultWidth);
	const [isResizing, setIsResizing] = useState(false);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);

	// Load saved width from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved) {
			const parsedWidth = parseInt(saved, 10);
			if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
				setWidth(parsedWidth);
			}
		}
	}, [storageKey, minWidth, maxWidth]);

	// Save width to localStorage when it changes
	useEffect(() => {
		if (!isResizing) {
			localStorage.setItem(storageKey, width.toString());
		}
	}, [width, isResizing, storageKey]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			startXRef.current = e.clientX;
			startWidthRef.current = width;
			setIsResizing(true);
		},
		[width]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = e.clientX - startXRef.current;
			const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX));
			setWidth(newWidth);
		},
		[isResizing, minWidth, maxWidth]
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
	}, []);

	// Add/remove global event listeners for mouse move and up
	useEffect(() => {
		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			// Prevent text selection while resizing
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	const resetWidth = useCallback(() => {
		setWidth(defaultWidth);
		localStorage.setItem(storageKey, defaultWidth.toString());
	}, [defaultWidth, storageKey]);

	return {
		width,
		isResizing,
		handleMouseDown,
		resetWidth,
	};
}
