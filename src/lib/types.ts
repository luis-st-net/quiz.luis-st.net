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
	questions: Question[];
	getQuestionByIndex: (index: number) => Question | undefined;
	getMaxNumberOfQuestions: () => number;
	currentQuestionIndex: number;
	
	goToNextQuestion: () => void;
	goToPreviousQuestion: () => void;
	finishQuestions: () => void;
	
	saveAnswer: (questionId: string, answer: string) => void;
	getAnswer: (questionId: string) => string | undefined;
	hasAnswer: (questionId: string) => boolean;
	getAllAnswers: () => Record<string, string>;
}

export interface QuestionProvider {
	questions: Question[];
	goToPreviousAction: () => Promise<void>;
	goToNextAction: () => Promise<void>;
	onCompleteAction: (answers: Record<string, string>) => Promise<void>;
	children: React.ReactNode;
	storageKey?: string;
}

export interface Quiz {
	id: string;
	name: string;
	href?: string;
}

export interface Question {
	id: string;
	index: number;
	shortDescription: string;
	question: string;
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
