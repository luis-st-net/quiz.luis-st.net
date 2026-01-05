"use client";

import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/ui/dialog";
import { Button } from "@/lib/components/ui/button";
import { Download, Copy, Check, QrCode } from "lucide-react";

interface ShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quizId: string;
	quizName: string;
}

export function ShareDialog({ open, onOpenChange, quizId, quizName }: ShareDialogProps) {
	const [quizUrl, setQuizUrl] = useState("");
	const [showQrCode, setShowQrCode] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setQuizUrl(`${window.location.origin}/?quiz=${quizId}`);
		}
	}, [quizId]);

	// Reset QR code visibility when dialog closes
	useEffect(() => {
		if (!open) {
			setShowQrCode(false);
			setCopied(false);
		}
	}, [open]);

	const handleCopyLink = async () => {
		await navigator.clipboard.writeText(quizUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

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
					<DialogTitle>Quiz teilen</DialogTitle>
					<DialogDescription>
						Teilen Sie dieses Quiz mit anderen.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<Button
						onClick={handleCopyLink}
						variant="outline"
						className="w-full justify-start"
					>
						{copied ? (
							<Check className="mr-2 size-4 text-green-500" />
						) : (
							<Copy className="mr-2 size-4" />
						)}
						{copied ? "Link kopiert!" : "Link kopieren"}
					</Button>

					<Button
						onClick={() => setShowQrCode(true)}
						variant="outline"
						className="w-full justify-start"
						disabled={showQrCode}
					>
						<QrCode className="mr-2 size-4" />
						QR-Code generieren
					</Button>
				</div>

				{showQrCode && quizUrl && (
					<div className="pt-4 border-t">
						<div className="flex justify-center relative">
							<QRCodeCanvas
								id="qr-canvas"
								value={quizUrl}
								size={256}
								level="M"
								marginSize={2}
							/>
							<Button
								onClick={handleDownload}
								variant="secondary"
								size="icon"
								className="absolute -bottom-2 -right-2 size-8"
								title="Als PNG herunterladen"
							>
								<Download className="size-4" />
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default ShareDialog;
