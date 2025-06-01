"use client";

import React, { useCallback } from "react";
import { QuestionProvider } from "@/lib/contexts/question-context";
import { useParams } from "next/navigation";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { QuestionInput } from "@/lib/types";
import ContentPane from "@/lib/components/content-pane";

export default function (
	{ children }: { children: React.ReactNode },
) {
	const { getQuizById, finishQuiz } = useQuizContext();
	
	const quizId = useParams().quizId as string;
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return (
			<ContentPane className="w-4/5 bg-custom-red lg:w-2/3 2xl:w-1/3">
				<h3 className="m-1 text-2xl">
					<strong>
						Quiz wurde nicht gefunden
					</strong>
				</h3>
			</ContentPane>
		);
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
