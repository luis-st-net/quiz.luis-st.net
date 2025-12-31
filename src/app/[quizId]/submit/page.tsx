"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useTimerContext } from "@/lib/contexts/timer-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/lib/components/ui/alert-dialog";
import { ArrowLeft, Send, FileText, Clock, Loader2 } from "lucide-react";

export default function SubmitPage() {
	const router = useRouter();
	const { getQuizById } = useQuizContext();
	const {
		quizId,
		questions,
		getNumberOfAnsweredQuestions,
		finishQuiz,
		setPreventNavigation,
	} = useQuestionContext();
	const { getElapsedTime } = useTimerContext();

	const quiz = getQuizById(quizId);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0);

	// Update elapsed time once (timer is already paused from review page)
	useEffect(() => {
		setElapsedTime(getElapsedTime());
	}, [getElapsedTime]);

	if (!quiz) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">Quiz nicht gefunden</p>
			</div>
		);
	}

	const totalQuestions = questions.length;
	const answeredCount = getNumberOfAnsweredQuestions();

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		if (mins >= 60) {
			const hours = Math.floor(mins / 60);
			const remainingMins = mins % 60;
			return `${hours}h ${remainingMins}m ${secs}s`;
		}
		return `${mins}m ${secs}s`;
	};

	const handleReviewClick = () => {
		// Timer stays paused - review page keeps it paused
		router.push(`/${quizId}/review`);
	};

	const handleSubmitClick = () => {
		setShowConfirmDialog(true);
	};

	const handleConfirmSubmit = async () => {
		setIsSubmitting(true);
		setPreventNavigation(true);
		setShowConfirmDialog(false);

		try {
			await finishQuiz();
		} catch (error) {
			console.error("Failed to submit quiz:", error);
			setIsSubmitting(false);
			setPreventNavigation(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-full p-4">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center pb-2">
					<CardTitle className="text-2xl">Quiz einreichen</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Quiz Name */}
					<div className="text-center">
						<p className="text-muted-foreground text-sm">Quiz</p>
						<p className="text-xl font-semibold">{quiz.name}</p>
					</div>

					{/* Statistics */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<div className="p-2 rounded-md bg-primary/10">
								<FileText className="size-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Beantwortet</p>
								<p className="font-semibold">
									{answeredCount}/{totalQuestions}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<div className="p-2 rounded-md bg-primary/10">
								<Clock className="size-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Zeit</p>
								<p className="font-semibold">{formatTime(elapsedTime)}</p>
							</div>
						</div>
					</div>

					{/* Info Text */}
					<div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
						<p>
							Mit dem Einreichen werden Ihre Antworten zur Auswertung gesendet.
							Wenn Sie eine E-Mail-Adresse angegeben haben, erhalten Sie eine
							Kopie Ihrer Ergebnisse.
						</p>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-3 pt-2">
					<Button
						onClick={handleSubmitClick}
						className="w-full"
						size="lg"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 mr-2 animate-spin" />
								Wird eingereicht...
							</>
						) : (
							<>
								<Send className="size-4 mr-2" />
								Quiz einreichen
							</>
						)}
					</Button>
					<Button
						variant="outline"
						onClick={handleReviewClick}
						className="w-full"
						disabled={isSubmitting}
					>
						<ArrowLeft className="size-4 mr-2" />
						Antworten überprüfen
					</Button>
				</CardFooter>
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Quiz einreichen?</AlertDialogTitle>
						<AlertDialogDescription>
							Sind Sie sicher, dass Sie das Quiz einreichen möchten? Diese
							Aktion kann nicht rückgängig gemacht werden.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Abbrechen</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmSubmit}>
							Einreichen
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
