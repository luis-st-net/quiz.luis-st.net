"use client";

import React, { useEffect, useState } from "react";
import * as Ui from "@/lib/components/ui/";
import { type FillBlankQuestion, type FillBlankQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn } from "@/lib/utility";

export default function FillBlankQuestion(
	{ question }: { question: FillBlankQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();

	const [answers, setAnswers] = useState<Record<string, string>>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "fill-blank") {
			return (savedAnswer as FillBlankQuestionInput).inputAnswers;
		}
		return {};
	});

	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "fill-blank") {
			setAnswers((savedAnswer as FillBlankQuestionInput).inputAnswers);
		} else {
			setAnswers({});
		}
	}, [question.id]);

	const updateAnswer = (blankId: string, value: string) => {
		const newAnswers = { ...answers, [blankId]: value };
		setAnswers(newAnswers);

		// Check if all blanks are filled
		const allFilled = question.blanks.every(blank => newAnswers[blank.id]?.trim());

		if (allFilled) {
			const answerInput: FillBlankQuestionInput = {
				question: question.question,
				type: "fill-blank",
				inputAnswers: newAnswers,
				blanks: question.blanks,
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	};

	// Parse the question text to find {{blank:id}} patterns and replace with inputs
	const renderQuestionWithBlanks = () => {
		const parts = question.question.split(/({{blank:\d+}})/g);

		return parts.map((part, index) => {
			const blankMatch = part.match(/{{blank:(\d+)}}/);
			if (blankMatch) {
				const blankId = blankMatch[1];
				const blank = question.blanks.find(b => b.id === blankId);
				if (!blank) return null;

				return (
					<Ui.Input
						key={index}
						type="text"
						value={answers[blankId] || ""}
						onChange={(e) => updateAnswer(blankId, e.target.value)}
						placeholder={`Lücke ${blankId}`}
						className={cn(
							"inline-flex w-auto min-w-[120px] max-w-[200px] mx-1 align-baseline",
							answers[blankId]?.trim() ? "border-custom-primary" : ""
						)}
					/>
				);
			}
			return <span key={index}>{part}</span>;
		});
	};

	return (
		<div className="space-y-4">
			<div className="text-base leading-relaxed flex flex-wrap items-center gap-y-2">
				{renderQuestionWithBlanks()}
			</div>
			<p className="text-sm text-muted-foreground mt-4">
				Füllen Sie alle Lücken aus, um fortzufahren.
			</p>
		</div>
	);
}
