import React from "react";
import { z } from "zod";
import { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from "react-hook-form";

export const userFormSchema = z.object({
	name: z.string().max(50, { message: "Name must be less than 50 characters." }),
	mail: z.string().email({ message: "Invalid email address." }).or(z.literal("")).optional(),
});
export type UserFormValues = z.infer<typeof userFormSchema>;
export type UserFormFieldRendererProps<T extends keyof UserFormValues = keyof UserFormValues> = {
	field: ControllerRenderProps<UserFormValues, T>;
	fieldState: ControllerFieldState;
	formState: UseFormStateReturn<UserFormValues>;
};

export interface QuizContext {
	quizzes: Quiz[];
	getQuizById: (id: string) => Quiz | undefined;
	finishQuiz: (quizId: string, answers: Record<string, QuestionInput>) => Promise<void>;
}

export interface QuizProvider {
	quizzes: Quiz[];
	onCompleteAction: (name: string, mail: string, quizId: string, answers: Record<string, QuestionInput>) => Promise<void>;
	children: React.ReactNode;
}

export interface UserContext {
	setName: (name: string) => void;
	getName: () => string | undefined;
	setMail: (mail: string) => void;
	getMail: () => string | undefined;
}

export interface UserProvider {
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
	
	saveAnswer: (questionId: string, answer: QuestionInput) => void;
	getAnswer: (questionId: string) => QuestionInput | undefined;
	hasAnswer: (questionId: string) => boolean;
	removeAnswer: (questionId: string) => void;
	getNumberOfAnsweredQuestions: () => number;
	getAllAnswers: () => Record<string, QuestionInput>;
	areAllQuestionsAnswered: () => boolean;
}

export interface QuestionProvider {
	quizId: string;
	questions: Question[];
	onCompleteAction: (answers: Record<string, QuestionInput>) => Promise<void>;
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

export interface QuestionInput {
	question: string;
	type: "true-false" | "numeric" | "text" | "single-choice" | "multiple-choice" | "ordering" | "matching";
}

export interface TrueFalseQuestionInput extends QuestionInput {
	inputAnswer: boolean;
	correctAnswer: boolean;
}

export interface NumericQuestionInput extends QuestionInput {
	inputAnswer: number;
	correctAnswer: number;
	tolerance?: number;
}

export interface TextAnswerQuestionInput extends QuestionInput {
	inputAnswer: string;
	minLength?: number;
	maxLength?: number;
}

export interface SingleChoiceQuestionInput extends QuestionInput {
	inputAnswer: number;
	correctAnswerIndex: number;
	answers: string[];
}

export interface MultipleChoiceQuestionInput extends QuestionInput {
	inputAnswer: number[];
	answers: Array<{ answer: string; isCorrect: boolean }>;
}

export interface OrderingQuestionInput extends QuestionInput {
	inputAnswer: number[];
	items: string[];
	correctAnswerOrder: Array<string>;
}

export interface MatchingQuestionInput extends QuestionInput {
	rawInput: Record<string, string>;
	inputMatches: Record<string, string>;
	correctMatches: Record<string, string>;
}
