"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface TimerContext {
	startTime: Date;
	getElapsedTime: () => number;
	pauseTimer: () => void;
	resumeTimer: () => void;
	resetTimer: () => void;
	isTimerPaused: boolean;
}

interface TimerProviderProps {
	children: React.ReactNode;
	storageKey?: string;
}

const Context = createContext<TimerContext | undefined>(undefined);

export function TimerProvider({ children, storageKey = "quiz-timer" }: TimerProviderProps) {
	const [startTime, setStartTime] = useState<Date>(() => new Date());
	const [pausedAt, setPausedAt] = useState<Date | null>(null);
	const [totalPausedTime, setTotalPausedTime] = useState(0);

	// Use refs to avoid stale closures in callbacks
	const pausedAtRef = useRef(pausedAt);
	const startTimeRef = useRef(startTime);
	const totalPausedTimeRef = useRef(totalPausedTime);

	// Keep refs in sync with state
	useEffect(() => {
		pausedAtRef.current = pausedAt;
	}, [pausedAt]);

	useEffect(() => {
		startTimeRef.current = startTime;
	}, [startTime]);

	useEffect(() => {
		totalPausedTimeRef.current = totalPausedTime;
	}, [totalPausedTime]);

	// Load timer state from sessionStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = sessionStorage.getItem(storageKey);
			if (stored) {
				try {
					const data = JSON.parse(stored);
					setStartTime(new Date(data.startTime));
					setPausedAt(data.pausedAt ? new Date(data.pausedAt) : null);
					setTotalPausedTime(data.totalPausedTime || 0);
				} catch (e) {
					console.error("Failed to parse stored timer state");
				}
			}
		}
	}, [storageKey]);

	// Persist timer state to sessionStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem(storageKey, JSON.stringify({
				startTime: startTime.toISOString(),
				pausedAt: pausedAt?.toISOString() || null,
				totalPausedTime,
			}));
		}
	}, [startTime, pausedAt, totalPausedTime, storageKey]);

	// Stable callback using refs - no dependencies needed
	const getElapsedTime = useCallback(() => {
		const now = pausedAtRef.current || new Date();
		return Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000) - totalPausedTimeRef.current;
	}, []);

	// Stable callback using refs - no dependencies needed
	const pauseTimer = useCallback(() => {
		if (!pausedAtRef.current) {
			setPausedAt(new Date());
		}
	}, []);

	// Stable callback using refs - no dependencies needed
	const resumeTimer = useCallback(() => {
		if (pausedAtRef.current) {
			const pauseDuration = Math.floor((new Date().getTime() - pausedAtRef.current.getTime()) / 1000);
			setTotalPausedTime(prev => prev + pauseDuration);
			setPausedAt(null);
		}
	}, []);

	// Reset timer to initial state
	const resetTimer = useCallback(() => {
		setStartTime(new Date());
		setPausedAt(null);
		setTotalPausedTime(0);
		if (typeof window !== "undefined") {
			sessionStorage.removeItem(storageKey);
		}
	}, [storageKey]);

	const isTimerPaused = pausedAt !== null;

	const contextValue: TimerContext = useMemo(() => ({
		startTime,
		getElapsedTime,
		pauseTimer,
		resumeTimer,
		resetTimer,
		isTimerPaused,
	}), [
		startTime,
		getElapsedTime,
		pauseTimer,
		resumeTimer,
		resetTimer,
		isTimerPaused,
	]);

	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
}

export function useTimerContext() {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useTimerContext must be used within a TimerProvider");
	}
	return context;
}
