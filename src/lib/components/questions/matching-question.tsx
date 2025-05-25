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
	
	const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
	const [dragSourceItemId, setDragSourceItemId] = useState<string | null>(null);
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer) {
			setMatches(JSON.parse(savedAnswer));
			updateAvailableMatches(JSON.parse(savedAnswer));
		} else {
			setMatches({});
		}
	}, [question.id, question.matches, getAnswer]);
	
	const updateAvailableMatches = (currentMatches: Record<string, string>) => {
		const matchedIds = Object.values(currentMatches);
		const filtered = question.matches.filter(match => !matchedIds.includes(match.id));
	};
	
	const handleMatch = (itemId: string, matchId: string) => {
		const newMatches = { ...matches };
		
		if (dragSourceItemId && dragSourceItemId !== itemId) {
			delete newMatches[dragSourceItemId];
		}
		
		if (newMatches[itemId] && newMatches[itemId] !== matchId) {}
		
		newMatches[itemId] = matchId;
		
		setMatches(newMatches);
		saveAnswer(question.id, JSON.stringify(newMatches));
		updateAvailableMatches(newMatches);
	};
	
	const removeMatch = (itemId: string) => {
		const newMatches = { ...matches };
		const removedMatchId = newMatches[itemId];
		delete newMatches[itemId];
		setMatches(newMatches);
		saveAnswer(question.id, JSON.stringify(newMatches));
		updateAvailableMatches(newMatches);
		
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
		<div className="space-y-8">
			<div className="space-y-6">
				{question.items.map((item) => (
					<div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<div className="w-full sm:w-1/2 p-2 border rounded">
							{item.answer}
						</div>
						<div className="flex-shrink-0 flex items-center justify-center">
							<Icons.ArrowRight className="h-4 w-4 mx-2"/>
						</div>
						<div
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, item.id)}
							className="w-full sm:w-1/2 p-2 border rounded min-h-12 flex items-center"
						>
							{matches[item.id] ? (
								<div
									className={`flex justify-between w-full items-center ${draggedMatch === matches[item.id] && dragSourceItemId === item.id ? "opacity-50" : ""}`}
									draggable
									onDragStart={(e) => handleDragStart(e, matches[item.id], item.id)}
									onDragEnd={handleDragEnd}
								>
									<span className="cursor-move">{findMatch(matches[item.id])?.answer}</span>
									<Ui.Button variant="ghost" size="sm" onClick={() => removeMatch(item.id)}>
										<Icons.X className="h-4 w-4"/>
									</Ui.Button>
								</div>
							) : (
								<span className="text-muted-foreground">Drop your answer here</span>
							)}
						</div>
					</div>
				))}
			</div>
			
			<div className="mt-8">
				<p className="text-sm text-muted-foreground mb-4">Available answers (drag to match):</p>
				<div className="flex flex-wrap gap-2">
					{question.matches.map(match => {
						const isMatched = Object.values(matches).includes(match.id);
						if (isMatched) return null;
						
						return (
							<div
								key={match.id}
								draggable
								className={`p-2 border rounded cursor-move bg-card ${draggedMatch === match.id ? "opacity-50" : ""}`}
								onDragStart={(e) => handleDragStart(e, match.id)}
								onDragEnd={handleDragEnd}
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
