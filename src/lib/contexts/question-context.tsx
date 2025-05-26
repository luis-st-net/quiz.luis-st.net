"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { QuestionContext, QuestionInput, QuestionProvider } from "@/lib/types";
import { useRouter } from "next/navigation";

const Context = createContext<QuestionContext | undefined>(undefined);

export function QuestionProvider(
	{ quizId, questions, onCompleteAction, children, storageKey = "quiz-answers" }: QuestionProvider,
) {
	const [answers, setAnswers] = useState<Record<string, QuestionInput>>({});
	const router = useRouter();
	
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
		} else {
			sessionStorage.removeItem(storageKey);
		}
	}, [answers, storageKey]);
	
	//region Question getters
	const getIndexOfQuestion = useCallback((questionId: string) => {
		return questions.findIndex(question => question.id === questionId);
	}, [questions]);
	
	const getQuestionByIndex = useCallback((index: number) => {
		return questions[index];
	}, [questions]);
	
	const getQuestionById = useCallback((id: string) => {
		return questions.find(question => question.id === id);
	}, [questions]);
	
	const getMaxNumberOfQuestions = useCallback(() => {
		return questions.length;
	}, [questions]);
	//endregion
	
	//region Navigation actions
	const previousQuestion = useCallback((questionIndex: number) => {
		if (questionIndex !== 0) {
			router.push("/" + quizId + "/" + getQuestionByIndex(questionIndex - 1)!.id);
		}
	}, [quizId, getQuestionByIndex]);
	
	const nextQuestion = useCallback(async (questionIndex: number) => {
		if (questionIndex < getMaxNumberOfQuestions() - 1) {
			router.push("/" + quizId + "/" + getQuestionByIndex(questionIndex + 1)!.id);
		}
		console.log("Answers:", answers);
		if (questionIndex === getMaxNumberOfQuestions() - 1) {
			console.log("All questions answered, executing onCompleteAction");
			await onCompleteAction(answers);
		}
	}, [getMaxNumberOfQuestions, quizId, getQuestionByIndex, answers, onCompleteAction]);
	//endregion
	
	//region Answer management
	const saveAnswer = useCallback((questionId: string, answer: QuestionInput) => {
		setAnswers(previousAnswers => ({
			...previousAnswers,
			[questionId]: answer,
		}));
	}, [setAnswers]);
	
	const getAnswer = useCallback((questionId: string) => {
		return answers[questionId];
	}, [answers]);
	
	const hasAnswer = useCallback((questionId: string) => {
		return !!answers[questionId];
	}, [answers]);
	
	const removeAnswer = useCallback((questionId: string) => {
		setAnswers(previousAnswers => {
			const newAnswers = { ...previousAnswers };
			delete newAnswers[questionId];
			return newAnswers;
		});
	}, [setAnswers]);
	
	const getNumberOfAnsweredQuestions = useCallback(() => {
		return Object.keys(answers).length;
	}, [answers]);
	
	const getAllAnswers = useCallback(() => {
		return answers;
	}, [answers]);
	
	const areAllQuestionsAnswered = useCallback(() => {
		return questions.every(question => hasAnswer(question.id));
	}, [questions, hasAnswer]);
	//endregion
	
	const contextValue = {
		quizId,
		questions,
		getIndexOfQuestion,
		getQuestionByIndex,
		getQuestionById,
		getMaxNumberOfQuestions,
		
		previousQuestion,
		nextQuestion,
		
		saveAnswer,
		getAnswer,
		hasAnswer,
		removeAnswer,
		getNumberOfAnsweredQuestions,
		getAllAnswers,
		areAllQuestionsAnswered,
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
