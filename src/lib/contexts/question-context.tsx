"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { QuestionContext, QuestionProvider } from "@/lib/types";

const Context = createContext<QuestionContext | undefined>(undefined);

export function QuestionProvider(
	{ questions, goToPreviousAction, goToNextAction, onCompleteAction, children, storageKey = "quiz-answers" }: QuestionProvider,
) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedAnswers = sessionStorage.getItem(storageKey);
			if (storedAnswers) {
				try {
					setAnswers(JSON.parse(storedAnswers));
				} catch (e) {
					console.error("Failed to parse stored answers");
				}
			}
		}
	}, [storageKey]);
	
	useEffect(() => {
		if (Object.keys(answers).length > 0) {
			sessionStorage.setItem(storageKey, JSON.stringify(answers));
		}
	}, [answers, storageKey]);
	
	const getQuestionByIndex = useCallback((index: number) => {
		return questions[index];
	}, [questions]);
	
	const getMaxNumberOfQuestions = useCallback(() => {
		return questions.length;
	}, [questions]);
	
	const goToPreviousQuestion = useCallback(async () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(prev => prev - 1);
		}
		await goToPreviousAction();
	}, [currentQuestionIndex]);
	
	const goToNextQuestion = useCallback(async () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(prev => prev + 1);
		}
		await goToNextAction();
	}, [currentQuestionIndex, questions.length]);
	
	const finishQuestions = useCallback(async () => {
		await onCompleteAction(answers);
	}, [answers, onCompleteAction]);
	
	const saveAnswer = useCallback((questionId: string, answer: string) => {
		setAnswers(previousAnswers => ({
			...previousAnswers,
			[questionId]: answer,
		}));
	}, []);
	
	const getAnswer = useCallback((questionId: string) => {
		return answers[questionId];
	}, [answers]);
	
	const hasAnswer = useCallback((questionId: string) => {
		return !!answers[questionId];
	}, [answers]);
	
	const getAllAnswers = useCallback(() => {
		return answers;
	}, [answers]);
	
	const contextValue = {
		questions,
		getQuestionByIndex,
		getMaxNumberOfQuestions,
		currentQuestionIndex,
		goToPreviousQuestion,
		goToNextQuestion,
		finishQuestions,
		saveAnswer,
		getAnswer,
		hasAnswer,
		getAllAnswers,
	};
	
	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
}

export function useQuestionContext() {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useQuestionContext must be used within a QuestionProvider");
	}
	return context;
}
