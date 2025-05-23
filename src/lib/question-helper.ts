import { MatchingQuestion, MultipleChoiceQuestion, NumericQuestion, OrderingQuestion, Question, SingleChoiceQuestion, TextAnswerQuestion, TrueFalseQuestion } from "./types";

export function isTrueFalseQuestion(question: Question): question is TrueFalseQuestion {
	return "correctAnswer" in question && typeof (question as any).correctAnswer === "boolean";
}

export function isNumericQuestion(question: Question): question is NumericQuestion {
	return "correctAnswer" in question && typeof (question as any).correctAnswer === "number";
}

export function isTextAnswerQuestion(question: Question): question is TextAnswerQuestion {
	return ("minLength" in question || "maxLength" in question) && !("correctAnswer" in question) && !("answers" in question);
}

export function isSingleChoiceQuestion(question: Question): question is SingleChoiceQuestion {
	return "answers" in question && Array.isArray((question as any).answers) && "correctAnswer" in question && !(question as any).answers.some((answer: any) => "isCorrect" in answer);
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
