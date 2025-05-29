"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type NumericQuestion, type NumericQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function NumericQuestion(
	{ question }: { question: NumericQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	
	const [answer, setAnswer] = useState<string>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "numeric") {
			return String((savedAnswer as NumericQuestionInput).inputAnswer);
		}
		return "";
	});
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setAnswer(newValue);
		
		if (newValue.trim()) {
			const numericValue = parseFloat(newValue);
			const answerInput: NumericQuestionInput = {
				question: question.question,
				type: "numeric",
				inputAnswer: numericValue,
				correctAnswer: question.correctAnswer,
				tolerance: question.tolerance,
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "numeric") {
			setAnswer(String((savedAnswer as NumericQuestionInput).inputAnswer));
		} else {
			setAnswer("");
		}
	}, [question.id, getAnswer]);
	
	const toleranceInfo = question.tolerance ? `±${question.tolerance} ${question.tolerance === 1 ? "Einheit" : "Einheiten"}` : "";
	
	return (
		<div className="">
			<Ui.Input type="number" placeholder="Geben Sie eine Zahl ein..." value={answer} onChange={handleChange}/>
			{toleranceInfo && (
				<p className="text-sm text-muted-foreground mt-1.5">
					Toleranz: {toleranceInfo}
				</p>
			)}
		</div>
	);
}
