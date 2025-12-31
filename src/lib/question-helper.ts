import { CategorizationQuestion, FillBlankQuestion, FileUploadQuestion, MatchingQuestion, MultipleChoiceQuestion, NumericQuestion, OrderingQuestion, Question, SingleChoiceQuestion, SyntaxErrorQuestion, TextQuestion, TrueFalseQuestion } from "./types";

export function isTrueFalseQuestion(question: Question): question is TrueFalseQuestion {
	return "correctAnswer" in question && typeof (question as any).correctAnswer === "boolean";
}

export function isNumericQuestion(question: Question): question is NumericQuestion {
	return "correctAnswer" in question && typeof (question as any).correctAnswer === "number";
}

export function isTextAnswerQuestion(question: Question): question is TextQuestion {
	return ("minLength" in question || "maxLength" in question) && !("correctAnswer" in question) && !("answers" in question);
}

export function isSingleChoiceQuestion(question: Question): question is SingleChoiceQuestion {
	return "answers" in question && Array.isArray((question as any).answers) && "correctAnswerIndex" in question && !(question as any).answers.some((answer: any) => "isCorrect" in answer);
}

export function isMultipleChoiceQuestion(question: Question): question is MultipleChoiceQuestion {
	return "answers" in question && Array.isArray((question as any).answers) && (question as any).answers.some((answer: any) => "isCorrect" in answer);
}

export function isOrderingQuestion(question: Question): question is OrderingQuestion {
	return "items" in question && Array.isArray((question as any).items) && (question as any).items.some((item: any) => "correctPosition" in item);
}

export function isMatchingQuestion(question: Question): question is MatchingQuestion {
	return "items" in question && "matches" in question && Array.isArray((question as any).items) && Array.isArray((question as any).matches);
}

export function isFillBlankQuestion(question: Question): question is FillBlankQuestion {
	return "blanks" in question && Array.isArray((question as any).blanks);
}

export function isCategorizationQuestion(question: Question): question is CategorizationQuestion {
	return "categories" in question && "items" in question && Array.isArray((question as any).categories) && Array.isArray((question as any).items) && (question as any).items.some((item: any) => "correctCategory" in item);
}

export function isFileUploadQuestion(question: Question): question is FileUploadQuestion {
	return "upload" in question && typeof (question as any).upload === "object";
}

export function isSyntaxErrorQuestion(question: Question): question is SyntaxErrorQuestion {
	return "code" in question && "language" in question && "errorTokens" in question && Array.isArray((question as any).errorTokens);
}
