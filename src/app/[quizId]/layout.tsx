"use client";

import React, { useCallback } from "react";
import { QuestionProvider } from "@/lib/contexts/question-context";
import { useParams } from "next/navigation";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { QuestionInput } from "@/lib/types";

export default function (
	{ children }: { children: React.ReactNode },
) {
	const { getQuizById, finishQuiz } = useQuizContext();
	
	const quizId = useParams().quizId as string;
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return null;
	}
	
	const finishQuestions = useCallback(async (answers: Record<string, QuestionInput>) => {
		await finishQuiz(quiz.name, answers);
	}, [quiz]);
	
	return (
		<QuestionProvider quizId={quizId} questions={quiz.questions} onCompleteAction={finishQuestions} storageKey={quizId + "/answers"}>
			{children}
		</QuestionProvider>
	);
}
