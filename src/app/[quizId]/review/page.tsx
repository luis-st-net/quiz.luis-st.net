"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { ScrollArea } from "@/lib/components/ui/scroll-area";
import { Separator } from "@/lib/components/ui/separator";
import { Alert, AlertDescription } from "@/lib/components/ui/alert";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	AlertTriangle,
	Flag,
	Edit2,
} from "lucide-react";
import { cn } from "@/lib/utility";

export default function ReviewPage() {
	const router = useRouter();
	const {
		quizId,
		questions,
		getAnswer,
		hasAnswer,
		isQuestionFlagged,
		flaggedQuestions,
		getNumberOfAnsweredQuestions,
		goToQuestion,
		setReviewMode,
		pauseTimer,
		resumeTimer,
	} = useQuestionContext();
	const { getQuizById } = useQuizContext();

	// Pause timer when entering review page
	useEffect(() => {
		pauseTimer();
	}, [pauseTimer]);

	const quiz = getQuizById(quizId);
	const totalQuestions = questions.length;
	const answeredCount = getNumberOfAnsweredQuestions();
	const unansweredCount = totalQuestions - answeredCount;
	const flaggedCount = flaggedQuestions.size;

	const handleEditQuestion = (index: number) => {
		resumeTimer();
		setReviewMode(true);
		goToQuestion(index);
		router.push(`/${quizId}`);
	};

	const handleBackToQuiz = () => {
		resumeTimer();
		router.push(`/${quizId}`);
	};

	const handleSubmit = () => {
		router.push(`/${quizId}/submit`);
	};

	if (!quiz) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Quiz nicht gefunden</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<header className="flex items-center justify-between px-4 py-3 border-b bg-card">
				<h1 className="text-lg font-semibold">{quiz.name} - Überprüfung</h1>
				<Button variant="ghost" size="sm" onClick={handleBackToQuiz}>
					<ArrowLeft className="size-4 mr-1" />
					Zurück zum Quiz
				</Button>
			</header>

			{/* Main Content */}
			<ScrollArea className="flex-1">
				<div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
					{/* Summary Section */}
					<Card>
						<CardHeader>
							<CardTitle>Zusammenfassung</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div className="p-4 rounded-lg bg-muted/50">
									<div className="text-2xl font-bold text-green-600">
										{answeredCount}
									</div>
									<div className="text-sm text-muted-foreground">Beantwortet</div>
								</div>
								<div className="p-4 rounded-lg bg-muted/50">
									<div className="text-2xl font-bold text-amber-600">
										{unansweredCount}
									</div>
									<div className="text-sm text-muted-foreground">Offen</div>
								</div>
								<div className="p-4 rounded-lg bg-muted/50">
									<div className="text-2xl font-bold text-blue-600">
										{flaggedCount}
									</div>
									<div className="text-sm text-muted-foreground">Markiert</div>
								</div>
							</div>

							{unansweredCount > 0 && (
								<Alert variant="destructive">
									<AlertTriangle className="size-4" />
									<AlertDescription>
										Sie haben noch {unansweredCount} unbeantwortete{" "}
										{unansweredCount === 1 ? "Frage" : "Fragen"}.
									</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>

					{/* Questions List */}
					<Card>
						<CardHeader>
							<CardTitle>Ihre Antworten</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{questions.map((question, index) => {
								const answered = hasAnswer(question.id);
								const flagged = isQuestionFlagged(question.id);
								const answer = getAnswer(question.id);

								return (
									<div key={question.id}>
										<div
											className={cn(
												"flex items-start gap-3 p-3 rounded-lg transition-colors",
												!answered && "bg-amber-50 dark:bg-amber-950/20",
												answered && "hover:bg-muted/50"
											)}
										>
											{/* Status Icon */}
											<div className="flex-shrink-0 mt-0.5">
												{answered ? (
													<div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
														<Check className="size-4 text-green-600" />
													</div>
												) : (
													<div className="size-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
														<AlertTriangle className="size-4 text-amber-600" />
													</div>
												)}
											</div>

											{/* Question Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-medium">Frage {index + 1}</span>
													{flagged && (
														<Badge variant="outline" className="text-amber-600 border-amber-300">
															<Flag className="size-3 mr-1" />
															Markiert
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground truncate">
													{question.shortQuestion || question.question}
												</p>
												{answered && answer && (
													<p className="text-sm mt-1">
														<span className="text-muted-foreground">Antwort: </span>
														<span className="font-medium">
															{formatAnswer(answer)}
														</span>
													</p>
												)}
												{!answered && (
													<p className="text-sm text-amber-600 mt-1">
														Noch nicht beantwortet
													</p>
												)}
											</div>

											{/* Edit Button */}
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditQuestion(index)}
											>
												<Edit2 className="size-4 mr-1" />
												{answered ? "Bearbeiten" : "Beantworten"}
											</Button>
										</div>
										{index < questions.length - 1 && <Separator className="my-2" />}
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>
			</ScrollArea>

			{/* Footer Actions */}
			<div className="border-t bg-card p-4">
				<div className="max-w-3xl mx-auto flex justify-between gap-4">
					<Button variant="outline" onClick={handleBackToQuiz}>
						<ArrowLeft className="size-4 mr-2" />
						Zurück zum Quiz
					</Button>
					<Button onClick={handleSubmit} disabled={unansweredCount > 0}>
						Antworten einreichen
						<ArrowRight className="size-4 ml-2" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function formatAnswer(answer: any): string {
	if (!answer) return "-";

	switch (answer.type) {
		case "true-false":
			return answer.inputAnswer ? "Wahr" : "Falsch";
		case "numeric":
			return String(answer.inputAnswer);
		case "text":
			return answer.inputAnswer?.substring(0, 50) + (answer.inputAnswer?.length > 50 ? "..." : "");
		case "single-choice":
			return answer.answers?.[answer.inputAnswer] || "-";
		case "multiple-choice":
			return answer.inputAnswer?.length > 0
				? `${answer.inputAnswer.length} ausgewählt`
				: "-";
		case "ordering":
			return `${answer.inputAnswer?.length || 0} sortiert`;
		case "matching":
			return `${Object.keys(answer.inputMatches || {}).length} zugeordnet`;
		default:
			return "-";
	}
}
