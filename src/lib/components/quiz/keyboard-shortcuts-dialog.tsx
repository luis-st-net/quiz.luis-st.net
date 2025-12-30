"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/lib/components/ui/dialog";
import { keyboardShortcutsList } from "@/lib/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
	open,
	onOpenChange,
}: KeyboardShortcutsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Tastaturkürzel</DialogTitle>
					<DialogDescription>
						Verwenden Sie diese Tastaturkürzel für eine schnellere Navigation.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3 pt-4">
					{keyboardShortcutsList.map(({ key, description }) => (
						<div key={key} className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">{description}</span>
							<kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
								{key}
							</kbd>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default KeyboardShortcutsDialog;
