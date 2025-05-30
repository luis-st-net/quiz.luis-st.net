"use client";

import React, { useState } from "react";
import * as Ui from "@/lib/components/ui/";
import Link from "next/link";
import type { Quiz, QuizGroup } from "@/lib/types";
import ContentPane from "@/lib/components/content-pane";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utility";

export default function () {
	const { quizzes } = useQuizContext();
	const rootNode = buildGroupHierarchy(quizzes);
	
	return (
		<div className="w-full flex flex-col items-center mt-16 mb-8">
			<h2 className="text-4xl font-bold mb-16">
				Wählen Sie ein Quiz aus
			</h2>
			<div className="w-4/5 flex flex-col gap-2 lg:w-1/2 2xl:w-1/4">
				<QuizGroup node={rootNode} level={0}/>
			</div>
		</div>
	);
}

function QuizGroup(
	{ node, level }: { node: QuizGroup; level: number },
) {
	const sortedSubgroups = Array.from(node.subgroups.entries()).sort(([a], [b]) => a.localeCompare(b));
	return (
		<div
			style={{ "--level": `${level}` } as React.CSSProperties}
			className={cn("w-full flex flex-col pl-[calc(var(--level)*1.5rem)]", level === 0 ? "gap-4" : "gap-3 my-3")}
		>
			{sortedSubgroups.map(([name, subgroup]) => (
				<CollapsibleQuizGroup key={name} group={subgroup} level={level}/>
			))}
			
			{node.quizzes.map((quiz) => (
				<QuizItem key={quiz.id} {...quiz}/>
			))}
		</div>
	);
}

function CollapsibleQuizGroup(
	{ group, level }: { group: QuizGroup; level: number },
) {
	const [isOpen, setIsOpen] = useState(false);
	
	return (
		<Ui.Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Ui.CollapsibleTrigger className="w-full">
				<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
					<div className="p-4 flex items-center gap-2 text-lg font-semibold">
						<ChevronRight className={cn("size-4 transition-transform", isOpen ? "rotate-90" : "")}/>
						{group.name}
					</div>
				</ContentPane>
			</Ui.CollapsibleTrigger>
			<Ui.CollapsibleContent>
				<QuizGroup node={group} level={level + 1}/>
			</Ui.CollapsibleContent>
		</Ui.Collapsible>
	);
}

function QuizItem(
	{ id, name }: Quiz,
) {
	return (
		<Link href={"/user?redirect=/" + id.toLowerCase()} className="w-full">
			<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
				<div className="p-4 text-xl">
					<strong>
						{name}
					</strong>
				</div>
			</ContentPane>
		</Link>
	);
}

function buildGroupHierarchy(quizzes: Quiz[]): QuizGroup {
	const root: QuizGroup = {
		name: "",
		quizzes: [],
		subgroups: new Map(),
	};
	
	const sortedQuizzes = [...quizzes].sort((a, b) => a.config.order - b.config.order);
	
	for (const quiz of sortedQuizzes) {
		const groupPath = quiz.config.group || "";
		const parts = groupPath ? groupPath.split("/").filter(Boolean) : [];
		
		let currentNode = root;
		
		for (const part of parts) {
			if (!currentNode.subgroups.has(part)) {
				currentNode.subgroups.set(part, {
					name: part,
					quizzes: [],
					subgroups: new Map(),
				});
			}
			currentNode = currentNode.subgroups.get(part)!;
		}
		
		currentNode.quizzes.push(quiz);
	}
	
	return root;
}
