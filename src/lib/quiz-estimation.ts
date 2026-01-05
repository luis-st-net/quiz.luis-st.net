import type { Question, DifficultyLevel } from "./types";
import {
	isTrueFalseQuestion,
	isNumericQuestion,
	isTextAnswerQuestion,
	isSingleChoiceQuestion,
	isMultipleChoiceQuestion,
	isOrderingQuestion,
	isMatchingQuestion,
	isFillBlankQuestion,
	isCategorizationQuestion,
	isFileUploadQuestion,
	isSyntaxErrorQuestion,
} from "./question-helper";

// ============================================
// TIME ESTIMATION
// ============================================

interface TimeEstimation {
	baseTime: number;
	additionalTime: number;
}

function estimateQuestionTime(question: Question): number {
	const estimation = getTimeEstimation(question);
	return estimation.baseTime + estimation.additionalTime;
}

function getTimeEstimation(question: Question): TimeEstimation {
	// True/False: 25 sec base
	if (isTrueFalseQuestion(question)) {
		return { baseTime: 25, additionalTime: 0 };
	}

	// Single Choice: 40 sec base, +5 sec per option beyond 4
	if (isSingleChoiceQuestion(question)) {
		const optionCount = question.answers.length;
		const additional = Math.max(0, optionCount - 4) * 5;
		return { baseTime: 40, additionalTime: additional };
	}

	// Multiple Choice: 60 sec base, +8 sec per option
	if (isMultipleChoiceQuestion(question)) {
		const optionCount = question.answers.length;
		const additional = optionCount * 8;
		return { baseTime: 60, additionalTime: additional };
	}

	// Numeric: 55 sec base
	if (isNumericQuestion(question)) {
		return { baseTime: 55, additionalTime: 0 };
	}

	// Text: 90 sec base, +30 sec per 200 chars over 300 (maxLength)
	if (isTextAnswerQuestion(question)) {
		const maxLength = question.maxLength ?? 0;
		const charsOver300 = Math.max(0, maxLength - 300);
		const additional = Math.floor(charsOver300 / 200) * 30;
		return { baseTime: 90, additionalTime: additional };
	}

	// Ordering: 60 sec base, +15 sec per item beyond 4
	if (isOrderingQuestion(question)) {
		const itemCount = question.items.length;
		const additional = Math.max(0, itemCount - 4) * 15;
		return { baseTime: 60, additionalTime: additional };
	}

	// Matching: 70 sec base, +15 sec per pair beyond 4
	if (isMatchingQuestion(question)) {
		const pairCount = question.matches.length;
		const additional = Math.max(0, pairCount - 4) * 15;
		return { baseTime: 70, additionalTime: additional };
	}

	// Fill-blank: 45 sec base, +15 sec per blank
	if (isFillBlankQuestion(question)) {
		const blankCount = question.blanks.length;
		const additional = blankCount * 15;
		return { baseTime: 45, additionalTime: additional };
	}

	// Categorization: 60 sec base, +10 sec per item, +20 sec per category beyond 2
	if (isCategorizationQuestion(question)) {
		const itemCount = question.items.length;
		const categoryCount = question.categories.length;
		const additional = itemCount * 10 + Math.max(0, categoryCount - 2) * 20;
		return { baseTime: 60, additionalTime: additional };
	}

	// File Upload: 300 sec base, +120 sec per maxFiles if text types accepted
	if (isFileUploadQuestion(question)) {
		const acceptsText = question.upload.accept.some(
			(type) =>
				type.includes("text") ||
				type === ".txt" ||
				type === ".md" ||
				type === ".json" ||
				type === ".csv" ||
				type === "application/json" ||
				type === "application/xml"
		);
		const additional = acceptsText ? question.upload.maxFiles * 120 : 0;
		return { baseTime: 300, additionalTime: additional };
	}

	// Syntax Error: 120 sec base, +30 sec per 10 lines of code
	if (isSyntaxErrorQuestion(question)) {
		const lineCount = question.code.split("\n").length;
		const additional = Math.floor(lineCount / 10) * 30;
		return { baseTime: 120, additionalTime: additional };
	}

	// Unknown question type: 45 sec fallback
	return { baseTime: 45, additionalTime: 0 };
}

export function calculateQuizTime(questions: Question[]): number {
	if (questions.length === 0) return 0;
	return questions.reduce((total, q) => total + estimateQuestionTime(q), 0);
}

// ============================================
// DIFFICULTY SCORING
// ============================================

interface DifficultyEstimation {
	baseScore: number;
	additionalScore: number;
}

function estimateQuestionDifficulty(question: Question): number {
	const estimation = getDifficultyEstimation(question);
	return estimation.baseScore + estimation.additionalScore;
}

function getDifficultyEstimation(question: Question): DifficultyEstimation {
	// True/False: 10 base
	if (isTrueFalseQuestion(question)) {
		return { baseScore: 10, additionalScore: 0 };
	}

	// Single Choice: 20 base, +3 per option beyond 4
	if (isSingleChoiceQuestion(question)) {
		const optionCount = question.answers.length;
		const additional = Math.max(0, optionCount - 4) * 3;
		return { baseScore: 20, additionalScore: additional };
	}

	// Multiple Choice: 35 base, +5 per correct answer, +3 per option
	if (isMultipleChoiceQuestion(question)) {
		const correctCount = question.answers.filter((a) => a.isCorrect).length;
		const optionCount = question.answers.length;
		const additional = correctCount * 5 + optionCount * 3;
		return { baseScore: 35, additionalScore: additional };
	}

	// Numeric: 40 base, +20 if no tolerance, -10 if tolerance > 5
	if (isNumericQuestion(question)) {
		let additional = 0;
		if (question.tolerance === undefined || question.tolerance === 0) {
			additional = 20;
		} else if (question.tolerance > 5) {
			additional = -10;
		}
		return { baseScore: 40, additionalScore: additional };
	}

	// Text: 45 base, +15 if minLength > 100
	if (isTextAnswerQuestion(question)) {
		const additional = (question.minLength ?? 0) > 100 ? 15 : 0;
		return { baseScore: 45, additionalScore: additional };
	}

	// Ordering: 50 base, +8 per item beyond 4
	if (isOrderingQuestion(question)) {
		const itemCount = question.items.length;
		const additional = Math.max(0, itemCount - 4) * 8;
		return { baseScore: 50, additionalScore: additional };
	}

	// Matching: 45 base, +6 per pair beyond 4
	if (isMatchingQuestion(question)) {
		const pairCount = question.matches.length;
		const additional = Math.max(0, pairCount - 4) * 6;
		return { baseScore: 45, additionalScore: additional };
	}

	// Fill-blank: 40 base, +10 per blank, +5 if any blank is case-sensitive
	if (isFillBlankQuestion(question)) {
		const blankCount = question.blanks.length;
		const hasCaseSensitive = question.blanks.some((b) => b.caseSensitive);
		const additional = blankCount * 10 + (hasCaseSensitive ? 5 : 0);
		return { baseScore: 40, additionalScore: additional };
	}

	// Categorization: 55 base, +5 per item, +10 per category beyond 2
	if (isCategorizationQuestion(question)) {
		const itemCount = question.items.length;
		const categoryCount = question.categories.length;
		const additional = itemCount * 5 + Math.max(0, categoryCount - 2) * 10;
		return { baseScore: 55, additionalScore: additional };
	}

	// File Upload: 60 base
	if (isFileUploadQuestion(question)) {
		return { baseScore: 60, additionalScore: 0 };
	}

	// Syntax Error: 70 base, +5 per error to find, +10 per 20 lines
	if (isSyntaxErrorQuestion(question)) {
		const errorCount = question.errorTokens.length;
		const lineCount = question.code.split("\n").length;
		const additional = errorCount * 5 + Math.floor(lineCount / 20) * 10;
		return { baseScore: 70, additionalScore: additional };
	}

	// Unknown question type: 30 fallback
	return { baseScore: 30, additionalScore: 0 };
}

function calculateQuizRawDifficulty(questions: Question[]): number {
	if (questions.length === 0) return 0;

	// Calculate average difficulty
	const totalDifficulty = questions.reduce(
		(total, q) => total + estimateQuestionDifficulty(q),
		0
	);
	let averageDifficulty = totalDifficulty / questions.length;

	// Variety bonus: +10% if 4+ different question types
	const questionTypes = new Set<string>();
	for (const question of questions) {
		if (isTrueFalseQuestion(question)) questionTypes.add("true-false");
		else if (isSingleChoiceQuestion(question)) questionTypes.add("single-choice");
		else if (isMultipleChoiceQuestion(question)) questionTypes.add("multiple-choice");
		else if (isNumericQuestion(question)) questionTypes.add("numeric");
		else if (isTextAnswerQuestion(question)) questionTypes.add("text");
		else if (isOrderingQuestion(question)) questionTypes.add("ordering");
		else if (isMatchingQuestion(question)) questionTypes.add("matching");
		else if (isFillBlankQuestion(question)) questionTypes.add("fill-blank");
		else if (isCategorizationQuestion(question)) questionTypes.add("categorization");
		else if (isFileUploadQuestion(question)) questionTypes.add("file-upload");
		else if (isSyntaxErrorQuestion(question)) questionTypes.add("syntax-error");
		else questionTypes.add("unknown");
	}

	if (questionTypes.size >= 4) {
		averageDifficulty *= 1.1;
	}

	return averageDifficulty;
}

function median(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0
		? sorted[mid]
		: (sorted[mid - 1] + sorted[mid]) / 2;
}

function mapScoreToLabel(score: number): DifficultyLevel {
	if (score <= 35) return "Einfach";
	if (score <= 55) return "Mittel";
	if (score <= 80) return "Fortgeschritten";
	return "Experte";
}

interface QuizWithRawData {
	id: string;
	questions: Question[];
	rawDifficulty: number;
	estimatedTimeSeconds: number;
}

interface QuizDifficultyResult {
	difficultyScore: number;
	difficulty: DifficultyLevel;
}

export function calculateAllQuizDifficulties(
	quizzes: QuizWithRawData[]
): Map<string, QuizDifficultyResult> {
	const results = new Map<string, QuizDifficultyResult>();

	if (quizzes.length === 0) {
		return results;
	}

	// Handle single quiz case
	if (quizzes.length === 1) {
		const quiz = quizzes[0];
		// Fall back to time-based estimation, map to 0-100 scale
		// Assume 5 min = easy (0), 30 min = hard (100)
		const timeMinutes = quiz.estimatedTimeSeconds / 60;
		const score = Math.min(100, Math.max(0, ((timeMinutes - 5) / 25) * 100));
		results.set(quiz.id, {
			difficultyScore: Math.round(score),
			difficulty: mapScoreToLabel(score),
		});
		return results;
	}

	const rawScores = quizzes.map((q) => q.rawDifficulty);

	// Check if all quizzes have identical raw scores
	const allIdentical = rawScores.every((s) => s === rawScores[0]);
	if (allIdentical) {
		// Fall back to estimated time comparison
		const times = quizzes.map((q) => q.estimatedTimeSeconds);
		const allTimesIdentical = times.every((t) => t === times[0]);

		if (allTimesIdentical) {
			// Fall back to question count
			const counts = quizzes.map((q) => q.questions.length);
			const minCount = Math.min(...counts);
			const maxCount = Math.max(...counts);
			const countSpread = maxCount - minCount;

			for (const quiz of quizzes) {
				let score: number;
				if (countSpread === 0) {
					score = 50; // All identical, default to middle
				} else {
					score = ((quiz.questions.length - minCount) / countSpread) * 100;
				}
				results.set(quiz.id, {
					difficultyScore: Math.round(score),
					difficulty: mapScoreToLabel(score),
				});
			}
			return results;
		}

		// Use time-based scoring
		const medianTime = median(times);
		for (const quiz of quizzes) {
			const deviation = (quiz.estimatedTimeSeconds - medianTime) / medianTime;
			const score = 50 * (1 + Math.tanh(deviation));
			results.set(quiz.id, {
				difficultyScore: Math.round(score),
				difficulty: mapScoreToLabel(score),
			});
		}
		return results;
	}

	// Normal case: Use exponential decay from median
	const medianScore = median(rawScores);
	for (const quiz of quizzes) {
		const deviation = (quiz.rawDifficulty - medianScore) / medianScore;
		const normalizedScore = 50 * (1 + Math.tanh(deviation));
		results.set(quiz.id, {
			difficultyScore: Math.round(normalizedScore),
			difficulty: mapScoreToLabel(normalizedScore),
		});
	}

	return results;
}

export function prepareQuizForDifficultyCalculation(
	id: string,
	questions: Question[]
): QuizWithRawData {
	return {
		id,
		questions,
		rawDifficulty: calculateQuizRawDifficulty(questions),
		estimatedTimeSeconds: calculateQuizTime(questions),
	};
}
