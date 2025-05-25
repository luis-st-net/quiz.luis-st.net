"use client";

import React, { createContext, useCallback, useContext } from "react";
import type { QuizContext, QuizProvider } from "@/lib/types";
import { useNameContext } from "@/lib/contexts/name-context";

const Context = createContext<QuizContext | undefined>(undefined);

export function QuizProvider(
	{ quizzes, onCompleteAction, children }: QuizProvider,
) {
	const getQuizById = useCallback((id: string) => {
		return quizzes.find(quiz => quiz.id === id);
	}, [quizzes]);
	
	const { getName } = useNameContext();
	const finishQuiz = useCallback(async (quizId: string, answers: Record<string, string>) => {
		await onCompleteAction(getName() || "", quizId, answers);
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
