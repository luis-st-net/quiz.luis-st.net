"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type MatchingQuestion, type MatchingQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn, shuffleArray } from "@/lib/utility";

export default function MatchingQuestion(
	{ question }: { question: MatchingQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	const [matches, setMatches] = useState<Record<string, string>>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "matching") {
			return (savedAnswer as MatchingQuestionInput).rawInput;
		}
		return {};
	});
	
	const [shuffledMatches, setShuffledMatches] = useState(() =>
		shuffleArray(question.matches)
	);
	
	const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
	const [dragSourceItemId, setDragSourceItemId] = useState<string | null>(null);
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "matching") {
			setMatches((savedAnswer as MatchingQuestionInput).rawInput);
		} else {
			setMatches({});
		}
		setShuffledMatches(shuffleArray(question.matches));
	}, [question.id, question.matches]);
	
	const updateAnswer = (matches: Record<string, string>) => {
		setMatches(matches);
		
		if (Object.keys(matches).length === question.items.length) {
			
			console.log("Saving answer for question:", question.id, matches);
			console.log("Matches of Question:", question.matches);
			console.log("Items of Question:", question.items);
			
			let inputMatches: Record<string, string> = {};
			for (const itemId in matches) {
				const inputKey = question.items.find(item => item.id === itemId);
				const inputMatch = question.matches.find(match => match.id === matches[itemId]);
				if (inputKey && inputMatch) {
					inputMatches[inputKey.answer] = inputMatch.answer;
				}
			}
			
			let correctMatches: Record<string, string> = {};
			question.matches.forEach(match => {
				correctMatches[match.matchesTo.answer] = match.answer;
			});
			
			const answerInput: MatchingQuestionInput = {
				question: question.question,
				type: "matching",
				rawInput: matches,
				inputMatches: inputMatches,
				correctMatches: correctMatches,
			};
			
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	};
	
	const handleMatch = (itemId: string, matchId: string) => {
		const newMatches = { ...matches };
		if (dragSourceItemId && dragSourceItemId !== itemId) {
			delete newMatches[dragSourceItemId];
		}
		newMatches[itemId] = matchId;
		updateAnswer(newMatches);
	};
	
	const removeMatch = (itemId: string) => {
		const newMatches = { ...matches };
		const removedMatchId = newMatches[itemId];
		delete newMatches[itemId];
		
		updateAnswer(newMatches);
		
		if (draggedMatch === removedMatchId) {
			setDraggedMatch(null);
		}
	};
	
	const handleDragStart = (e: React.DragEvent, matchId: string, sourceItemId: string | null = null) => {
		setDraggedMatch(matchId);
		setDragSourceItemId(sourceItemId);
		e.dataTransfer.setData("matchId", matchId);
		e.dataTransfer.setData("sourceItemId", sourceItemId || "");
		e.dataTransfer.effectAllowed = "move";
	};
	
	const handleDragEnd = () => {
		setDraggedMatch(null);
		setDragSourceItemId(null);
	};
	
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};
	
	const handleDrop = (e: React.DragEvent, itemId: string) => {
		e.preventDefault();
		
		const matchId = e.dataTransfer.getData("matchId");
		if (matchId) {
			handleMatch(itemId, matchId);
		}
	};
	
	const findMatch = (id: string) => {
		return question.matches.find(match => match.id === id);
	};
	
	return (
		<div>
			<div className="flex flex-col gap-4 mb-6">
				{question.items.map((item) => (
					<div key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="w-full min-h-[50px] flex items-center border rounded bg-custom-primary p-2 sm:w-1/2">
							{item.answer}
						</div>
						<div className="flex items-center gap-2 w-full sm:w-1/2">
							<div className="flex items-center justify-center">
								<Icons.ArrowRight className="size-4 mx-2 sm:rotate-0"/>
							</div>
							<div
								onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item.id)}
								className={cn("flex-1 min-h-[50px] flex items-center border rounded p-2 cursor-move", matches[item.id] ? "bg-custom-primary" : "")}
							>
								{matches[item.id] ? (
									<div
										draggable onDragStart={(e) => handleDragStart(e, matches[item.id], item.id)} onDragEnd={handleDragEnd}
										className={cn("w-full flex justify-between items-center", draggedMatch === matches[item.id] && dragSourceItemId === item.id ? "opacity-50" : "")}
									>
										<p>
											{findMatch(matches[item.id])?.answer}
										</p>
										<Ui.Button variant="ghost" onClick={() => removeMatch(item.id)} className="size-8">
											<Icons.X className="size-3"/>
										</Ui.Button>
									</div>
								) : (
									<p className="text-muted-foreground">
										Drop your answer here
									</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
			
			<div>
				<p className="text-sm text-muted-foreground mb-3">
					Available answers (drag to match):
				</p>
				<div className="flex flex-wrap gap-2">
					{shuffledMatches.map(match => {
						const isMatched = Object.values(matches).includes(match.id);
						if (isMatched) {
							return null;
						}
						return (
							<div
								key={match.id} draggable onDragStart={(e) => handleDragStart(e, match.id)} onDragEnd={handleDragEnd}
								className={cn("border rounded bg-custom-primary p-2 cursor-move", draggedMatch === match.id ? "opacity-50" : "")}
							>
								{match.answer}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
