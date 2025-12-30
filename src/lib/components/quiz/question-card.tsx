"use client";

import React from "react";
import { cn } from "@/lib/utility";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { Card, CardContent, CardFooter, CardHeader } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import {
	ChevronLeft,
	ChevronRight,
	Flag,
	ToggleLeft,
	Hash,
	Type,
	CircleDot,
	CheckSquare,
	ListOrdered,
	Link2,
} from "lucide-react";
import {
	isTrueFalseQuestion,
	isNumericQuestion,
	isTextAnswerQuestion,
	isSingleChoiceQuestion,
	isMultipleChoiceQuestion,
	isOrderingQuestion,
	isMatchingQuestion,
} from "@/lib/question-helper";
import type { Question } from "@/lib/types";

// Import question type components
import TrueFalseQuestion from "@/lib/components/questions/true-false-question";
import NumericQuestion from "@/lib/components/questions/numeric-question";
import TextQuestion from "@/lib/components/questions/text-question";
import SingleChoiceQuestion from "@/lib/components/questions/single-choice-question";
import MultipleChoiceQuestion from "@/lib/components/questions/multiple-choice-question";
import OrderingQuestion from "@/lib/components/questions/ordering-question";
import MatchingQuestion from "@/lib/components/questions/matching-question";

interface QuestionCardProps {
	className?: string;
}

export function QuestionCard({ className }: QuestionCardProps) {
	const {
		questions,
		currentQuestionIndex,
		previousQuestion,
		nextQuestion,
		toggleFlagQuestion,
		isQuestionFlagged,
		getQuestionByIndex,
		getMaxNumberOfQuestions,
	} = useQuestionContext();

	const currentQuestion = getQuestionByIndex(currentQuestionIndex);
	const totalQuestions = getMaxNumberOfQuestions();
	const isFirst = currentQuestionIndex === 0;
	const isLast = currentQuestionIndex === totalQuestions - 1;

	if (!currentQuestion) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Keine Frage gefunden</p>
			</div>
		);
	}

	const questionType = getQuestionType(currentQuestion);
	const isFlagged = isQuestionFlagged(currentQuestion.id);

	return (
		<div className={cn("flex flex-col h-full", className)}>
			<Card className="flex flex-col flex-1 m-4 sm:m-6 lg:m-8">
				{/* Header */}
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="text-xs">
									Frage {currentQuestionIndex + 1} von {totalQuestions}
								</Badge>
								<QuestionTypeBadge type={questionType} />
							</div>
						</div>
						<Button
							variant={isFlagged ? "default" : "outline"}
							size="sm"
							onClick={() => toggleFlagQuestion(currentQuestion.id)}
							className={cn(
								isFlagged && "bg-amber-500 hover:bg-amber-600 text-white"
							)}
						>
							<Flag className="size-4 mr-1" />
							{isFlagged ? "Markiert" : "Markieren"}
						</Button>
					</div>
				</CardHeader>

				{/* Question Content */}
				<CardContent className="flex-1 overflow-auto">
					<div className="space-y-6">
						{/* Question Text */}
						<div className="text-lg sm:text-xl font-medium leading-relaxed">
							{currentQuestion.question}
						</div>

						{/* Answer Component */}
						<div className="pt-4">
							<DynamicQuestion question={currentQuestion} />
						</div>
					</div>
				</CardContent>

				{/* Navigation Footer */}
				<CardFooter className="pt-4 border-t">
					<div className="flex justify-between w-full gap-4">
						<Button
							variant="outline"
							onClick={previousQuestion}
							disabled={isFirst}
						>
							<ChevronLeft className="size-4 mr-1" />
							Zurück
						</Button>
						<Button onClick={nextQuestion}>
							{isLast ? "Überprüfen" : "Weiter"}
							{!isLast && <ChevronRight className="size-4 ml-1" />}
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

type QuestionType =
	| "true-false"
	| "numeric"
	| "text"
	| "single-choice"
	| "multiple-choice"
	| "ordering"
	| "matching"
	| "unknown";

function getQuestionType(question: Question): QuestionType {
	if (isTrueFalseQuestion(question)) return "true-false";
	if (isNumericQuestion(question)) return "numeric";
	if (isTextAnswerQuestion(question)) return "text";
	if (isSingleChoiceQuestion(question)) return "single-choice";
	if (isMultipleChoiceQuestion(question)) return "multiple-choice";
	if (isOrderingQuestion(question)) return "ordering";
	if (isMatchingQuestion(question)) return "matching";
	return "unknown";
}

interface QuestionTypeBadgeProps {
	type: QuestionType;
}

function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
	const config: Record<QuestionType, { label: string; icon: React.ElementType }> = {
		"true-false": { label: "Wahr/Falsch", icon: ToggleLeft },
		"numeric": { label: "Numerisch", icon: Hash },
		"text": { label: "Freitext", icon: Type },
		"single-choice": { label: "Einzelauswahl", icon: CircleDot },
		"multiple-choice": { label: "Mehrfachauswahl", icon: CheckSquare },
		"ordering": { label: "Sortierung", icon: ListOrdered },
		"matching": { label: "Zuordnung", icon: Link2 },
		"unknown": { label: "Unbekannt", icon: Hash },
	};

	const { label, icon: Icon } = config[type];

	return (
		<Badge variant="outline" className="text-xs">
			<Icon className="size-3 mr-1" />
			{label}
		</Badge>
	);
}

interface DynamicQuestionProps {
	question: Question;
}

function DynamicQuestion({ question }: DynamicQuestionProps) {
	if (isTrueFalseQuestion(question)) {
		return <TrueFalseQuestion question={question} />;
	}
	if (isNumericQuestion(question)) {
		return <NumericQuestion question={question} />;
	}
	if (isTextAnswerQuestion(question)) {
		return <TextQuestion question={question} />;
	}
	if (isSingleChoiceQuestion(question)) {
		return <SingleChoiceQuestion question={question} />;
	}
	if (isMultipleChoiceQuestion(question)) {
		return <MultipleChoiceQuestion question={question} />;
	}
	if (isOrderingQuestion(question)) {
		return <OrderingQuestion question={question} />;
	}
	if (isMatchingQuestion(question)) {
		return <MatchingQuestion question={question} />;
	}

	return (
		<div className="text-muted-foreground">
			Unbekannter Fragentyp
		</div>
	);
}

export default QuestionCard;
