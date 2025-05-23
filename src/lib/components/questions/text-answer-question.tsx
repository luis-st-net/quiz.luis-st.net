"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type TextAnswerQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function TextAnswerQuestion(
	{ question }: { question: TextAnswerQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [answer, setAnswer] = useState<string>(
		getAnswer(question.id) || "",
	);
	const [charCount, setCharCount] = useState(0);
	
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setAnswer(newValue);
		setCharCount(newValue.length);
		saveAnswer(question.id, newValue);
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id) || "";
		setAnswer(savedAnswer);
		setCharCount(savedAnswer.length);
	}, [question.id, getAnswer]);
	
	const isValidLength = (!question.minLength || charCount >= question.minLength) && (!question.maxLength || charCount <= question.maxLength);
	
	return (
		<div className="space-y-4">
			<Ui.Textarea placeholder="Type your answer here..." value={answer} onChange={handleChange} rows={5} className={!isValidLength ? "border-destructive" : ""}/>
			{(question.minLength || question.maxLength) && (
				<div className="text-sm text-muted-foreground flex justify-between">
					{question.minLength && (
						<span className={charCount < question.minLength ? "text-destructive" : ""}>
							Min: {charCount}/{question.minLength} characters
						</span>
					)}
					{question.maxLength && (
						<span className={charCount > question.maxLength ? "text-destructive" : ""}>
							Max: {charCount}/{question.maxLength} characters
						</span>
					)}
				</div>
			)}
		</div>
	);
}
