"use client";

import React from "react";
import { Quiz } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Separator } from "@/lib/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/ui/tooltip";
import { FileQuestion, Clock, BarChart3, ArrowRight, BookOpen, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utility";

interface QuizInfoCardProps {
	quiz: Quiz | null;
	onStartQuiz: (quizId: string) => void;
	className?: string;
}

export function QuizInfoCard({ quiz, onStartQuiz, className }: QuizInfoCardProps) {
	if (!quiz) {
		return <EmptyState className={className} />;
	}

	const questionCount = quiz.questions.length;
	const estimatedMinutes = Math.ceil(questionCount * 0.75); // ~45 seconds per question

	return (
		<div className={cn("flex items-center justify-center p-4 sm:p-8", className)}>
			<Card className="w-full max-w-2xl">
				<CardHeader className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2">
							{quiz.group && (
								<GroupBreadcrumb group={quiz.group} />
							)}
							<CardTitle className="text-2xl sm:text-3xl">{quiz.name}</CardTitle>
						</div>
					</div>
					{quiz.description && (
						<CardDescription className="text-base">
							{quiz.description}
						</CardDescription>
					)}
				</CardHeader>

				<Separator />

				<CardContent className="pt-6">
					<div className="grid gap-4 sm:grid-cols-3">
						<QuizStat
							icon={FileQuestion}
							label="Fragen"
							value={`${questionCount} Fragen`}
						/>
						<QuizStat
							icon={Clock}
							label="Geschätzte Zeit"
							value={`~${estimatedMinutes} Min.`}
						/>
						<QuizStat
							icon={BarChart3}
							label="Schwierigkeit"
							value={getDifficultyLabel(questionCount)}
						/>
					</div>

					<div className="mt-6 p-4 bg-muted/50 rounded-lg">
						<h4 className="font-medium mb-2 flex items-center gap-2">
							<BookOpen className="size-4" />
							Fragentypen
						</h4>
						<div className="flex flex-wrap gap-2">
							{getQuestionTypes(quiz).map((type) => (
								<Badge key={type} variant="outline" className="text-xs">
									{type}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>

				<Separator />

				<CardFooter className="pt-6">
					<Button
						onClick={() => onStartQuiz(quiz.id)}
						className="w-full sm:w-auto sm:ml-auto"
						size="lg"
					>
						Quiz starten
						<ArrowRight className="ml-2 size-4" />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

interface QuizStatProps {
	icon: React.ElementType;
	label: string;
	value: string;
}

function QuizStat({ icon: Icon, label, value }: QuizStatProps) {
	return (
		<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
			<div className="p-2 rounded-md bg-primary/10">
				<Icon className="size-5 text-primary" />
			</div>
			<div>
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="font-medium">{value}</p>
			</div>
		</div>
	);
}

function EmptyState({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center justify-center p-8", className)}>
			<div className="text-center space-y-4 max-w-md">
				<div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
					<BookOpen className="size-8 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold">Quiz auswählen</h3>
				<p className="text-muted-foreground">
					Wählen Sie ein Quiz aus der Seitenleiste aus, um Details anzuzeigen und zu starten.
				</p>
			</div>
		</div>
	);
}

const MAX_BREADCRUMB_LENGTH = 40;

function GroupBreadcrumb({ group }: { group: string }) {
	const segments = group.split("/").filter(Boolean);
	const needsCollapse = group.length > MAX_BREADCRUMB_LENGTH && segments.length > 2;

	if (needsCollapse) {
		const hiddenSegments = segments.slice(1, -1);
		return (
			<TooltipProvider>
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<span>{segments[0]}</span>
					<ChevronRight className="size-3 shrink-0" />
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="hover:bg-muted rounded px-1 py-0.5 transition-colors">
								<MoreHorizontal className="size-3" />
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<div className="flex items-center gap-1">
								{hiddenSegments.map((segment, index) => (
									<React.Fragment key={index}>
										{index > 0 && <ChevronRight className="size-3 shrink-0" />}
										<span>{segment}</span>
									</React.Fragment>
								))}
							</div>
						</TooltipContent>
					</Tooltip>
					<ChevronRight className="size-3 shrink-0" />
					<span className="text-foreground font-medium">{segments[segments.length - 1]}</span>
				</div>
			</TooltipProvider>
		);
	}

	return (
		<div className="flex items-center gap-1 text-sm text-muted-foreground">
			{segments.map((segment, index) => (
				<React.Fragment key={index}>
					{index > 0 && <ChevronRight className="size-3 shrink-0" />}
					<span className={cn(
						index === segments.length - 1 && "text-foreground font-medium"
					)}>
						{segment}
					</span>
				</React.Fragment>
			))}
		</div>
	);
}

function getDifficultyLabel(questionCount: number): string {
	if (questionCount <= 5) return "Einfach";
	if (questionCount <= 15) return "Mittel";
	return "Fortgeschritten";
}

function getQuestionTypes(quiz: Quiz): string[] {
	const types = new Set<string>();

	for (const question of quiz.questions) {
		// Check new types first (most specific)
		if ("blanks" in question) {
			types.add("Lückentext");
		} else if ("upload" in question) {
			types.add("Datei-Upload");
		} else if ("code" in question && "errorTokens" in question) {
			types.add("Syntaxfehler");
		} else if ("categories" in question && "items" in question) {
			types.add("Kategorisierung");
		} else if ("correctAnswer" in question && typeof question.correctAnswer === "boolean") {
			types.add("Wahr/Falsch");
		} else if ("correctAnswer" in question && typeof question.correctAnswer === "number") {
			types.add("Numerisch");
		} else if ("minLength" in question || "maxLength" in question) {
			types.add("Freitext");
		} else if ("correctAnswerIndex" in question) {
			types.add("Einzelauswahl");
		} else if ("answers" in question && Array.isArray(question.answers)) {
			const answers = question.answers as Array<{ isCorrect?: boolean }>;
			if (answers.length > 0 && "isCorrect" in answers[0]) {
				types.add("Mehrfachauswahl");
			}
		} else if ("items" in question) {
			const items = question.items as Array<{ correctPosition?: number; matchesTo?: string }>;
			if (items.length > 0) {
				if ("correctPosition" in items[0]) {
					types.add("Sortierung");
				}
			}
		}
		if ("matches" in question) {
			types.add("Zuordnung");
		}
	}

	return Array.from(types);
}

export default QuizInfoCard;
