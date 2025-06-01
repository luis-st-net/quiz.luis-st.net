"use client";

import ContentPane from "@/lib/components/content-pane";
import * as Ui from "@/lib/components/ui/";
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
				<h3 className="m-1 text-2xl">
					<strong>
						Quiz wurde nicht gefunden
					</strong>
				</h3>
			</ContentPane>
		);
	}
	
	return (
		<div className="w-4/5 my-16 lg:w-2/3 2xl:w-1/3">
			<ContentPane defaultSpacing={false} defaultColor={true}>
				<div className="p-4">
					<h3 className="m-1 text-2xl">
						<strong>
							{quiz.name} - Ergebnisse
						</strong>
					</h3>
				</div>
			</ContentPane>
			<div className="flex flex-col gap-4 m-8">
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
				<h4 className="mb-2.5 text-xl">
					{input.question}
				</h4>
				<Ui.Separator className="mb-2.5 h-0.5"/>
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
			<div className="text-custom-red">
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
			<div className="mb-1 ml-3.5">
				Deine Antwort:{" "}
				<span className={inputAnswer === correctAnswer ? "text-custom-green" : "text-custom-red"}>
					{inputAnswer ? "Wahr" : "Falsch"}
				</span>
			</div>
			<div className="ml-3.5">
				Richtige Antwort:{" "}
				<span className="text-custom-green">
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
			<div className="mb-1 ml-3.5">
				Deine Antwort:{" "}
				<span className={isCorrect ? "text-custom-green" : "text-custom-red"}>
					{inputAnswer}
				</span>
			</div>
			<div className="ml-3.5">
				Richtige Antwort:{" "}
				<span className="text-custom-green">
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
			<div className="ml-3.5">
				Antwort:
			</div>
			<div className="ml-3.5 text-custom-orange">
				{answer}
			</div>
		</>
	);
}

function SingleChoiceQuestionResult(
	{ inputAnswer, correctAnswerIndex, answers }: SingleChoiceQuestionInput,
) {
	return (
		<>
			<div className="mb-1 ml-3.5">
				Deine Antwort:{" "}
				<span className={inputAnswer === correctAnswerIndex ? " text-custom-green" : " text-custom-red"}>
					{answers[inputAnswer]}
				</span>
			</div>
			<div className="ml-3.5">
				Richtige Antwort:{" "}
				<span className="text-custom-green">
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
			<div className="mb-1 ml-3.5">
				<p>
					Deine Antworten:
				</p>
				<ul className="my-2 ml-8 list-disc">
					{inputAnswer.map(value => (
						<li key={value} className="list-item">
						<span className={answers[value].isCorrect ? "text-custom-green" : "text-custom-red"}>
							{answers[value].answer}
						</span>
						</li>
					))}
				</ul>
			</div>
			<div className="ml-3.5">
				<p>
					Richtige Antworten:
				</p>
				<ul className="my-2 ml-8 list-disc">
					{answers.filter(answer => answer.isCorrect).map((answer, index) => (
						<li key={index} className="list-item">
						<span className="text-custom-green">
							{answer.answer}
						</span>
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
			<div className="mb-1 ml-3.5">
				<p>
					Deine Reihenfolge:
				</p>
				<ol className="my-2 ml-8 list-decimal">
					{inputAnswer.map((itemIndex, arrayIndex) => {
						const item = items[itemIndex];
						const isCorrect = item === correctAnswerOrder[arrayIndex];
						return (
							<li key={itemIndex} className="list-item">
							<span className={isCorrect ? "text-custom-green" : "text-custom-red"}>
								{item}
							</span>
							</li>
						);
					})}
				</ol>
			</div>
			<div className="ml-3.5">
				<p>
					Richtige Reihenfolge:
				</p>
				<ol className="my-2 ml-8 list-decimal">
					{correctAnswerOrder.map((item, index) => (
						<li key={index} className="list-item">
						<span className="text-custom-green">
							{item}
						</span>
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
			<div className="mb-1 ml-3.5">
				<p>
					Deine Zuordnungen:
				</p>
				<ul className="my-2 ml-8 list-disc">
					{Object.entries(inputMatches).map(([item, match]) => {
						const isCorrect = correctMatches[item] === match;
						return (
							<li key={item} className="list-item">
								<span className={isCorrect ? "text-custom-green" : "text-custom-red"}>
									{item}
								</span>
								{" "}→{" "}
								<span className={isCorrect ? "text-custom-green" : "text-custom-red"}>
									{match}
								</span>
							</li>
						);
					})}
				</ul>
			</div>
			
			<div className="ml-3.5">
				<p>
					Richtige Zuordnungen:
				</p>
				<ul className="my-2 ml-8 list-disc">
					{Object.entries(correctMatches).map(([item, match]) => (
						<li key={item} className="list-item">
							<span className="text-custom-green">
								{item}
							</span>
							{" "}→{" "}
							<span className="text-custom-green">
								{match}
							</span>
						</li>
					))}
				</ul>
			</div>
		</>
	);
}
