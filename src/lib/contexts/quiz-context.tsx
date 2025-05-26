"use client";

import React, { createContext, useCallback, useContext } from "react";
import type { QuestionInput, QuizContext, QuizProvider } from "@/lib/types";
import { useUserContext } from "@/lib/contexts/user-context";

const Context = createContext<QuizContext | undefined>(undefined);

export function QuizProvider(
	{ quizzes, onCompleteAction, children }: QuizProvider,
) {
	const getQuizById = useCallback((id: string) => {
		return quizzes.find(quiz => quiz.id === id);
	}, [quizzes]);
	
	const { getName, getMail } = useUserContext();
	const finishQuiz = useCallback(async (quizId: string, answers: Record<string, QuestionInput>) => {
		await onCompleteAction(getName() || "", getMail() || "", quizId, answers);
	}, [onCompleteAction]);
	
	const contextValue = {
		quizzes,
		getQuizById,
		finishQuiz,
	};
	
	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
}

export function useQuizContext() {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useQuizContext must be used within a QuizProvider");
	}
	return context;
}
