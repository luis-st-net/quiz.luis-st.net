"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { ScrollArea } from "@/lib/components/ui/scroll-area";
import {
	MatchingQuestionInput,
	MultipleChoiceQuestionInput,
	NumericQuestionInput,
	OrderingQuestionInput,
	QuestionInput,
	SingleChoiceQuestionInput,
	TextQuestionInput,
	TrueFalseQuestionInput,
} from "@/lib/types";
import { Check, X, Minus, Home, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utility";
import { useConfetti } from "@/lib/hooks/use-confetti";

export default function ResultPage() {
	const router = useRouter();
	const { getQuizById } = useQuizContext();
	const { quizId, getAllAnswers, questions, clearAnswers } = useQuestionContext();

	const quiz = getQuizById(quizId);

	if (!quiz) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Quiz nicht gefunden</p>
			</div>
		);
	}

	const answers = getAllAnswers();
	const { correct, incorrect, manual, total } = calculateScore(answers, questions.length);
	// Calculate percentage based on auto-gradable questions only
	const autoGradableTotal = total - manual;
	const percentage = autoGradableTotal > 0 ? Math.round((correct / autoGradableTotal) * 100) : 0;

	// Trigger confetti for good scores (80%+)
	useConfetti({ enabled: percentage >= 80, triggerOnMount: true });

	const handleRestart = () => {
		// Clear answers and restart
		clearAnswers();
		router.push(`/${quizId}`);
	};

	const handleHome = () => {
		router.push("/");
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<header className="flex items-center justify-between px-4 py-3 border-b bg-card">
				<h1 className="text-lg font-semibold">{quiz.name} - Ergebnisse</h1>
			</header>

			<ScrollArea className="flex-1">
				<div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
					{/* Score Summary Card */}
					<Card className="overflow-hidden">
						<CardHeader className="text-center pb-4 bg-gradient-to-b from-muted/50">
							<div className="flex justify-center mb-4">
								<div className="relative w-32 h-32">
									{/* Circular Progress Background */}
									<svg className="w-full h-full transform -rotate-90">
										<circle
											cx="64"
											cy="64"
											r="56"
											stroke="currentColor"
											strokeWidth="8"
											fill="none"
											className="text-muted"
										/>
										<circle
											cx="64"
											cy="64"
											r="56"
											stroke="currentColor"
											strokeWidth="8"
											fill="none"
											strokeLinecap="round"
											strokeDasharray={`${percentage * 3.52} 352`}
											className={cn(
												"transition-all duration-1000",
												percentage >= 80
													? "text-green-500"
													: percentage >= 50
													? "text-amber-500"
													: "text-red-500"
											)}
										/>
									</svg>
									{/* Percentage Text */}
									<div className="absolute inset-0 flex flex-col items-center justify-center">
										<span className="text-3xl font-bold">{percentage}%</span>
										<span className="text-sm text-muted-foreground">
											{correct}/{total}
										</span>
									</div>
								</div>
							</div>

							{percentage >= 80 && (
								<div className="flex items-center justify-center gap-2 text-green-600 mb-2">
									<Trophy className="size-5" />
									<span className="font-medium">Hervorragend!</span>
								</div>
							)}

							<CardTitle className="text-2xl">Quiz abgeschlossen</CardTitle>
						</CardHeader>

						<CardContent className="pt-6">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
									<div className="text-2xl font-bold text-green-600">{correct}</div>
									<div className="text-sm text-muted-foreground">Richtig</div>
								</div>
								<div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
									<div className="text-2xl font-bold text-red-600">{incorrect}</div>
									<div className="text-sm text-muted-foreground">Falsch</div>
								</div>
								<div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
									<div className="text-2xl font-bold text-amber-600">{manual}</div>
									<div className="text-sm text-muted-foreground">Manuell</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Detailed Results */}
					<Card>
						<CardHeader>
							<CardTitle>Detaillierte Ergebnisse</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{Object.entries(answers).map(([questionId, input], index) => (
								<QuestionResult key={questionId} input={input} index={index} />
							))}
							{Object.keys(answers).length === 0 && (
								<p className="text-muted-foreground text-center py-8">
									Keine Antworten vorhanden
								</p>
							)}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3">
						<Button onClick={handleRestart} variant="outline" className="flex-1">
							<RotateCcw className="size-4 mr-2" />
							Quiz wiederholen
						</Button>
						<Button onClick={handleHome} className="flex-1">
							<Home className="size-4 mr-2" />
							Zur Startseite
						</Button>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}

function calculateScore(
	answers: Record<string, QuestionInput>,
	totalQuestions: number
): { correct: number; incorrect: number; unanswered: number; manual: number; total: number } {
	let correct = 0;
	let incorrect = 0;
	let manual = 0;

	for (const answer of Object.values(answers)) {
		const isCorrect = checkAnswer(answer);
		if (isCorrect === true) correct++;
		else if (isCorrect === false) incorrect++;
		else if (isCorrect === null) manual++; // Text questions need manual grading
	}

	return {
		correct,
		incorrect,
		unanswered: totalQuestions - Object.keys(answers).length,
		manual,
		total: totalQuestions,
	};
}

function checkAnswer(input: QuestionInput): boolean | null {
	switch (input.type) {
		case "true-false": {
			const tf = input as TrueFalseQuestionInput;
			return tf.inputAnswer === tf.correctAnswer;
		}
		case "numeric": {
			const num = input as NumericQuestionInput;
			if (num.tolerance) {
				return Math.abs(num.inputAnswer - num.correctAnswer) <= num.tolerance;
			}
			return num.inputAnswer === num.correctAnswer;
		}
		case "single-choice": {
			const sc = input as SingleChoiceQuestionInput;
			return sc.inputAnswer === sc.correctAnswerIndex;
		}
		case "multiple-choice": {
			const mc = input as MultipleChoiceQuestionInput;
			const correctIndices = mc.answers
				.map((a, i) => (a.isCorrect ? i : -1))
				.filter((i) => i >= 0);
			return (
				mc.inputAnswer.length === correctIndices.length &&
				mc.inputAnswer.every((i) => correctIndices.includes(i))
			);
		}
		case "ordering": {
			const ord = input as OrderingQuestionInput;
			return ord.inputAnswer.every(
				(itemIndex, position) =>
					ord.items[itemIndex] === ord.correctAnswerOrder[position]
			);
		}
		case "matching": {
			const match = input as MatchingQuestionInput;
			return Object.entries(match.inputMatches).every(
				([item, m]) => match.correctMatches[item] === m
			);
		}
		case "text":
			// Text questions are not auto-gradable
			return null;
		default:
			return null;
	}
}

function QuestionResult({ input, index }: { input: QuestionInput; index: number }) {
	const isCorrect = checkAnswer(input);

	return (
		<div className="border rounded-lg p-4">
			<div className="flex items-start gap-3">
				{/* Status Icon */}
				<div className="flex-shrink-0 mt-0.5">
					{isCorrect === true && (
						<div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<Check className="size-4 text-green-600" />
						</div>
					)}
					{isCorrect === false && (
						<div className="size-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
							<X className="size-4 text-red-600" />
						</div>
					)}
					{isCorrect === null && (
						<div className="size-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
							<Minus className="size-4 text-amber-600" />
						</div>
					)}
				</div>

				{/* Question Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<span className="font-medium">Frage {index + 1}</span>
						<Badge
							variant="outline"
							className={cn(
								isCorrect === true && "border-green-300 text-green-600",
								isCorrect === false && "border-red-300 text-red-600",
								isCorrect === null && "border-amber-300 text-amber-600"
							)}
						>
							{isCorrect === true && "Richtig"}
							{isCorrect === false && "Falsch"}
							{isCorrect === null && "Manuell"}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mb-3">{input.question}</p>
					<DynamicQuestionResult input={input} />
				</div>
			</div>
		</div>
	);
}

function DynamicQuestionResult({ input }: { input: QuestionInput }) {
	switch (input.type) {
		case "true-false":
			return <TrueFalseQuestionResult {...(input as TrueFalseQuestionInput)} />;
		case "numeric":
			return <NumericQuestionResult {...(input as NumericQuestionInput)} />;
		case "text":
			return <TextQuestionResult {...(input as TextQuestionInput)} />;
		case "single-choice":
			return <SingleChoiceQuestionResult {...(input as SingleChoiceQuestionInput)} />;
		case "multiple-choice":
			return <MultipleChoiceQuestionResult {...(input as MultipleChoiceQuestionInput)} />;
		case "ordering":
			return <OrderingQuestionResult {...(input as OrderingQuestionInput)} />;
		case "matching":
			return <MatchingQuestionResult {...(input as MatchingQuestionInput)} />;
		default:
			return <p className="text-muted-foreground">Unbekannter Fragentyp</p>;
	}
}

function TrueFalseQuestionResult({ inputAnswer, correctAnswer }: TrueFalseQuestionInput) {
	const isCorrect = inputAnswer === correctAnswer;
	return (
		<div className="text-sm space-y-1">
			<p>
				<span className="text-muted-foreground">Ihre Antwort: </span>
				<span className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
					{inputAnswer ? "Wahr" : "Falsch"}
				</span>
			</p>
			{!isCorrect && (
				<p>
					<span className="text-muted-foreground">Richtige Antwort: </span>
					<span className="text-green-600 font-medium">{correctAnswer ? "Wahr" : "Falsch"}</span>
				</p>
			)}
		</div>
	);
}

function NumericQuestionResult({ inputAnswer, correctAnswer, tolerance }: NumericQuestionInput) {
	const isCorrect = tolerance
		? Math.abs(inputAnswer - correctAnswer) <= tolerance
		: inputAnswer === correctAnswer;
	return (
		<div className="text-sm space-y-1">
			<p>
				<span className="text-muted-foreground">Ihre Antwort: </span>
				<span className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
					{inputAnswer}
				</span>
			</p>
			{!isCorrect && (
				<p>
					<span className="text-muted-foreground">Richtige Antwort: </span>
					<span className="text-green-600 font-medium">
						{correctAnswer}
						{tolerance ? ` (±${tolerance})` : ""}
					</span>
				</p>
			)}
		</div>
	);
}

function TextQuestionResult({ inputAnswer }: TextQuestionInput) {
	return (
		<div className="text-sm">
			<p className="text-muted-foreground mb-1">Ihre Antwort:</p>
			<p className="p-2 bg-muted/50 rounded text-amber-600">{inputAnswer || "(Keine Antwort)"}</p>
		</div>
	);
}

function SingleChoiceQuestionResult({
	inputAnswer,
	correctAnswerIndex,
	answers,
}: SingleChoiceQuestionInput) {
	const isCorrect = inputAnswer === correctAnswerIndex;
	return (
		<div className="text-sm space-y-1">
			<p>
				<span className="text-muted-foreground">Ihre Antwort: </span>
				<span className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
					{answers[inputAnswer]}
				</span>
			</p>
			{!isCorrect && (
				<p>
					<span className="text-muted-foreground">Richtige Antwort: </span>
					<span className="text-green-600 font-medium">{answers[correctAnswerIndex]}</span>
				</p>
			)}
		</div>
	);
}

function MultipleChoiceQuestionResult({ inputAnswer, answers }: MultipleChoiceQuestionInput) {
	return (
		<div className="text-sm space-y-2">
			<div>
				<p className="text-muted-foreground mb-1">Ihre Auswahl:</p>
				<ul className="list-disc list-inside space-y-0.5">
					{inputAnswer.map((idx) => (
						<li
							key={idx}
							className={answers[idx].isCorrect ? "text-green-600" : "text-red-600"}
						>
							{answers[idx].answer}
						</li>
					))}
				</ul>
			</div>
			<div>
				<p className="text-muted-foreground mb-1">Richtige Antworten:</p>
				<ul className="list-disc list-inside space-y-0.5">
					{answers
						.filter((a) => a.isCorrect)
						.map((a, i) => (
							<li key={i} className="text-green-600">
								{a.answer}
							</li>
						))}
				</ul>
			</div>
		</div>
	);
}

function OrderingQuestionResult({ inputAnswer, items, correctAnswerOrder }: OrderingQuestionInput) {
	return (
		<div className="text-sm space-y-2">
			<div>
				<p className="text-muted-foreground mb-1">Ihre Reihenfolge:</p>
				<ol className="list-decimal list-inside space-y-0.5">
					{inputAnswer.map((itemIndex, position) => {
						const item = items[itemIndex];
						const isCorrect = item === correctAnswerOrder[position];
						return (
							<li key={itemIndex} className={isCorrect ? "text-green-600" : "text-red-600"}>
								{item}
							</li>
						);
					})}
				</ol>
			</div>
			<div>
				<p className="text-muted-foreground mb-1">Richtige Reihenfolge:</p>
				<ol className="list-decimal list-inside space-y-0.5">
					{correctAnswerOrder.map((item, i) => (
						<li key={i} className="text-green-600">
							{item}
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}

function MatchingQuestionResult({ inputMatches, correctMatches }: MatchingQuestionInput) {
	return (
		<div className="text-sm space-y-2">
			<div>
				<p className="text-muted-foreground mb-1">Ihre Zuordnungen:</p>
				<ul className="space-y-0.5">
					{Object.entries(inputMatches).map(([item, match]) => {
						const isCorrect = correctMatches[item] === match;
						return (
							<li key={item} className={isCorrect ? "text-green-600" : "text-red-600"}>
								{item} → {match}
							</li>
						);
					})}
				</ul>
			</div>
			<div>
				<p className="text-muted-foreground mb-1">Richtige Zuordnungen:</p>
				<ul className="space-y-0.5">
					{Object.entries(correctMatches).map(([item, match]) => (
						<li key={item} className="text-green-600">
							{item} → {match}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
