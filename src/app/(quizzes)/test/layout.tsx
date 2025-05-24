"use client";

import React from "react";
import { QuestionProvider } from "@/lib/contexts/question-context";
import { Question, SingleChoiceQuestion } from "@/lib/types";
import { goToNext, goToPrevious, onComplete } from "@/app/(quizzes)/test/actions";

export default function (
	{ children }: { children: React.ReactNode },
) {
	const questions: Question[] = [
		{
			id: "1",
			index: 0,
			shortDescription: "Capital of France?",
			question: "What is the capital of France?",
			correctAnswerIndex: 0,
			answers: [
				{ id: "1", answer: "Paris" },
				{ id: "2", answer: "Berlin" },
				{ id: "3", answer: "Rome" },
			],
		} as SingleChoiceQuestion,
		{
			id: "2",
			index: 1,
			shortDescription: "Capital of Germany?",
			question: "What is the capital of Germany?",
			correctAnswerIndex: 1,
			answers: [
				{ id: "1", answer: "Paris" },
				{ id: "2", answer: "Berlin" },
				{ id: "3", answer: "Rome" },
			],
		} as SingleChoiceQuestion,
		{
			id: "3",
			index: 2,
			shortDescription: "Capital of Italy?",
			question: "What is the capital of Italy?",
			correctAnswerIndex: 2,
			answers: [
				{ id: "1", answer: "Paris" },
				{ id: "2", answer: "Berlin" },
				{ id: "3", answer: "Rome" },
			],
		} as SingleChoiceQuestion,
	];
	
	return (
		<QuestionProvider questions={questions} goToPreviousAction={goToPrevious} goToNextAction={goToNext} onCompleteAction={onComplete}>
			{children}
		</QuestionProvider>
	);
}
