"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/lib/components/ui/button";
import { Save, Trash2, ArrowLeft } from "lucide-react";

interface CancelQuizDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quizId: string;
	storageKey: string;
}

export function CancelQuizDialog({
	open,
	onOpenChange,
	quizId,
	storageKey,
}: CancelQuizDialogProps) {
	const router = useRouter();

	const handleSaveAndExit = () => {
		// Answers are already saved in sessionStorage, just navigate away
		onOpenChange(false);
		router.push("/");
	};

	const handleDiscardAndExit = () => {
		// Clear all stored data for this quiz
		if (typeof window !== "undefined") {
			sessionStorage.removeItem(storageKey);
			sessionStorage.removeItem(`${storageKey}-flagged`);
		}
		onOpenChange(false);
		router.push("/");
	};

	const handleContinue = () => {
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Quiz abbrechen?</AlertDialogTitle>
					<AlertDialogDescription>
						Was möchten Sie mit Ihrem Fortschritt tun?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="flex flex-col gap-3 py-4">
					<Button
						variant="outline"
						className="justify-start h-auto py-3 px-4"
						onClick={handleSaveAndExit}
					>
						<Save className="size-5 mr-3 text-green-600" />
						<div className="text-left">
							<div className="font-medium">Speichern & Beenden</div>
							<div className="text-xs text-muted-foreground">
								Ihr Fortschritt wird gespeichert und kann später fortgesetzt werden.
							</div>
						</div>
					</Button>

					<Button
						variant="outline"
						className="justify-start h-auto py-3 px-4"
						onClick={handleDiscardAndExit}
					>
						<Trash2 className="size-5 mr-3 text-red-600" />
						<div className="text-left">
							<div className="font-medium">Verwerfen & Beenden</div>
							<div className="text-xs text-muted-foreground">
								Alle Antworten werden gelöscht.
							</div>
						</div>
					</Button>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel asChild>
						<Button variant="outline" onClick={handleContinue}>
							<ArrowLeft className="size-4 mr-2" />
							Quiz fortsetzen
						</Button>
					</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default CancelQuizDialog;
