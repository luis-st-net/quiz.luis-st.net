"use client";

import ContentPane from "@/lib/components/content-pane";
import React from "react";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { MatchingQuestionInput, MultipleChoiceQuestionInput, NumericQuestionInput, OrderingQuestionInput, QuestionInput, SingleChoiceQuestionInput, TextQuestionInput, TrueFalseQuestionInput } from "@/lib/types";

export default function () {
	const { getQuizById } = useQuizContext();
	const { quizId, getAllAnswers } = useQuestionContext();
	
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return (
			<ContentPane className="w-4/5 bg-custom-red lg:w-2/3 2xl:w-1/3">
				<div className="m-1 text-lg">
					Quiz wurde nicht gefunden
				</div>
			</ContentPane>
		);
	}
	
	return (
		<div className="w-4/5 my-16 lg:w-2/3 2xl:w-1/3">
			<ContentPane defaultSpacing={false} defaultColor={true} className="mb-8">
				<div className="p-4">
					<div className="m-1">
						{quiz.name} - Ergebnis
					</div>
				</div>
			</ContentPane>
			<div className="flex flex-col gap-4 mx-8">
				{Object.entries(getAllAnswers()).map(([item, match]) => (
					<QuestionResult key={item} input={match}/>
				))}
			</div>
		</div>
	);
}

function QuestionResult(
	{ input }: { input: QuestionInput },
) {
	return (
		<ContentPane defaultSpacing={false} defaultColor={true}>
			<div className="p-4">
				<div className="question-text">
					{input.question}
				</div>
				<DynamicQuestionResult input={input}/>
			</div>
		</ContentPane>
	);
}

function DynamicQuestionResult(
	{ input }: { input: QuestionInput },
) {
	if (input.type === "true-false") {
		return <TrueFalseQuestionResult {...(input as TrueFalseQuestionInput)}/>;
	} else if (input.type === "numeric") {
		return <NumericQuestionResult {...(input as NumericQuestionInput)}/>;
	} else if (input.type === "text") {
		return <TextQuestionResult {...(input as TextQuestionInput)}/>;
	} else if (input.type === "single-choice") {
		return <SingleChoiceQuestionResult {...(input as SingleChoiceQuestionInput)}/>;
	} else if (input.type === "multiple-choice") {
		return <MultipleChoiceQuestionResult {...(input as MultipleChoiceQuestionInput)}/>;
	} else if (input.type === "ordering") {
		return <OrderingQuestionResult {...(input as OrderingQuestionInput)}/>;
	} else if (input.type === "matching") {
		return <MatchingQuestionResult {...(input as MatchingQuestionInput)}/>;
	} else {
		return (
			<div>
				Unbekannter Frage-Typ: {input.type}
			</div>
		);
	}
}

function TrueFalseQuestionResult(
	{ inputAnswer, correctAnswer }: TrueFalseQuestionInput,
) {
	return (
		<>
			<div className="answer">
				Deine Antwort:{" "}
				<span className={inputAnswer === correctAnswer ? "correct" : "incorrect"}>
					{inputAnswer ? "Wahr" : "Falsch"}
				</span>
			</div>
			<div className="answer">
				Richtige Antwort:{" "}
				<span className="correct">
					{correctAnswer ? "Wahr" : "Falsch"}
				</span>
			</div>
		</>
	);
}

function NumericQuestionResult(
	{ inputAnswer, correctAnswer, tolerance }: NumericQuestionInput,
) {
	const isCorrect = tolerance ? Math.abs(inputAnswer - correctAnswer) <= tolerance : inputAnswer === correctAnswer;
	
	return (
		<>
			<div className="answer">
				Deine Antwort:{" "}
				<span className={isCorrect ? "correct" : "incorrect"}>
					{inputAnswer}
				</span>
			</div>
			<div className="answer">
				Richtige Antwort:{" "}
				<span className="correct">
					{correctAnswer}
				</span>
				{tolerance ? " (±" + tolerance + ")" : ""}
			</div>
		</>
	);
}

function TextQuestionResult(
	{ inputAnswer }: TextQuestionInput,
) {
	const answer = inputAnswer.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
	
	return (
		<>
			<div className="answer">
				Antwort:{" "}
				<span className="unknown">
					{answer}
				</span>
			</div>
		</>
	);
}

function SingleChoiceQuestionResult(
	{ inputAnswer, correctAnswerIndex, answers }: SingleChoiceQuestionInput,
) {
	return (
		<>
			<div className="answer">
				Deine Antwort:{" "}
				<span className={inputAnswer === correctAnswerIndex ? " correct" : " incorrect"}>
					{answers[inputAnswer]}
				</span>
			</div>
			<div className="answer">
				Richtige Antwort:{" "}
				<span className="correct">
					{answers[correctAnswerIndex]}
				</span>
			</div>
		</>
	);
}

function MultipleChoiceQuestionResult(
	{ inputAnswer, answers }: MultipleChoiceQuestionInput,
) {
	return (
		<>
			<div className="answer">
				Deine Antworten:
				<ul>
					{inputAnswer.map(value => (
						<li key={value} className={answers[value].isCorrect ? "correct" : "incorrect"}>
							{answers[value].answer}
						</li>
					))}
				</ul>
			</div>
			<div className="answer">
				Richtige Antworten:
				<ul>
					{answers.filter(answer => answer.isCorrect).map((answer, index) => (
						<li key={index} className="correct">
							{answer.answer}
						</li>
					))}
				</ul>
			</div>
		</>
	);
}

function OrderingQuestionResult(
	{ inputAnswer, items, correctAnswerOrder }: OrderingQuestionInput,
) {
	return (
		<>
			<div className="answer">
				Deine Reihenfolge:
				<ol>
					{inputAnswer.map((itemIndex, arrayIndex) => {
						const item = items[itemIndex];
						const isCorrect = item === correctAnswerOrder[arrayIndex];
						return (
							<li key={itemIndex} className={isCorrect ? "correct" : "incorrect"}>
								{item}
							</li>
						);
					})}
				</ol>
			</div>
			<div className="answer">
				Richtige Reihenfolge:
				<ol>
					{correctAnswerOrder.map((item, index) => (
						<li key={index} className="correct">
							{item}
						</li>
					))}
				</ol>
			</div>
		</>
	);
}

function MatchingQuestionResult(
	{ inputMatches, correctMatches }: MatchingQuestionInput,
) {
	return (
		<>
			<div className="answer">
				Deine Zuordnungen:
				<ul>
					{Object.entries(inputMatches).map(([item, match]) => {
						const isCorrect = correctMatches[item] === match;
						return (
							<li key={item} className={isCorrect ? "correct" : "incorrect"}>
								{item} → {match}
							</li>
						);
					})}
				</ul>
			</div>
			<div className="answer">
				Richtige Zuordnungen:
				<ul>
					{Object.entries(correctMatches).map(([item, match]) => (
						<li key={item} className="correct">
							{item} → {match}
						</li>
					))}
				</ul>
			</div>
		</>
	);
}
