"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { QuestionContext, QuestionInput, QuestionProvider } from "@/lib/types";
import { useRouter } from "next/navigation";

const Context = createContext<QuestionContext | undefined>(undefined);

export function QuestionProvider(
	{ quizId, questions, onCompleteAction, children, storageKey = "quiz-answers" }: QuestionProvider,
) {
	const [answers, setAnswers] = useState<Record<string, QuestionInput>>({});
	const [preventNavigation, setPreventNavigation] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
	const [isReviewMode, setReviewMode] = useState(false);
	const router = useRouter();

	// Load answers and flagged questions from sessionStorage
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

			const storedFlagged = sessionStorage.getItem(`${storageKey}-flagged`);
			if (storedFlagged) {
				try {
					setFlaggedQuestions(new Set(JSON.parse(storedFlagged)));
				} catch (e) {
					console.error("Failed to parse stored flagged questions");
				}
			}

			const storedIndex = sessionStorage.getItem(`${storageKey}-index`);
			if (storedIndex) {
				try {
					const index = JSON.parse(storedIndex);
					if (index >= 0 && index < questions.length) {
						setCurrentQuestionIndex(index);
					}
				} catch (e) {
					console.error("Failed to parse stored question index");
				}
			}
		}
	}, [storageKey, questions.length]);

	// Persist answers to sessionStorage
	useEffect(() => {
		if (Object.keys(answers).length > 0) {
			sessionStorage.setItem(storageKey, JSON.stringify(answers));
		} else {
			sessionStorage.removeItem(storageKey);
		}
	}, [answers, storageKey]);

	// Persist flagged questions to sessionStorage
	useEffect(() => {
		if (flaggedQuestions.size > 0) {
			sessionStorage.setItem(`${storageKey}-flagged`, JSON.stringify(Array.from(flaggedQuestions)));
		} else {
			sessionStorage.removeItem(`${storageKey}-flagged`);
		}
	}, [flaggedQuestions, storageKey]);

	// Persist current question index to sessionStorage
	useEffect(() => {
		sessionStorage.setItem(`${storageKey}-index`, JSON.stringify(currentQuestionIndex));
	}, [currentQuestionIndex, storageKey]);

	//region Question getters
	const getIndexOfQuestion = useCallback((questionId: string) => {
		const index = questions.findIndex(question => question.id === questionId);
		return index >= 0 ? index : undefined;
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
	const goToQuestion = useCallback((index: number) => {
		if (preventNavigation) return;
		if (index >= 0 && index < questions.length) {
			setCurrentQuestionIndex(index);
		}
	}, [preventNavigation, questions.length]);

	const previousQuestion = useCallback(() => {
		if (preventNavigation) return;
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	}, [preventNavigation, currentQuestionIndex]);

	const nextQuestion = useCallback(() => {
		if (preventNavigation) return;
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	}, [preventNavigation, currentQuestionIndex, questions.length]);

	const finishQuiz = useCallback(async () => {
		await onCompleteAction(answers);
		router.push("/" + quizId + "/result");
	}, [onCompleteAction, answers, quizId, router]);
	//endregion

	//region Flagging
	const flagQuestion = useCallback((questionId: string) => {
		setFlaggedQuestions(prev => new Set([...prev, questionId]));
	}, []);

	const unflagQuestion = useCallback((questionId: string) => {
		setFlaggedQuestions(prev => {
			const newSet = new Set(prev);
			newSet.delete(questionId);
			return newSet;
		});
	}, []);

	const toggleFlagQuestion = useCallback((questionId: string) => {
		setFlaggedQuestions(prev => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
			return newSet;
		});
	}, []);

	const isQuestionFlagged = useCallback((questionId: string) => {
		return flaggedQuestions.has(questionId);
	}, [flaggedQuestions]);
	//endregion

	//region Answer management
	const saveAnswer = useCallback((questionId: string, answer: QuestionInput) => {
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

	const removeAnswer = useCallback((questionId: string) => {
		setAnswers(previousAnswers => {
			const newAnswers = { ...previousAnswers };
			delete newAnswers[questionId];
			return newAnswers;
		});
	}, []);

	const clearAnswers = useCallback(() => {
		setAnswers({});
		setFlaggedQuestions(new Set());
		setCurrentQuestionIndex(0);
		if (typeof window !== "undefined") {
			sessionStorage.removeItem(storageKey);
			sessionStorage.removeItem(`${storageKey}-flagged`);
			sessionStorage.removeItem(`${storageKey}-index`);
		}
	}, [storageKey]);

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

	const contextValue: QuestionContext = useMemo(() => ({
		quizId,
		questions,
		getIndexOfQuestion,
		getQuestionByIndex,
		getQuestionById,
		getMaxNumberOfQuestions,

		currentQuestionIndex,
		setCurrentQuestionIndex,
		goToQuestion,
		preventNavigation,
		setPreventNavigation,
		previousQuestion,
		nextQuestion,
		finishQuiz,

		flaggedQuestions,
		flagQuestion,
		unflagQuestion,
		toggleFlagQuestion,
		isQuestionFlagged,

		isReviewMode,
		setReviewMode,

		saveAnswer,
		getAnswer,
		hasAnswer,
		removeAnswer,
		clearAnswers,
		getNumberOfAnsweredQuestions,
		getAllAnswers,
		areAllQuestionsAnswered,
	}), [
		quizId,
		questions,
		getIndexOfQuestion,
		getQuestionByIndex,
		getQuestionById,
		getMaxNumberOfQuestions,
		currentQuestionIndex,
		goToQuestion,
		preventNavigation,
		previousQuestion,
		nextQuestion,
		finishQuiz,
		flaggedQuestions,
		flagQuestion,
		unflagQuestion,
		toggleFlagQuestion,
		isQuestionFlagged,
		isReviewMode,
		saveAnswer,
		getAnswer,
		hasAnswer,
		removeAnswer,
		clearAnswers,
		getNumberOfAnsweredQuestions,
		getAllAnswers,
		areAllQuestionsAnswered,
	]);

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
