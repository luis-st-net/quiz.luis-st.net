"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type MultipleChoiceQuestion, type MultipleChoiceQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function MultipleChoiceQuestion(
	{ question }: { question: MultipleChoiceQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "multiple-choice") {
			const input = savedAnswer as MultipleChoiceQuestionInput;
			return input.inputAnswer.map(index => question.answers[index]?.id || "");
		}
		return [];
	});
	
	const toggleOption = (answerId: string) => {
		const updatedSelection = selectedOptions.includes(answerId) ? selectedOptions.filter(id => id !== answerId) : [...selectedOptions, answerId];
		
		setSelectedOptions(updatedSelection);
		if (updatedSelection.length === 0) {
			removeAnswer(question.id);
		} else {
			const answerInput: MultipleChoiceQuestionInput = {
				question: question.question,
				type: "multiple-choice",
				inputAnswer: updatedSelection.map(id =>
					question.answers.findIndex(answer => answer.id === id),
				),
				answers: question.answers.map(answer => ({
					answer: answer.answer,
					isCorrect: answer.isCorrect,
				})),
			};
			
			saveAnswer(question.id, answerInput);
		}
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "multiple-choice") {
			const input = savedAnswer as MultipleChoiceQuestionInput;
			setSelectedOptions(input.inputAnswer.map(index => question.answers[index]?.id || ""));
		} else {
			setSelectedOptions([]);
		}
	}, [question.id, question.answers, getAnswer]);
	
	return (
		<div className="pl-2 tiny:pl-4">
			{question.answers.map((answer) => (
				<div key={answer.id} className="flex items-center my-3">
					<Ui.Checkbox id={answer.id} checked={selectedOptions.includes(answer.id)} onCheckedChange={() => toggleOption(answer.id)} className="mr-2"/>
					<Ui.Label htmlFor={answer.id}>
						{answer.answer}
					</Ui.Label>
				</div>
			))}
		</div>
	);
}