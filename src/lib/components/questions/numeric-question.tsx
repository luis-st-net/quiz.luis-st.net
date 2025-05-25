"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type NumericQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function NumericQuestion(
	{ question }: { question: NumericQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	const [answer, setAnswer] = useState<string>(
		getAnswer(question.id) || "",
	);
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setAnswer(newValue);
		if (newValue.trim()) {
			saveAnswer(question.id, newValue);
		} else {
			removeAnswer(question.id);
		}
	};
	
	useEffect(() => {
		setAnswer(getAnswer(question.id) || "");
	}, [question.id, getAnswer]);
	
	const toleranceInfo = question.tolerance ? `±${question.tolerance} ${question.tolerance === 1 ? "unit" : "units"}` : "";
	
	return (
		<div className="">
			<Ui.Input type="number" placeholder="Enter a number..." value={answer} onChange={handleChange} className="text-lg"/>
			{toleranceInfo && (
				<p className="text-sm text-muted-foreground mt-1.5">
					Tolerance: {toleranceInfo}
				</p>
			)}
		</div>
	);
}
