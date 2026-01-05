"use client";

import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/ui/dialog";
import { Button } from "@/lib/components/ui/button";
import { Download } from "lucide-react";

interface QrCodeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quizId: string;
	quizName: string;
}

export function QrCodeDialog({ open, onOpenChange, quizId, quizName }: QrCodeDialogProps) {
	const [quizUrl, setQuizUrl] = useState("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			setQuizUrl(`${window.location.origin}/?quiz=${quizId}`);
		}
	}, [quizId]);

	const handleDownload = () => {
		const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
		if (!canvas) return;

		const url = canvas.toDataURL("image/png");
		const link = document.createElement("a");
		link.download = `${quizName}-qr-code.png`;
		link.href = url;
		link.click();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>QR-Code für {quizName}</DialogTitle>
					<DialogDescription>
						Scannen Sie den QR-Code, um das Quiz zu öffnen.
					</DialogDescription>
				</DialogHeader>

				<div className="flex justify-center py-4">
					{quizUrl && (
						<QRCodeCanvas
							id="qr-canvas"
							value={quizUrl}
							size={256}
							level="M"
							marginSize={2}
						/>
					)}
				</div>

				<DialogFooter>
					<Button onClick={handleDownload} className="w-full sm:w-auto">
						<Download className="mr-2 size-4" />
						Als PNG herunterladen
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default QrCodeDialog;
