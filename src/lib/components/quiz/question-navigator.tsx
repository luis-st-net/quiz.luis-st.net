"use client";

import React from "react";
import { cn } from "@/lib/utility";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { Button } from "@/lib/components/ui/button";
import { Progress } from "@/lib/components/ui/progress";
import { ScrollArea } from "@/lib/components/ui/scroll-area";
import { Flag, ClipboardList } from "lucide-react";

interface QuestionNavigatorProps {
	onReviewClick: () => void;
	className?: string;
}

export function QuestionNavigator({ onReviewClick, className }: QuestionNavigatorProps) {
	const {
		questions,
		currentQuestionIndex,
		goToQuestion,
		hasAnswer,
		isQuestionFlagged,
		flaggedQuestions,
		getNumberOfAnsweredQuestions,
	} = useQuestionContext();

	const totalQuestions = questions.length;
	const answeredCount = getNumberOfAnsweredQuestions();
	const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);
	const flaggedCount = flaggedQuestions.size;

	return (
		<div className={cn("flex flex-col h-full bg-card border-r", className)}>
			{/* Progress Section */}
			<div className="p-4 border-b space-y-3">
				<span className="font-medium text-sm">Fortschritt</span>
				<Progress value={progressPercentage} className="h-2" />
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>{answeredCount}/{totalQuestions} beantwortet</span>
					<span>{progressPercentage}%</span>
				</div>
			</div>

			{/* Question Grid */}
			<ScrollArea className="flex-1">
				<div className="p-4">
					<div className="grid grid-cols-4 gap-2">
						{questions.map((question, index) => {
							const isAnswered = hasAnswer(question.id);
							const isFlagged = isQuestionFlagged(question.id);
							const isCurrent = currentQuestionIndex === index;

							return (
								<QuestionButton
									key={question.id}
									questionNumber={index + 1}
									isAnswered={isAnswered}
									isFlagged={isFlagged}
									isCurrent={isCurrent}
									onClick={() => goToQuestion(index)}
								/>
							);
						})}
					</div>
				</div>
			</ScrollArea>

			{/* Footer with Flagged Count and Review Button */}
			<div className="p-4 border-t space-y-3">
				{flaggedCount > 0 && (
					<div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
						<Flag className="size-4" />
						<span>{flaggedCount} markiert</span>
					</div>
				)}
				<Button onClick={onReviewClick} variant="outline" className="w-full">
					<ClipboardList className="size-4 mr-2" />
					Antworten überprüfen
				</Button>
			</div>
		</div>
	);
}

interface QuestionButtonProps {
	questionNumber: number;
	isAnswered: boolean;
	isFlagged: boolean;
	isCurrent: boolean;
	onClick: () => void;
}

function QuestionButton({
	questionNumber,
	isAnswered,
	isFlagged,
	isCurrent,
	onClick,
}: QuestionButtonProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"relative aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all",
				"hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				{
					// Current question - blue border
					"ring-2 ring-primary ring-offset-2": isCurrent,
					// Answered - green background (always when answered, including current)
					"bg-green-500/20 text-green-700 dark:text-green-400": isAnswered,
					// Not answered - gray/muted (only when not current)
					"bg-muted text-muted-foreground": !isAnswered && !isCurrent,
				}
			)}
		>
			{questionNumber}
			{/* Flag indicator */}
			{isFlagged && (
				<span className="absolute -top-1 -right-1 size-3 bg-amber-500 rounded-full flex items-center justify-center">
					<Flag className="size-2 text-white" />
				</span>
			)}
		</button>
	);
}

// Legend component for explaining colors
export function QuestionNavigatorLegend() {
	return (
		<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
			<div className="flex items-center gap-1.5">
				<div className="size-3 rounded bg-green-500/20 border border-green-500/50" />
				<span>Beantwortet</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="size-3 rounded bg-muted border" />
				<span>Nicht beantwortet</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="size-3 rounded border-2 border-primary" />
				<span>Aktuell</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="size-3 rounded bg-amber-500" />
				<span>Markiert</span>
			</div>
		</div>
	);
}

export default QuestionNavigator;
