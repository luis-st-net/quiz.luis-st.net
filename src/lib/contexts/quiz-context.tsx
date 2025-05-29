"use client";

import React, { createContext, useCallback, useContext } from "react";
import type { QuestionInput, QuizContext, QuizProvider } from "@/lib/types";
import { useUserContext } from "@/lib/contexts/user-context";
import { useToast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";

const Context = createContext<QuizContext | undefined>(undefined);

export function QuizProvider(
	{ quizzes, onCompleteAction, children }: QuizProvider,
) {
	const router = useRouter();
	const { toast } = useToast();
	const getQuizById = useCallback((id: string) => {
		return quizzes.find(quiz => quiz.id === id);
	}, [quizzes]);
	
	const { getName, getMail } = useUserContext();
	const finishQuiz = useCallback(async (quiz: string, answers: Record<string, QuestionInput>) => {
		const message = await onCompleteAction(getName(), getMail(), quiz, answers);
		
		toast({
			title: message.success ? "Quiz erfolgreich eingereicht" : "Quizübermittlung fehlgeschlagen",
			description: message.message,
		});
		
		router.push("/");
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
