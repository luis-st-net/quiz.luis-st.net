"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type MatchingQuestion, type MatchingQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn, shuffleArray } from "@/lib/utility";

function useMatchingLogic(question: MatchingQuestion) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	
	const [matches, setMatches] = useState<Record<string, string>>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "matching") {
			return (savedAnswer as MatchingQuestionInput).rawInput;
		}
		return {};
	});
	
	const [shuffledMatches, setShuffledMatches] = useState(question.matches);
	
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
				const answer = question.items.find(item => item.id === match.matchesTo);
				if (answer) {
					correctMatches[answer.answer] = match.answer;
				}
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
		Object.keys(newMatches).forEach(key => {
			if (newMatches[key] === matchId && key !== itemId) {
				delete newMatches[key];
			}
		});
		newMatches[itemId] = matchId;
		updateAnswer(newMatches);
	};
	
	const removeMatch = (itemId: string) => {
		const newMatches = { ...matches };
		delete newMatches[itemId];
		updateAnswer(newMatches);
	};
	
	const findMatch = (id: string) => {
		return question.matches.find(match => match.id === id);
	};
	
	return {
		matches,
		shuffledMatches,
		handleMatch,
		removeMatch,
		findMatch,
	};
}

function MatchingQuestionMobile(
	{ question }: { question: MatchingQuestion },
) {
	const { matches, shuffledMatches, handleMatch, removeMatch } = useMatchingLogic(question);
	
	const clearValue = "__CLEAR__";
	
	const getAvailableMatches = (currentItemId: string) => {
		const usedMatches = Object.entries(matches).filter(([itemId]) => itemId !== currentItemId).map(([, matchId]) => matchId);
		
		return shuffledMatches.filter(match => !usedMatches.includes(match.id));
	};
	
	const handleValueChange = (value: string, itemId: string) => {
		if (value === clearValue) {
			removeMatch(itemId);
		} else if (value) {
			handleMatch(itemId, value);
		}
	};
	
	return (
		<div className="flex flex-col gap-4 mb-6">
			{question.items.map((item) => (
				<div key={item.id} className="flex flex-col gap-4">
					<div className="min-h-[50px] flex items-center border rounded bg-custom-primary p-3">
						{item.answer}
					</div>
					<div className="flex items-center gap-2">
						<Icons.ArrowRight className="size-4 mx-2"/>
						<div className="w-full">
							<Ui.Select value={matches[item.id] || ""} onValueChange={(value) => handleValueChange(value, item.id)}>
								<Ui.SelectTrigger className="w-full min-h-[50px] ">
									<Ui.SelectValue placeholder="Select a match..."/>
								</Ui.SelectTrigger>
								<Ui.SelectContent>
									{matches[item.id] && (
										<Ui.SelectItem value={clearValue}>
											<span className="text-muted-foreground">
												Auswahl löschen
											</span>
										</Ui.SelectItem>
									)}
									{getAvailableMatches(item.id).map((match) => (
										<Ui.SelectItem key={match.id} value={match.id}>
											{match.answer}
										</Ui.SelectItem>
									))}
								</Ui.SelectContent>
							</Ui.Select>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function MatchingQuestionDesktop(
	{ question }: { question: MatchingQuestion },
) {
	const { matches, shuffledMatches, handleMatch, removeMatch: baseRemoveMatch, findMatch } = useMatchingLogic(question);
	
	const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
	const [dragSourceItemId, setDragSourceItemId] = useState<string | null>(null);
	
	const removeMatch = (itemId: string) => {
		const removedMatchId = matches[itemId];
		baseRemoveMatch(itemId);
		
		if (draggedMatch === removedMatchId) {
			setDraggedMatch(null);
			setDragSourceItemId(null);
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
	
	return (
		<div>
			<div className="flex flex-col gap-4 mb-6">
				{question.items.map((item) => (
					<div key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="w-full min-h-[50px] flex items-center border rounded bg-custom-primary p-2 sm:w-1/2">
							{item.answer}
						</div>
						<div className="flex items-center justify-center">
							<Icons.ArrowRight className="size-4 mx-2"/>
						</div>
						<div
							onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item.id)}
							className={cn("w-full min-h-[50px] flex items-center border rounded p-2 cursor-move sm:w-1/2", matches[item.id] ? "bg-custom-primary" : "")}
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
									Ziehen Sie Ihre Antwort hier hinein
								</p>
							)}
						</div>
					</div>
				))}
			</div>
			
			<div>
				<p className="text-sm text-muted-foreground mb-3">
					Verfügbare Antworten (durch Ziehen zuordnen):
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

export default function MatchingQuestion(
	{ question }: { question: MatchingQuestion },
) {
	const [isMobile, setIsMobile] = useState(false);
	
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);
		
		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);
	
	useEffect(() => {
		const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		if (isTouchDevice && window.innerWidth < 1024) {
			setIsMobile(true);
		}
	}, []);
	
	return isMobile ? (
		<MatchingQuestionMobile question={question}/>
	) : (
		<MatchingQuestionDesktop question={question}/>
	);
}
