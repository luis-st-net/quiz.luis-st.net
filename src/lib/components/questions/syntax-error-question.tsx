"use client";

import React, { useEffect, useState, useCallback } from "react";
import * as Icons from "lucide-react";
import { type SyntaxErrorQuestion, type SyntaxErrorQuestionInput } from "@/lib/types";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { cn } from "@/lib/utility";
import { useTheme } from "next-themes";

interface TokenInfo {
	line: number;
	token: string;
	type: string;
	startIndex: number;
}

declare global {
	interface Window {
		prismLanguagesLoaded?: boolean;
	}
}

export default function SyntaxErrorQuestion(
	{ question }: { question: SyntaxErrorQuestion },
) {
	const { saveAnswer, getAnswer, removeAnswer } = useQuestionContext();
	const { resolvedTheme } = useTheme();

	const [selectedTokens, setSelectedTokens] = useState<Array<{ line: number; token: string }>>(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "syntax-error") {
			return (savedAnswer as SyntaxErrorQuestionInput).selectedTokens;
		}
		return [];
	});

	const [tokenizedLines, setTokenizedLines] = useState<TokenInfo[][]>([]);
	const [prismReady, setPrismReady] = useState(false);

	const selectCount = question.selectCount || question.errorTokens.length;

	useEffect(() => {
		const savedAnswer = getAnswer(question.id);
		if (savedAnswer && savedAnswer.type === "syntax-error") {
			setSelectedTokens((savedAnswer as SyntaxErrorQuestionInput).selectedTokens);
		} else {
			setSelectedTokens([]);
		}
	}, [question.id]);

	// Initialize Prism and tokenize code
	useEffect(() => {
		if (typeof window === "undefined") return;

		const initializePrism = async () => {
			try {
				const { default: Prism } = await import("prismjs");

				if (!window.prismLanguagesLoaded) {
					const languageImports = [
						() => import("prismjs/components/prism-javascript"),
						() => import("prismjs/components/prism-typescript"),
						() => import("prismjs/components/prism-css"),
						() => import("prismjs/components/prism-python"),
						() => import("prismjs/components/prism-java"),
						() => import("prismjs/components/prism-json"),
						() => import("prismjs/components/prism-sql"),
						() => import("prismjs/components/prism-csharp"),
						() => import("prismjs/components/prism-rust"),
						() => import("prismjs/components/prism-markup"),
					];

					await Promise.all(languageImports.map(importFn => importFn()));
					window.prismLanguagesLoaded = true;
				}

				// Tokenize the code
				const grammar = Prism.languages[question.language] || Prism.languages.javascript;
				const lines = question.code.split("\n");
				const tokenized: TokenInfo[][] = [];

				lines.forEach((line, lineIndex) => {
					const tokens = Prism.tokenize(line, grammar);
					const lineTokens: TokenInfo[] = [];
					let currentIndex = 0;

					// Split a string into individual tokens, keeping whitespace as non-selectable
					const splitIntoTokens = (content: string, type: string): void => {
						// Match each non-whitespace sequence or whitespace sequence
						const parts = content.match(/(\s+|\S+)/g) || [];
						for (const part of parts) {
							if (part.trim()) {
								// Further split punctuation from words (e.g., "a," -> "a", ",")
								const subParts = part.match(/([^\w]|[\w]+)/g) || [part];
								for (const subPart of subParts) {
									lineTokens.push({
										line: lineIndex + 1,
										token: subPart,
										type: type,
										startIndex: currentIndex,
									});
									currentIndex += subPart.length;
								}
							} else {
								// Whitespace token - mark as whitespace type
								lineTokens.push({
									line: lineIndex + 1,
									token: part,
									type: "whitespace",
									startIndex: currentIndex,
								});
								currentIndex += part.length;
							}
						}
					};

					const processToken = (token: string | Prism.Token): void => {
						if (typeof token === "string") {
							splitIntoTokens(token, "plain");
						} else {
							const content = typeof token.content === "string"
								? token.content
								: Array.isArray(token.content)
									? token.content.map(t => typeof t === "string" ? t : t.content).join("")
									: String(token.content);

							splitIntoTokens(content, String(token.type));
						}
					};

					tokens.forEach(token => processToken(token));
					tokenized.push(lineTokens);
				});

				setTokenizedLines(tokenized);
				setPrismReady(true);
			} catch (error) {
				console.error("Error initializing Prism:", error);
			}
		};

		initializePrism();
	}, [question.code, question.language, resolvedTheme]);

	const updateAnswer = useCallback((newSelected: Array<{ line: number; token: string }>) => {
		setSelectedTokens(newSelected);

		if (newSelected.length === selectCount) {
			const answerInput: SyntaxErrorQuestionInput = {
				question: question.question,
				type: "syntax-error",
				selectedTokens: newSelected,
				errorTokens: question.errorTokens,
			};
			saveAnswer(question.id, answerInput);
		} else {
			removeAnswer(question.id);
		}
	}, [question.id, question.question, question.errorTokens, selectCount, saveAnswer, removeAnswer]);

	const isTokenSelected = (line: number, token: string) => {
		return selectedTokens.some(t => t.line === line && t.token === token);
	};

	const toggleToken = (line: number, token: string) => {
		const isSelected = isTokenSelected(line, token);

		if (isSelected) {
			updateAnswer(selectedTokens.filter(t => !(t.line === line && t.token === token)));
		} else {
			if (selectedTokens.length < selectCount) {
				updateAnswer([...selectedTokens, { line, token }]);
			}
		}
	};

	const getTokenClassName = (type: string) => {
		const baseClasses: Record<string, string> = {
			keyword: "text-purple-500 dark:text-purple-400",
			string: "text-green-600 dark:text-green-400",
			number: "text-orange-500 dark:text-orange-400",
			operator: "text-cyan-600 dark:text-cyan-400",
			punctuation: "text-gray-500 dark:text-gray-400",
			function: "text-blue-500 dark:text-blue-400",
			"class-name": "text-yellow-600 dark:text-yellow-400",
			comment: "text-gray-400 dark:text-gray-500 italic",
			plain: "",
		};
		return baseClasses[type] || "";
	};

	if (!prismReady) {
		return (
			<div className="flex items-center justify-center p-8">
				<Icons.Loader2 className="size-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Klicken Sie auf die Token, die Syntaxfehler enthalten.
				</p>
				<span className="text-sm font-medium">
					{selectedTokens.length} / {selectCount} ausgewählt
				</span>
			</div>

			<div className="border rounded-lg overflow-hidden bg-custom-secondary dark:bg-custom-tertiary">
				<pre className="p-4 overflow-x-auto font-mono text-sm">
					{tokenizedLines.map((lineTokens, lineIndex) => (
						<div key={lineIndex} className="flex">
							<span className="w-8 text-right pr-4 text-muted-foreground select-none">
								{lineIndex + 1}
							</span>
							<span className="flex-1">
								{lineTokens.length === 0 ? (
									<span>&nbsp;</span>
								) : (
									lineTokens.map((tokenInfo, tokenIndex) => {
										// Whitespace tokens are rendered but not selectable
										if (tokenInfo.type === "whitespace") {
											return (
												<span key={`${tokenIndex}-${tokenInfo.startIndex}`} className="select-none">
													{tokenInfo.token}
												</span>
											);
										}

										const isSelected = isTokenSelected(tokenInfo.line, tokenInfo.token);
										const canSelect = selectedTokens.length < selectCount || isSelected;

										return (
											<span
												key={`${tokenIndex}-${tokenInfo.startIndex}`}
												onClick={() => canSelect && toggleToken(tokenInfo.line, tokenInfo.token)}
												className={cn(
													"cursor-pointer rounded transition-all select-none",
													getTokenClassName(tokenInfo.type),
													isSelected
														? "bg-red-500/30 ring-2 ring-red-500"
														: canSelect
															? "hover:bg-primary/20"
															: "opacity-50 cursor-not-allowed"
												)}
											>
												{tokenInfo.token}
											</span>
										);
									})
								)}
							</span>
						</div>
					))}
				</pre>
			</div>

			{/* Selected tokens display */}
			{selectedTokens.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium">Ausgewählte Fehler:</p>
					<div className="flex flex-wrap gap-2">
						{selectedTokens.map((token, index) => (
							<div
								key={index}
								className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-1"
							>
								<span className="text-xs text-muted-foreground">
									Zeile {token.line}:
								</span>
								<code className="text-sm font-mono">{token.token}</code>
								<button
									onClick={() => toggleToken(token.line, token.token)}
									className="text-muted-foreground hover:text-foreground"
								>
									<Icons.X className="size-3" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
