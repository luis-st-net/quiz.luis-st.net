"use client";

import React, { useCallback } from "react";
import { QuestionProvider } from "@/lib/contexts/question-context";
import { useParams } from "next/navigation";
import { useQuizContext } from "@/lib/contexts/quiz-context";

export default function (
	{ children }: { children: React.ReactNode },
) {
	const { getQuizById, finishQuiz } = useQuizContext();
	
	const quizId = useParams().quizId as string;
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return null;
	}
	
	const finishQuestions = useCallback(async (answers: Record<string, string>) => {
		await finishQuiz(quizId, answers);
	}, [quizId]);
	
	return (
		<QuestionProvider quizId={quizId} questions={quiz.questions} onCompleteAction={finishQuestions}>
			{children}
		</QuestionProvider>
	);
}
