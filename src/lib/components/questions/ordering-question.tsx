"use client";

import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { GripVertical } from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type OrderingQuestion } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";

export default function OrderingQuestion(
	{ question }: { question: OrderingQuestion },
) {
	const { saveAnswer, getAnswer } = useQuestionContext();
	const [orderedItems, setOrderedItems] = useState<Array<{ id: string; text: string; correctPosition?: number }>>(() => {
		const savedAnswer = getAnswer(question.id);
		return savedAnswer ? JSON.parse(savedAnswer) : [...question.items];
	});
	
	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer) {
			setOrderedItems(JSON.parse(savedAnswer));
		} else {
			const shuffledItems = [...question.items]
				.map(value => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value);
			setOrderedItems(shuffledItems);
		}
	}, [question.id, question.items, getAnswer]);
	
	const moveItem = (fromIndex: number, toIndex: number) => {
		const newItems = [...orderedItems];
		const [removed] = newItems.splice(fromIndex, 1);
		newItems.splice(toIndex, 0, removed);
		setOrderedItems(newItems);
		saveAnswer(question.id, JSON.stringify(newItems));
	};
	
	const handleMoveUp = (index: number) => {
		if (index > 0) {
			moveItem(index, index - 1);
		}
	};
	
	const handleMoveDown = (index: number) => {
		if (index < orderedItems.length - 1) {
			moveItem(index, index + 1);
		}
	};
	
	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground mb-4">
				Arrange the items in the correct order:
			</p>
			{orderedItems.map((item, index) => (
				<div key={item.id} className="flex items-center border rounded p-3 mb-2 bg-card">
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
						<GripVertical className="h-4 w-4 text-muted-foreground"/>
					</div>
				</div>
			))}
		</div>
	);
}
