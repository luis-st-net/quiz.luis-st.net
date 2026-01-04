"use client";

import React, { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utility";
import { Quiz, QuizGroup } from "@/lib/types";
import * as Ui from "@/lib/components/ui";
import { ScrollArea } from "@/lib/components/ui/scroll-area";

interface QuizSidebarProps {
	hierarchy: QuizGroup;
	selectedQuizId: string | null;
	onSelectQuiz: (quizId: string) => void;
	className?: string;
}

export function QuizSidebar({ hierarchy, selectedQuizId, onSelectQuiz, className }: QuizSidebarProps) {
	return (
		<div className={cn("flex flex-col h-full bg-card border-r", className)}>
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold flex items-center gap-2">
					<BookOpen className="size-5" />
					Quizzes
				</h2>
			</div>
			<ScrollArea className="flex-1">
				<div className="p-2">
					<QuizGroupRenderer
						node={hierarchy}
						level={0}
						selectedQuizId={selectedQuizId}
						onSelectQuiz={onSelectQuiz}
					/>
				</div>
			</ScrollArea>
		</div>
	);
}

interface QuizGroupRendererProps {
	node: QuizGroup;
	level: number;
	selectedQuizId: string | null;
	onSelectQuiz: (quizId: string) => void;
}

function QuizGroupRenderer({ node, level, selectedQuizId, onSelectQuiz }: QuizGroupRendererProps) {
	const sortedSubgroups = Array.from(node.subgroups.entries()).sort(([a], [b]) => a.localeCompare(b));

	return (
		<div className="flex flex-col gap-1">
			{sortedSubgroups.map(([name, subgroup]) => (
				<CollapsibleQuizGroup
					key={name}
					group={subgroup}
					level={level}
					selectedQuizId={selectedQuizId}
					onSelectQuiz={onSelectQuiz}
				/>
			))}

			{node.quizzes.map((quiz) => (
				<QuizListItem
					key={quiz.id}
					quiz={quiz}
					isSelected={selectedQuizId === quiz.id}
					onSelect={() => onSelectQuiz(quiz.id)}
					level={level}
				/>
			))}
		</div>
	);
}

interface CollapsibleQuizGroupProps {
	group: QuizGroup;
	level: number;
	selectedQuizId: string | null;
	onSelectQuiz: (quizId: string) => void;
}

function CollapsibleQuizGroup({ group, level, selectedQuizId, onSelectQuiz }: CollapsibleQuizGroupProps) {
	// Only top level (level 0) is open by default
	const [isOpen, setIsOpen] = useState(level === 0);

	return (
		<Ui.Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Ui.CollapsibleTrigger className="w-full">
				<div
					className={cn(
						"flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
						"hover:bg-accent transition-colors text-left w-full cursor-pointer"
					)}
					style={{ paddingLeft: `${level * 12 + 12}px` }}
				>
					<ChevronRight
						className={cn(
							"size-4 transition-transform duration-200",
							isOpen && "rotate-90"
						)}
					/>
					<span>{group.name}</span>
				</div>
			</Ui.CollapsibleTrigger>
			<Ui.CollapsibleContent>
				<QuizGroupRenderer
					node={group}
					level={level + 1}
					selectedQuizId={selectedQuizId}
					onSelectQuiz={onSelectQuiz}
				/>
			</Ui.CollapsibleContent>
		</Ui.Collapsible>
	);
}

interface QuizListItemProps {
	quiz: Quiz;
	isSelected: boolean;
	onSelect: () => void;
	level: number;
}

function QuizListItem({ quiz, isSelected, onSelect, level }: QuizListItemProps) {
	return (
		<button
			onClick={onSelect}
			className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-left cursor-pointer",
				"transition-colors duration-150",
				isSelected
					? "bg-primary text-primary-foreground font-medium"
					: "hover:bg-accent text-muted-foreground hover:text-foreground"
			)}
			style={{ paddingLeft: `${level * 12 + 24}px` }}
		>
			<span className="truncate">{quiz.name}</span>
		</button>
	);
}

export default QuizSidebar;
