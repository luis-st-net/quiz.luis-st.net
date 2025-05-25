"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type TrueFalseQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function TrueFalseQuestion(
	{ question }: { question: TrueFalseQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [selectedValue, setSelectedValue] = useState<string>(
		getAnswer(question.id) || "",
	);
	
	const handleValueChange = (value: string) => {
		setSelectedValue(value);
		saveAnswer(question.id, value);
	};
	
	useEffect(() => {
		setSelectedValue(getAnswer(question.id) || "");
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
