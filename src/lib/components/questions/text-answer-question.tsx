"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type TextAnswerQuestion, type TextAnswerQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function TextAnswerQuestion(
	{ question }: { question: TextAnswerQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	
	const [answer, setAnswer] = useState<string>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.questionType === "text") {
			return (savedAnswer as TextAnswerQuestionInput).inputAnswer;
		}
		return "";
	});
	const [charCount, setCharCount] = useState(() => answer.length);
	
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setAnswer(newValue);
		setCharCount(newValue.length);
		
		if (newValue.length > 0) {
			const answerInput: TextAnswerQuestionInput = {
				question: question.question,
				questionType: "text",
				inputAnswer: newValue,
				minLength: question.minLength,
				maxLength: question.maxLength,
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.questionType === "text") {
			const text = (savedAnswer as TextAnswerQuestionInput).inputAnswer;
			setAnswer(text);
			setCharCount(text.length);
		} else {
			setAnswer("");
			setCharCount(0);
		}
	}, [question.id, getAnswer]);
	
	const isValidLength = (!question.minLength || charCount >= question.minLength) && (!question.maxLength || charCount <= question.maxLength);
	
	return (
		<div>
			<Ui.Textarea placeholder="Type your answer here..." value={answer} onChange={handleChange} rows={5} className={!isValidLength ? "focus-visible:ring-destructive" : ""}/>
			{(question.minLength || question.maxLength) && (
				<div className="mt-1.5 text-sm text-muted-foreground flex justify-between">
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
