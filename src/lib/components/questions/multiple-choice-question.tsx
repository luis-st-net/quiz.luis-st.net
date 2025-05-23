"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type MultipleChoiceQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function MultipleChoiceQuestion(
	{ question }: { question: MultipleChoiceQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
		const savedAnswer = getAnswer(question.id);
		return savedAnswer ? JSON.parse(savedAnswer) : [];
	});
	
	const toggleOption = (answerId: string) => {
		const updatedSelection = selectedOptions.includes(answerId) ? selectedOptions.filter(id => id !== answerId) : [...selectedOptions, answerId];
		
		setSelectedOptions(updatedSelection);
		saveAnswer(question.id, JSON.stringify(updatedSelection));
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer) {
			setSelectedOptions(JSON.parse(savedAnswer));
		} else {
			setSelectedOptions([]);
		}
	}, [question.id, getAnswer]);
	
	return (
		<div className="space-y-4">
			{question.answers.map((answer) => (
				<div key={answer.id} className="flex items-center space-x-2">
					<Ui.Checkbox id={answer.id} checked={selectedOptions.includes(answer.id)} onCheckedChange={() => toggleOption(answer.id)}/>
					<Ui.Label htmlFor={answer.id}>
						{answer.text}
					</Ui.Label>
				</div>
			))}
		</div>
	);
}
