"use client";

import React, { useCallback } from "react";
import { QuestionProvider } from "@/lib/contexts/question-context";
import { TimerProvider } from "@/lib/contexts/timer-context";
import { useParams } from "next/navigation";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { QuestionInput } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function (
	{ children }: { children: React.ReactNode },
) {
	const { getQuizById, finishQuiz } = useQuizContext();

	const quizId = useParams().quizId as string;
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return (
			<div className="flex items-center justify-center min-h-full p-4">
				<Card className="w-full max-w-md border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="size-5" />
							Fehler
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Quiz wurde nicht gefunden
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}
	
	const finishQuestions = useCallback(async (answers: Record<string, QuestionInput>, elapsedTime: number) => {
		await finishQuiz(quiz.name, answers, elapsedTime);
	}, [quiz, finishQuiz]);
	
	return (
		<TimerProvider storageKey={quizId + "/timer"}>
			<QuestionProvider quizId={quizId} questions={quiz.questions} onCompleteAction={finishQuestions} storageKey={quizId + "/answers"}>
				{children}
			</QuestionProvider>
		</TimerProvider>
	);
}
