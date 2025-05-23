"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type SingleChoiceQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function SingleChoiceQuestion(
	{ question }: { question: SingleChoiceQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [selectedOption, setSelectedOption] = useState<string | undefined>(
		getAnswer(question.id),
	);
	
	const handleOptionChange = (value: string) => {
		setSelectedOption(value);
		saveAnswer(question.id, value);
	};
	
	useEffect(() => {
		setSelectedOption(getAnswer(question.id));
	}, [question.id, getAnswer]);
	
	return (
		<div className="space-y-4">
			<Ui.RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
				{question.answers.map((answer) => (
					<div key={answer.id} className="flex items-center space-x-2">
						<Ui.RadioGroupItem value={answer.id} id={answer.id}/>
						<Ui.Label htmlFor={answer.id}>
							{answer.text}
						</Ui.Label>
					</div>
				))}
			</Ui.RadioGroup>
		</div>
	);
}
