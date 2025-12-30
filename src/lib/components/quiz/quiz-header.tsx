"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utility";
import { Button } from "@/lib/components/ui/button";
import { ThemeToggle } from "@/lib/components/ui/theme";
import { X, Clock } from "lucide-react";

interface QuizHeaderProps {
	quizName: string;
	onCancelClick: () => void;
	startTime: Date;
	className?: string;
}

export function QuizHeader({ quizName, onCancelClick, startTime, className }: QuizHeaderProps) {
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
			setElapsedTime(elapsed);
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<header className={cn("flex items-center justify-between px-4 py-3 border-b bg-card", className)}>
			<div className="flex items-center gap-4 min-w-0">
				<h1 className="text-lg font-semibold truncate">{quizName}</h1>
			</div>

			<div className="flex items-center gap-2 sm:gap-4">
				{/* Timer */}
				<div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
					<Clock className="size-4" />
					<span className="font-mono">{formatTime(elapsedTime)}</span>
				</div>

				{/* Cancel Button */}
				<Button variant="ghost" size="sm" onClick={onCancelClick}>
					<X className="size-4 sm:mr-1" />
					<span className="hidden sm:inline">Abbrechen</span>
				</Button>

				{/* Theme Toggle */}
				<ThemeToggle />
			</div>
		</header>
	);
}

export default QuizHeader;
