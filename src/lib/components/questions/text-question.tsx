"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type TextQuestion, type TextQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function TextQuestion(
	{ question }: { question: TextQuestion },
) {
	const { setPreventNavigation, saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	
	const [answer, setAnswer] = useState<string>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "text") {
			return (savedAnswer as TextQuestionInput).inputAnswer;
		}
		return "";
	});
	const [charCount, setCharCount] = useState(() => answer.length);
	
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setAnswer(newValue);
		setCharCount(newValue.length);
		
		if (newValue.length > 0) {
			const answerInput: TextQuestionInput = {
				question: question.question,
				type: "text",
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
		if (savedAnswer && savedAnswer.type === "text") {
			const text = (savedAnswer as TextQuestionInput).inputAnswer;
			setAnswer(text);
			setCharCount(text.length);
		} else {
			setAnswer("");
			setCharCount(0);
		}
	}, [question.id, getAnswer]);
	
	const isInvalidLength = (!!question.minLength && charCount < question.minLength) || (!!question.maxLength && charCount > question.maxLength);
	
	useEffect(() => {
		setPreventNavigation(isInvalidLength);
	}, [isInvalidLength, setPreventNavigation]);
	
	return (
		<div>
			<Ui.Textarea placeholder="Type your answer here..." value={answer} onChange={handleChange} rows={5} className={isInvalidLength ? "focus-visible:ring-destructive" : ""}/>
			{(question.minLength || question.maxLength) && (
				<div className="mt-1.5 text-sm text-muted-foreground flex flex-col justify-between xxs:flex-row">
					{question.minLength && (
						<p className={charCount < question.minLength ? "text-destructive" : ""}>
							Min: {charCount}/{question.minLength} characters
						</p>
					)}
					{question.maxLength && (
						<p className={charCount > question.maxLength ? "text-destructive" : ""}>
							Max: {charCount}/{question.maxLength} characters
						</p>
					)}
				</div>
			)}
		</div>
	);
}
