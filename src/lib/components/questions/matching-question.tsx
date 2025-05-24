"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type MatchingQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function MatchingQuestion(
	{ question }: { question: MatchingQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [matches, setMatches] = useState<Record<string, string>>(() => {
		const savedAnswer = getAnswer(question.id);
		return savedAnswer ? JSON.parse(savedAnswer) : {};
	});
	
	const handleMatch = (itemId: string, matchId: string) => {
		const newMatches = {
			...matches,
			[itemId]: matchId,
		};
		setMatches(newMatches);
		saveAnswer(question.id, JSON.stringify(newMatches));
	};
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer) {
			setMatches(JSON.parse(savedAnswer));
		} else {
			setMatches({});
		}
	}, [question.id, getAnswer]);
	
	return (
		<div className="space-y-6">
			{question.items.map((item) => (
				<div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="w-full sm:w-1/2 p-2 border rounded">
						{item.answer}
					</div>
					<div className="flex-shrink-0 flex items-center justify-center">
						<Icons.ArrowRight className="h-4 w-4 mx-2"/>
					</div>
					<Ui.Select value={matches[item.id] || ""} onValueChange={(value) => handleMatch(item.id, value)}>
						<Ui.SelectTrigger className="w-full sm:w-1/2">
							<Ui.SelectValue placeholder="Select a match"/>
						</Ui.SelectTrigger>
						<Ui.SelectContent>
							<Ui.SelectItem value="">Choose a match...</Ui.SelectItem>
							{question.matches.map((match) => (
								<Ui.SelectItem key={match.id} value={match.id}>
									{match.answer}
								</Ui.SelectItem>
							))}
						</Ui.SelectContent>
					</Ui.Select>
				</div>
			))}
		</div>
	);
}
