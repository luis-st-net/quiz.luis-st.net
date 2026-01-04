"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { useUserContext } from "@/lib/contexts/user-context";
import { QuizSidebar, QuizInfoCard, UserInfoDialog } from "@/lib/components/quiz";
import { Button } from "@/lib/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/lib/components/ui/sheet";
import { Menu } from "lucide-react";

export default function HomePage() {
	const router = useRouter();
	const { hierarchy, selectedQuizId, setSelectedQuizId, getQuizById } = useQuizContext();
	const { getName } = useUserContext();
	const [showUserDialog, setShowUserDialog] = useState(false);
	const [pendingQuizId, setPendingQuizId] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const selectedQuiz = selectedQuizId ? getQuizById(selectedQuizId) : null;

	const handleSelectQuiz = (quizId: string) => {
		setSelectedQuizId(quizId);
		setSidebarOpen(false);
	};

	const handleStartQuiz = (quizId: string) => {
		const hasUserInfo = !!getName();

		if (!hasUserInfo) {
			setPendingQuizId(quizId);
			setShowUserDialog(true);
		} else {
			router.push(`/${quizId}`);
		}
	};

	const handleUserDialogSubmit = () => {
		if (pendingQuizId) {
			router.push(`/${pendingQuizId}`);
			setPendingQuizId(null);
		}
	};

	return (
		<div className="flex h-full overflow-hidden">
			{/* Desktop Sidebar */}
			<aside className="hidden md:block w-72 lg:w-80 shrink-0">
				<QuizSidebar
					hierarchy={hierarchy}
					selectedQuizId={selectedQuizId}
					onSelectQuiz={handleSelectQuiz}
					className="h-full"
				/>
			</aside>

			{/* Main Content Container - True viewport centering */}
			<div className="flex flex-col flex-1 min-w-0">
				{/* Mobile Header with Sheet */}
				<div className="md:hidden flex items-center gap-2 p-4 border-b bg-card">
					<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon">
								<Menu className="size-5" />
								<span className="sr-only">Quiz-Menü öffnen</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="p-0 w-80">
							<QuizSidebar
								hierarchy={hierarchy}
								selectedQuizId={selectedQuizId}
								onSelectQuiz={handleSelectQuiz}
								className="h-full"
							/>
						</SheetContent>
					</Sheet>
					<h1 className="text-lg font-semibold truncate">
						{selectedQuiz ? selectedQuiz.name : "Quiz auswählen"}
					</h1>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 overflow-auto flex justify-center">
					<div className="w-full max-w-4xl">
						<QuizInfoCard
							quiz={selectedQuiz || null}
							onStartQuiz={handleStartQuiz}
							className="h-full"
						/>
					</div>
				</div>
			</div>

			{/* Invisible spacer for symmetric centering - matches sidebar width */}
			<div className="hidden md:block w-72 lg:w-80 shrink-0" aria-hidden="true" />

			{/* User Info Dialog */}
			<UserInfoDialog
				open={showUserDialog}
				onOpenChange={setShowUserDialog}
				onSubmit={handleUserDialogSubmit}
			/>
		</div>
	);
}
