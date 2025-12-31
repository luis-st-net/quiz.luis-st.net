"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as Icons from "lucide-react";
import * as Ui from "@/lib/components/ui/";
import { type FileUploadQuestion, type FileUploadQuestionInput, type UploadedFile } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn } from "@/lib/utility";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: string) {
	if (type.startsWith("image/")) return Icons.Image;
	if (type === "application/pdf") return Icons.FileText;
	return Icons.File;
}

export default function FileUploadQuestion(
	{ question }: { question: FileUploadQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();

	const [files, setFiles] = useState<UploadedFile[]>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "file-upload") {
			return (savedAnswer as FileUploadQuestionInput).files;
		}
		return [];
	});

	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "file-upload") {
			setFiles((savedAnswer as FileUploadQuestionInput).files);
		} else {
			setFiles([]);
		}
	}, [question.id]);

	const updateAnswer = useCallback((newFiles: UploadedFile[]) => {
		setFiles(newFiles);

		if (newFiles.length > 0 || !question.upload.required) {
			const answerInput: FileUploadQuestionInput = {
				question: question.question,
				type: "file-upload",
				files: newFiles,
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	}, [question.id, question.question, question.upload.required, saveAnswer, removeAnswer]);

	const validateFile = (file: File): string | null => {
		// Check file type
		if (!question.upload.accept.some(type => {
			if (type.startsWith(".")) {
				return file.name.toLowerCase().endsWith(type.toLowerCase());
			}
			if (type.endsWith("/*")) {
				return file.type.startsWith(type.replace("/*", "/"));
			}
			return file.type === type;
		})) {
			return `Dateityp "${file.type || file.name.split(".").pop()}" wird nicht unterstützt.`;
		}

		// Check file size
		const maxSizeBytes = question.upload.maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			return `Datei ist zu groß. Maximum: ${question.upload.maxSizeMB} MB`;
		}

		return null;
	};

	const processFile = (file: File): Promise<UploadedFile> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const base64 = (reader.result as string).split(",")[1];
				resolve({
					name: file.name,
					type: file.type,
					size: file.size,
					data: base64,
				});
			};
			reader.onerror = () => reject(new Error("Fehler beim Lesen der Datei"));
			reader.readAsDataURL(file);
		});
	};

	const handleFiles = async (fileList: FileList | File[]) => {
		setError(null);
		const newFiles: UploadedFile[] = [...files];
		const filesToProcess = Array.from(fileList);

		// Check max files limit
		if (newFiles.length + filesToProcess.length > question.upload.maxFiles) {
			setError(`Maximal ${question.upload.maxFiles} Datei(en) erlaubt.`);
			return;
		}

		for (const file of filesToProcess) {
			const validationError = validateFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}

			try {
				const uploadedFile = await processFile(file);
				newFiles.push(uploadedFile);
			} catch {
				setError("Fehler beim Verarbeiten der Datei");
				return;
			}
		}

		updateAnswer(newFiles);
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFiles(e.dataTransfer.files);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFiles(e.target.files);
		}
	};

	const removeFile = (index: number) => {
		const newFiles = files.filter((_, i) => i !== index);
		updateAnswer(newFiles);
	};

	const acceptString = question.upload.accept.join(",");

	return (
		<div className="space-y-4">
			{/* Drop zone */}
			<div
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				className={cn(
					"relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
					dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
					files.length >= question.upload.maxFiles ? "opacity-50 pointer-events-none" : "cursor-pointer hover:border-primary"
				)}
			>
				<input
					type="file"
					accept={acceptString}
					multiple={question.upload.maxFiles > 1}
					onChange={handleInputChange}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					disabled={files.length >= question.upload.maxFiles}
				/>
				<Icons.Upload className="mx-auto size-12 text-muted-foreground mb-4" />
				<p className="text-sm font-medium">
					Dateien hier ablegen oder klicken zum Auswählen
				</p>
				<p className="text-xs text-muted-foreground mt-2">
					{question.upload.accept.map(type => {
						if (type.startsWith(".")) return type;
						if (type.startsWith("image/")) return "Bilder";
						if (type === "application/pdf") return "PDF";
						return type;
					}).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
					{" "}| Max. {question.upload.maxSizeMB} MB | {question.upload.maxFiles} Datei(en)
				</p>
			</div>

			{/* Error message */}
			{error && (
				<div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
					<Icons.AlertCircle className="size-4" />
					{error}
				</div>
			)}

			{/* File list */}
			{files.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium">Hochgeladene Dateien:</p>
					{files.map((file, index) => {
						const FileIcon = getFileIcon(file.type);
						return (
							<div
								key={index}
								className="flex items-center justify-between border rounded-lg p-3 bg-custom-primary"
							>
								<div className="flex items-center gap-3">
									{file.type.startsWith("image/") ? (
										<img
											src={`data:${file.type};base64,${file.data}`}
											alt={file.name}
											className="size-10 object-cover rounded"
										/>
									) : (
										<FileIcon className="size-10 text-muted-foreground" />
									)}
									<div>
										<p className="text-sm font-medium truncate max-w-[200px]">
											{file.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatFileSize(file.size)}
										</p>
									</div>
								</div>
								<Ui.Button
									variant="ghost"
									size="sm"
									onClick={() => removeFile(index)}
									className="size-8 p-0"
								>
									<Icons.X className="size-4" />
								</Ui.Button>
							</div>
						);
					})}
				</div>
			)}

			{/* Required indicator */}
			{question.upload.required && files.length === 0 && (
				<p className="text-sm text-muted-foreground">
					* Mindestens eine Datei erforderlich
				</p>
			)}
		</div>
	);
}
