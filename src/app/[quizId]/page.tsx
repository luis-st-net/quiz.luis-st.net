"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import {
	QuestionNavigator,
	QuestionCard,
	CancelQuizDialog,
	QuizHeader,
	KeyboardShortcutsDialog,
} from "@/lib/components/quiz";
import { Button } from "@/lib/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/lib/components/ui/sheet";
import { ResizeHandle } from "@/lib/components/ui/resize-handle";
import { LayoutGrid, Keyboard } from "lucide-react";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useResizableSidebar } from "@/lib/hooks/use-resizable-sidebar";

export default function QuizPage() {
	const router = useRouter();
	const {
		quizId,
		previousQuestion,
		nextQuestion,
		toggleFlagQuestion,
		goToQuestion,
		getQuestionByIndex,
		currentQuestionIndex,
		getMaxNumberOfQuestions,
	} = useQuestionContext();
	const { getQuizById } = useQuizContext();
	const quiz = getQuizById(quizId);

	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [navigatorOpen, setNavigatorOpen] = useState(false);

	// Resizable sidebar
	const { width: sidebarWidth, isResizing, handleMouseDown } = useResizableSidebar({
		minWidth: 200,
		maxWidth: 400,
		defaultWidth: 240,
		storageKey: "quiz-sidebar-width",
	});

	const currentQuestion = getQuestionByIndex(currentQuestionIndex);
	const totalQuestions = getMaxNumberOfQuestions();

	// Keyboard shortcuts
	const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts({
		onPrevious: previousQuestion,
		onNext: nextQuestion,
		onFlag: () => currentQuestion && toggleFlagQuestion(currentQuestion.id),
		onCancel: () => setShowCancelDialog(true),
		onGoToQuestion: (index) => {
			if (index < totalQuestions) {
				goToQuestion(index);
			}
		},
		enabled: !showCancelDialog && !navigatorOpen,
	});

	const handleReviewClick = () => {
		router.push(`/${quizId}/review`);
	};

	if (!quiz) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Quiz nicht gefunden</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Quiz Header */}
			<QuizHeader
				quizName={quiz.name}
				onCancelClick={() => setShowCancelDialog(true)}
			/>

			<div className="flex flex-1 min-h-0">
				{/* Desktop Navigator Sidebar - Resizable */}
				<aside
					className="hidden lg:flex relative shrink-0"
					style={{ width: sidebarWidth }}
				>
					<QuestionNavigator
						onReviewClick={handleReviewClick}
						className="h-full w-full"
					/>
					<ResizeHandle
						onMouseDown={handleMouseDown}
						isResizing={isResizing}
					/>
				</aside>

				{/* Main Question Area - True viewport centering */}
				<main className={`flex-1 min-w-0 overflow-auto flex justify-center ${isResizing ? "select-none" : ""}`}>
					<div className="w-full max-w-4xl px-4">
						<QuestionCard className="h-full" />
					</div>
				</main>

				{/* Invisible spacer for symmetric centering - matches sidebar width */}
				<div
					className="hidden lg:block shrink-0"
					style={{ width: sidebarWidth }}
					aria-hidden="true"
				/>
			</div>

			{/* Mobile Navigator FAB */}
			<div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2">
				<Button
					size="icon"
					variant="outline"
					className="rounded-full shadow-lg"
					onClick={() => setShowShortcuts(true)}
				>
					<Keyboard className="size-5" />
					<span className="sr-only">Tastaturkürzel</span>
				</Button>
				<Sheet open={navigatorOpen} onOpenChange={setNavigatorOpen}>
					<SheetTrigger asChild>
						<Button size="lg" className="rounded-full shadow-lg">
							<LayoutGrid className="size-5 mr-2" />
							Übersicht
						</Button>
					</SheetTrigger>
					<SheetContent side="bottom" className="h-[70vh] p-0">
						<SheetTitle className="sr-only">Fragenübersicht</SheetTitle>
						<QuestionNavigator
							onReviewClick={() => {
								setNavigatorOpen(false);
								handleReviewClick();
							}}
							className="h-full"
						/>
					</SheetContent>
				</Sheet>
			</div>

			{/* Desktop Keyboard Shortcut Hint */}
			<div className="hidden lg:block fixed bottom-4 right-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowShortcuts(true)}
					className="text-xs"
				>
					<Keyboard className="size-4 mr-1" />
					Tastaturkürzel (?)
				</Button>
			</div>

			{/* Cancel Dialog */}
			<CancelQuizDialog
				open={showCancelDialog}
				onOpenChange={setShowCancelDialog}
				quizId={quizId}
				storageKey={`${quizId}/answers`}
			/>

			{/* Keyboard Shortcuts Dialog */}
			<KeyboardShortcutsDialog
				open={showShortcuts}
				onOpenChange={setShowShortcuts}
			/>
		</div>
	);
}
