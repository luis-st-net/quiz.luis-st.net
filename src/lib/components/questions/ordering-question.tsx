"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type OrderingQuestion, type OrderingQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

interface OrderedItem {
	id: string;
	text: string;
	correctPosition?: number;
}

export default function OrderingQuestion(
	{ question }: { question: OrderingQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [orderedItems, setOrderedItems] = useState<OrderedItem[]>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "ordering") {
			const input = savedAnswer as OrderingQuestionInput;
			return sortQuestionItems(question, input);
		}
		
		return question.items.map(item => ({
			id: item.id,
			text: item.answer,
			correctPosition: item.correctPosition,
		}));
	});
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "ordering") {
			const input = savedAnswer as OrderingQuestionInput;
			const sortedItems = sortQuestionItems(question, input);
			setOrderedItems(sortedItems);
		} else {
			const mappedItems = question.items.map(item => ({
				id: item.id,
				text: item.answer,
				correctPosition: item.correctPosition,
			}));
			
			const shuffledItems = [...mappedItems]
				.map(value => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value);
			
			setOrderedItems(shuffledItems);
		}
	}, [question.id, question.items, getAnswer]);
	
	const handleMoveUp = (index: number) => {
		if (index > 0) {
			moveItem(question, orderedItems, setOrderedItems, index, index - 1, saveAnswer);
		}
	};
	
	const handleMoveDown = (index: number) => {
		if (index < orderedItems.length - 1) {
			moveItem(question, orderedItems, setOrderedItems, index, index + 1, saveAnswer);
		}
	};
	
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	
	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.setData("text/plain", index.toString());
		e.dataTransfer.effectAllowed = "move";
	};
	
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};
	
	const handleDrop = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== index) {
			moveItem(question, orderedItems, setOrderedItems, draggedIndex, index, saveAnswer);
		}
		setDraggedIndex(null);
	};
	
	const handleDragEnd = () => {
		setDraggedIndex(null);
	};
	
	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground mb-3">
				Arrange the items in the correct order:
			</p>
			{orderedItems.map((item, index) => (
				<div
					key={item.id}
					className={`flex items-center border rounded p-3 mb-2 bg-card ${draggedIndex === index ? "opacity-50" : ""}`}
					draggable={true}
					onDragStart={(e) => handleDragStart(e, index)}
					onDragOver={(e) => handleDragOver(e, index)}
					onDrop={(e) => handleDrop(e, index)}
					onDragEnd={handleDragEnd}
				>
					<div className="flex-grow">
						{item.text}
					</div>
					<div className="flex items-center gap-1">
						<Ui.Button variant="ghost" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0}>
							<Icons.ChevronUp className="h-4 w-4"/>
						</Ui.Button>
						<Ui.Button variant="ghost" size="icon" onClick={() => handleMoveDown(index)} disabled={index === orderedItems.length - 1}>
							<Icons.ChevronDown className="h-4 w-4"/>
						</Ui.Button>
						<Icons.GripVertical className="h-4 w-4 text-muted-foreground cursor-move"/>
					</div>
				</div>
			))}
		</div>
	);
}

function sortQuestionItems(question: OrderingQuestion, input: OrderingQuestionInput) {
	return question.items.map((item) => ({
		id: item.id,
		text: item.answer,
		correctPosition: item.correctPosition,
	})).sort((a, b) => {
		const aIdx = input.inputAnswer.findIndex(i => i === question.items.findIndex(qi => qi.id === a.id));
		const bIdx = input.inputAnswer.findIndex(i => i === question.items.findIndex(qi => qi.id === b.id));
		return aIdx - bIdx;
	});
}

function moveItem(
	question: OrderingQuestion,
	orderedItems: OrderedItem[],
	setOrderedItems: React.Dispatch<React.SetStateAction<OrderedItem[]>>,
	fromIndex: number,
	toIndex: number,
	saveAnswer: (id: string, input: OrderingQuestionInput) => void,
) {
	const newItems = [...orderedItems];
	const [removed] = newItems.splice(fromIndex, 1);
	newItems.splice(toIndex, 0, removed);
	setOrderedItems(newItems);
	
	const answerInput: OrderingQuestionInput = {
		question: question.question,
		type: "ordering",
		inputAnswer: newItems.map(item =>
			question.items.findIndex(qi => qi.id === item.id),
		),
		items: question.items.map(item => item.answer),
		correctAnswerOrder: question.items.sort((a, b) => a.correctPosition - b.correctPosition).map(item => item.answer),
	};
	
	saveAnswer(question.id, answerInput);
}
