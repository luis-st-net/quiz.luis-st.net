"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { Answer, type SingleChoiceQuestion, type SingleChoiceQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function SingleChoiceQuestion(
	{ question }: { question: SingleChoiceQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	
	const [selectedOption, setSelectedOption] = useState<string>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "single-choice") {
			const index = (savedAnswer as SingleChoiceQuestionInput).inputAnswer;
			return question.answers[index]?.id || "";
		}
		return "";
	});
	
	const handleOptionChange = (value: string) => {
		setSelectedOption(value);
		
		const answerIndex = question.answers.findIndex(answer => answer.id === value);
		if (answerIndex !== -1) {
			const answerInput: SingleChoiceQuestionInput = {
				question: question.question,
				type: "single-choice",
				inputAnswer: answerIndex,
				correctAnswerIndex: typeof question.correctAnswerIndex === "number"
					? question.correctAnswerIndex
					: question.answers.findIndex(a => a.id === (question.correctAnswerIndex as Answer).id),
				answers: question.answers.map(a => a.answer),
			};
			
			saveAnswer(question.id, answerInput);
		}
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "single-choice") {
			const index = (savedAnswer as SingleChoiceQuestionInput).inputAnswer;
			setSelectedOption(question.answers[index]?.id || "");
		} else {
			setSelectedOption("");
		}
	}, [question.id, getAnswer, question.answers]);
	
	return (
		<div className="pl-4">
			<Ui.RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
				{question.answers.map((answer) => (
					<div key={answer.id} className="flex items-center space-x-2">
						<Ui.RadioGroupItem value={answer.id} id={answer.id}/>
						<Ui.Label htmlFor={answer.id}>
							{answer.answer}
						</Ui.Label>
					</div>
				))}
			</Ui.RadioGroup>
		</div>
	);
}
