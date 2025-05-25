import { MatchingQuestion, MultipleChoiceQuestion, NumericQuestion, OrderingQuestion, Quiz, SingleChoiceQuestion, TextAnswerQuestion, TrueFalseQuestion } from "@/lib/types";

const testQuiz: Quiz = {
	name: "Test Quiz",
	id: "test",
	description: "A quiz demonstrating all question types available on this platform.",
	questions: [
		{
			id: "1",
			shortQuestion: "Earth's shape",
			question: "Is the Earth flat?",
			correctAnswer: false,
		} as TrueFalseQuestion,
		{
			id: "2",
			shortQuestion: "Square root calculation",
			question: "What is the square root of 16?",
			correctAnswer: 4,
			tolerance: 0.001,
		} as NumericQuestion,
		{
			id: "3",
			shortQuestion: "Largest ocean",
			question: "Name the largest ocean on Earth.",
			minLength: 3,
			maxLength: 20,
		} as TextAnswerQuestion,
		{
			id: "4",
			shortQuestion: "Capital of France",
			question: "What is the capital of France?",
			correctAnswerIndex: 0,
			answers: [
				{ id: "1", answer: "Paris" },
				{ id: "2", answer: "Berlin" },
				{ id: "3", answer: "Rome" },
			],
		} as SingleChoiceQuestion,
		{
			id: "5",
			shortQuestion: "Primary colors",
			question: "Which of these are primary colors?",
			answers: [
				{ id: "1", answer: "Red", isCorrect: true },
				{ id: "2", answer: "Green", isCorrect: false },
				{ id: "3", answer: "Blue", isCorrect: true },
				{ id: "4", answer: "Yellow", isCorrect: true },
				{ id: "5", answer: "Purple", isCorrect: false },
			],
		} as MultipleChoiceQuestion,
		{
			id: "6",
			shortQuestion: "Planet order",
			question: "Place these planets in order from closest to farthest from the Sun.",
			items: [
				{ id: "1", answer: "Earth", correctPosition: 2 },
				{ id: "2", answer: "Mercury", correctPosition: 0 },
				{ id: "3", answer: "Venus", correctPosition: 1 },
				{ id: "4", answer: "Mars", correctPosition: 3 },
			],
		} as OrderingQuestion,
		{
			id: "7",
			shortQuestion: "Countries and capitals",
			question: "Match these countries with their capitals.",
			items: [
				{ id: "1", answer: "USA" },
				{ id: "2", answer: "Japan" },
				{ id: "3", answer: "Egypt" },
			],
			matches: [
				{ id: "4", answer: "Washington D.C.", matchesTo: { id: "1", answer: "USA" } },
				{ id: "5", answer: "Tokyo", matchesTo: { id: "2", answer: "Japan" } },
				{ id: "6", answer: "Cairo", matchesTo: { id: "3", answer: "Egypt" } },
			],
		} as MatchingQuestion,
	],
};

export const quizzes: Quiz[] = [
	testQuiz,
];
