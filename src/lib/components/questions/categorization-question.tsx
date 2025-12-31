"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type CategorizationQuestion, type CategorizationQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn, shuffleArray } from "@/lib/utility";

function useCategorizationLogic(question: CategorizationQuestion) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();

	const [assignments, setAssignments] = useState<Record<string, string>>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "categorization") {
			return (savedAnswer as CategorizationQuestionInput).inputCategories;
		}
		return {};
	});

	const [shuffledItems, setShuffledItems] = useState(question.items);

	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "categorization") {
			setAssignments((savedAnswer as CategorizationQuestionInput).inputCategories);
		} else {
			setAssignments({});
		}
		setShuffledItems(shuffleArray(question.items));
	}, [question.id, question.items]);

	const updateAnswer = (newAssignments: Record<string, string>) => {
		setAssignments(newAssignments);

		if (Object.keys(newAssignments).length === question.items.length) {
			const answerInput: CategorizationQuestionInput = {
				question: question.question,
				type: "categorization",
				inputCategories: newAssignments,
				items: question.items.map(item => ({
					text: item.text,
					correctCategory: item.correctCategory,
				})),
				categories: question.categories.map(cat => ({
					id: cat.id,
					name: cat.name,
				})),
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	};

	const assignToCategory = (itemText: string, categoryId: string) => {
		const newAssignments = { ...assignments, [itemText]: categoryId };
		updateAnswer(newAssignments);
	};

	const removeFromCategory = (itemText: string) => {
		const newAssignments = { ...assignments };
		delete newAssignments[itemText];
		updateAnswer(newAssignments);
	};

	return {
		assignments,
		shuffledItems,
		assignToCategory,
		removeFromCategory,
	};
}

function CategorizationQuestionMobile(
	{ question }: { question: CategorizationQuestion },
) {
	const { assignments, shuffledItems, assignToCategory, removeFromCategory } = useCategorizationLogic(question);

	const clearValue = "__CLEAR__";

	const handleValueChange = (value: string, itemText: string) => {
		if (value === clearValue) {
			removeFromCategory(itemText);
		} else if (value) {
			assignToCategory(itemText, value);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{shuffledItems.map((item) => (
				<div key={item.id} className="flex flex-col gap-2">
					<div className="min-h-[50px] flex items-center border rounded bg-custom-primary p-3">
						{item.text}
					</div>
					<div className="flex items-center gap-2">
						<Icons.ArrowRight className="size-4 mx-2" />
						<div className="w-full">
							<Ui.Select
								value={assignments[item.text] || ""}
								onValueChange={(value) => handleValueChange(value, item.text)}
							>
								<Ui.SelectTrigger className="w-full min-h-[50px]">
									<Ui.SelectValue placeholder="Kategorie wählen..." />
								</Ui.SelectTrigger>
								<Ui.SelectContent>
									{assignments[item.text] && (
										<Ui.SelectItem value={clearValue}>
											<span className="text-muted-foreground">
												Auswahl löschen
											</span>
										</Ui.SelectItem>
									)}
									{question.categories.map((category) => (
										<Ui.SelectItem key={category.id} value={category.id}>
											{category.name}
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

function CategorizationQuestionDesktop(
	{ question }: { question: CategorizationQuestion },
) {
	const { assignments, shuffledItems, assignToCategory, removeFromCategory } = useCategorizationLogic(question);

	const [draggedItem, setDraggedItem] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, itemText: string) => {
		setDraggedItem(itemText);
		e.dataTransfer.setData("itemText", itemText);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragEnd = () => {
		setDraggedItem(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, categoryId: string) => {
		e.preventDefault();
		const itemText = e.dataTransfer.getData("itemText");
		if (itemText) {
			assignToCategory(itemText, categoryId);
			setDraggedItem(null);
		}
	};

	const getItemsInCategory = (categoryId: string) => {
		return shuffledItems.filter(item => assignments[item.text] === categoryId);
	};

	const getUnassignedItems = () => {
		return shuffledItems.filter(item => !assignments[item.text]);
	};

	return (
		<div className="space-y-6">
			{/* Category buckets */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{question.categories.map((category) => (
					<div
						key={category.id}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, category.id)}
						className="border-2 border-dashed rounded-lg p-4 min-h-[150px] transition-colors hover:border-primary"
					>
						<h3 className="font-semibold text-sm mb-3 text-center border-b pb-2">
							{category.name}
						</h3>
						<div className="flex flex-col gap-2">
							{getItemsInCategory(category.id).map((item) => (
								<div
									key={item.id}
									draggable
									onDragStart={(e) => handleDragStart(e, item.text)}
									onDragEnd={handleDragEnd}
									className={cn(
										"flex justify-between items-center border rounded bg-custom-primary p-2 cursor-move",
										draggedItem === item.text ? "opacity-50" : ""
									)}
								>
									<span className="text-sm">{item.text}</span>
									<Ui.Button
										variant="ghost"
										size="sm"
										onClick={() => removeFromCategory(item.text)}
										className="size-6 p-0"
									>
										<Icons.X className="size-3" />
									</Ui.Button>
								</div>
							))}
							{getItemsInCategory(category.id).length === 0 && (
								<p className="text-xs text-muted-foreground text-center py-4">
									Elemente hierher ziehen
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Unassigned items */}
			{getUnassignedItems().length > 0 && (
				<div>
					<p className="text-sm text-muted-foreground mb-3">
						Verfügbare Elemente (durch Ziehen zuordnen):
					</p>
					<div className="flex flex-wrap gap-2">
						{getUnassignedItems().map((item) => (
							<div
								key={item.id}
								draggable
								onDragStart={(e) => handleDragStart(e, item.text)}
								onDragEnd={handleDragEnd}
								className={cn(
									"border rounded bg-custom-primary p-2 cursor-move",
									draggedItem === item.text ? "opacity-50" : ""
								)}
							>
								{item.text}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default function CategorizationQuestion(
	{ question }: { question: CategorizationQuestion },
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
		<CategorizationQuestionMobile question={question} />
	) : (
		<CategorizationQuestionDesktop question={question} />
	);
}
