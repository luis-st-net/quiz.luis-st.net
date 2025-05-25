import React from "react";
import { z } from "zod";
import { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from "react-hook-form";

export const nameFormSchema = z.object({
	name: z.string().max(50, { message: "Name must be less than 50 characters." })
});
export type NameFormValues = z.infer<typeof nameFormSchema>;
export type NameFormFieldRendererProps<T extends keyof NameFormValues = keyof NameFormValues> = {
	field: ControllerRenderProps<NameFormValues, T>;
	fieldState: ControllerFieldState;
	formState: UseFormStateReturn<NameFormValues>;
};

export interface QuizContext {
	quizzes: Quiz[];
	getQuizById: (id: string) => Quiz | undefined;
	finishQuiz: (quizId: string, answers: Record<string, string>) => Promise<void>;
}

export interface QuizProvider {
	quizzes: Quiz[];
	onCompleteAction: (quizId: string, answers: Record<string, string>) => Promise<void>;
	children: React.ReactNode;
}

export interface NameContext {
	setName: (name: string) => void;
	getName: () => string | undefined;
	getNameOrRedirect: (redirectPath?: string) => string | undefined;
}

export interface NameProvider {
	children: React.ReactNode;
	storageKey?: string;
}

export interface QuestionContext {
	quizId: string;
	questions: Question[];
	getIndexOfQuestion: (questionId: string) => number | undefined;
	getQuestionByIndex: (index: number) => Question | undefined;
	getQuestionById: (id: string) => Question | undefined;
	getMaxNumberOfQuestions: () => number;
	
	previousQuestion: (questionIndex: number) => void;
	nextQuestion: (questionIndex: number) => void;
	
	saveAnswer: (questionId: string, answer: string) => void;
	getAnswer: (questionId: string) => string | undefined;
	hasAnswer: (questionId: string) => boolean;
	removeAnswer: (questionId: string) => void;
	getNumberOfAnsweredQuestions: () => number;
	getAllAnswers: () => Record<string, string>;
	areAllQuestionsAnswered: () => boolean;
}

export interface QuestionProvider {
	quizId: string;
	questions: Question[];
	onCompleteAction: (answers: Record<string, string>) => Promise<void>;
	children: React.ReactNode;
	storageKey?: string;
}

export interface Quiz {
	id: string;
	name: string;
	description: string;
	questions: Question[];
}

export interface Question {
	id: string;
	question: string;
	shortQuestion: string;
}

export interface Answer {
	id: string;
	answer: string;
}

export interface TrueFalseQuestion extends Question {
	correctAnswer: boolean;
}

export interface NumericQuestion extends Question {
	correctAnswer: number;
	tolerance?: number;
}

export interface TextAnswerQuestion extends Question {
	minLength?: number;
	maxLength?: number;
}

export interface SingleChoiceQuestion extends Question {
	correctAnswerIndex: Answer | number;
	answers: Answer[];
}

export interface MultipleChoiceQuestion extends Question {
	answers: Array<Answer & { isCorrect: boolean }>;
}

export interface OrderingQuestion extends Question {
	items: Array<Answer & { correctPosition: number }>;
}

export interface MatchingQuestion extends Question {
	items: Array<Answer>;
	matches: Array<Answer & { matchesTo: Answer }>;
}
