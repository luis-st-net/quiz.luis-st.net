"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type TrueFalseQuestion, type TrueFalseQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function TrueFalseQuestion(
	{ question }: { question: TrueFalseQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [selectedValue, setSelectedValue] = useState<string>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.questionType === "true-false") {
			return (savedAnswer as TrueFalseQuestionInput).inputAnswer ? "true" : "false";
		}
		return "";
	});
	
	const handleValueChange = (value: string) => {
		setSelectedValue(value);
		
		const answerInput: TrueFalseQuestionInput = {
			question: question.question,
			questionType: "true-false",
			inputAnswer: value === "true",
			correctAnswer: question.correctAnswer,
		};
		
		saveAnswer(question.id, answerInput);
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.questionType === "true-false") {
			setSelectedValue((savedAnswer as TrueFalseQuestionInput).inputAnswer ? "true" : "false");
		} else {
			setSelectedValue("");
		}
	}, [question.id, getAnswer]);
	
	return (
		<div className="pl-4">
			<Ui.RadioGroup value={selectedValue} onValueChange={handleValueChange}>
				<div className="flex items-center space-x-2">
					<Ui.RadioGroupItem value="true" id={`${question.id}-true`}/>
					<Ui.Label htmlFor={`${question.id}-true`}>
						True
					</Ui.Label>
				</div>
				<div className="flex items-center space-x-2">
					<Ui.RadioGroupItem value="false" id={`${question.id}-false`}/>
					<Ui.Label htmlFor={`${question.id}-false`}>
						False
					</Ui.Label>
				</div>
			</Ui.RadioGroup>
		</div>
	);
}
