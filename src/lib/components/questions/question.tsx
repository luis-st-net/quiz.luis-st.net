"use client";

import React from "react";
import * as Ui from "@/lib/components/ui/";
import { useQuestionContext } from "@/lib/contexts/question-context";
import type { Question } from "@/lib/types";
import TrueFalseQuestion from "@/lib/components/questions/true-false-question";
import * as Questions from "@/lib/question-helper";
import TextQuestion from "@/lib/components/questions/text-question";
import SingleChoiceQuestion from "@/lib/components/questions/single-choice-question";
import MultipleChoiceQuestion from "@/lib/components/questions/multiple-choice-question";
import OrderingQuestion from "@/lib/components/questions/ordering-question";
import MatchingQuestion from "@/lib/components/questions/matching-question";
import NumericQuestion from "@/lib/components/questions/numeric-question";
import FillBlankQuestion from "@/lib/components/questions/fill-blank-question";
import CategorizationQuestion from "@/lib/components/questions/categorization-question";
import FileUploadQuestion from "@/lib/components/questions/file-upload-question";
import SyntaxErrorQuestion from "@/lib/components/questions/syntax-error-question";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Question(
	{ questionId }: { questionId: string },
) {
	const {
		getIndexOfQuestion,
		getQuestionById,
		getMaxNumberOfQuestions,
		currentQuestionIndex,
		goToQuestion,
		preventNavigation,
		previousQuestion,
		nextQuestion,
		getNumberOfAnsweredQuestions,
		areAllQuestionsAnswered,
	} = useQuestionContext();

	// Set the current question index based on the route parameter
	const question = getQuestionById(questionId);
	const questionIndex = question ? getIndexOfQuestion(question.id) : -1;

	// Sync the route-based questionId with the context's currentQuestionIndex
	React.useEffect(() => {
		if (questionIndex !== undefined && questionIndex >= 0 && questionIndex !== currentQuestionIndex) {
			goToQuestion(questionIndex);
		}
	}, [questionIndex, currentQuestionIndex, goToQuestion]);

	if (!question || questionIndex === undefined || questionIndex === -1) {
		return (
			<div className="flex items-center justify-center min-h-full p-4">
				<Card className="w-full max-w-md border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="size-5" />
							Fehler
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Frage wurde nicht gefunden
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isFirstQuestion = questionIndex === 0;
	const isLastQuestion = questionIndex === getMaxNumberOfQuestions() - 1;
	const progress = (100 / getMaxNumberOfQuestions()) * getNumberOfAnsweredQuestions();

	return (
		<div className="flex items-center justify-center min-h-full p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl tiny:text-2xl">
							Frage {questionIndex + 1} von {getMaxNumberOfQuestions()}
						</CardTitle>
					</div>
					<Ui.Progress value={progress} className="h-2 mt-2" />
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Don't show raw question text for fill-blank questions since they render it with inputs */}
					{!Questions.isFillBlankQuestion(question) && (
						<p className="text-sm tiny:text-base text-muted-foreground">
							{question.question}
						</p>
					)}
					<div>
						<DynamicQuestion question={question}/>
					</div>
					<div className="flex justify-between pt-4">
						<Ui.Button variant="outline" onClick={() => previousQuestion()} disabled={isFirstQuestion || preventNavigation}>
							Zurück
						</Ui.Button>
						<Ui.Button onClick={() => nextQuestion()} disabled={(isLastQuestion && !areAllQuestionsAnswered()) || preventNavigation}>
							{isLastQuestion ? "Abschließen" : "Weiter"}
						</Ui.Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function DynamicQuestion(
	{ question }: { question: Question },
) {
	// Check most specific types first to avoid conflicts
	if (Questions.isFillBlankQuestion(question)) {
		return <FillBlankQuestion question={question}/>;
	} else if (Questions.isFileUploadQuestion(question)) {
		return <FileUploadQuestion question={question}/>;
	} else if (Questions.isSyntaxErrorQuestion(question)) {
		return <SyntaxErrorQuestion question={question}/>;
	} else if (Questions.isCategorizationQuestion(question)) {
		return <CategorizationQuestion question={question}/>;
	} else if (Questions.isTrueFalseQuestion(question)) {
		return <TrueFalseQuestion question={question}/>;
	} else if (Questions.isNumericQuestion(question)) {
		return <NumericQuestion question={question}/>;
	} else if (Questions.isTextAnswerQuestion(question)) {
		return <TextQuestion question={question}/>;
	} else if (Questions.isSingleChoiceQuestion(question)) {
		return <SingleChoiceQuestion question={question}/>;
	} else if (Questions.isMultipleChoiceQuestion(question)) {
		return <MultipleChoiceQuestion question={question}/>;
	} else if (Questions.isOrderingQuestion(question)) {
		return <OrderingQuestion question={question}/>;
	} else if (Questions.isMatchingQuestion(question)) {
		return <MatchingQuestion question={question}/>;
	}
	return (
		<div className="text-custom-red">
			Der Fragetyp wird nicht unterstützt
		</div>
	);
}
