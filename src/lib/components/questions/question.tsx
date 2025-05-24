"use client";

import * as Ui from "@/lib/components/ui/";
import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utility";
import { useQuestionContext } from "@/lib/contexts/question-context";
import type { Question } from "@/lib/types";
import TrueFalseQuestion from "@/lib/components/questions/true-false-question";
import * as Questions from "@/lib/question-helper";
import TextAnswerQuestion from "@/lib/components/questions/text-answer-question";
import SingleChoiceQuestion from "@/lib/components/questions/single-choice-question";
import MultipleChoiceQuestion from "@/lib/components/questions/multiple-choice-question";
import OrderingQuestion from "@/lib/components/questions/ordering-question";
import MatchingQuestion from "@/lib/components/questions/matching-question";
import NumericQuestion from "@/lib/components/questions/numeric-question";

export default function Question(
	{ className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "children">,
) {
	const {
		getQuestionByIndex,
		getMaxNumberOfQuestions,
		currentQuestionIndex,
		goToPreviousQuestion,
		goToNextQuestion,
		finishQuestions,
		hasAnswer,
	} = useQuestionContext();
	
	const question = getQuestionByIndex(currentQuestionIndex);
	
	if (!question) {
		return null;
	}
	
	const maxNumberOfQuestions = getMaxNumberOfQuestions();
	const questionPosition = question.index + 1;
	const progress = (100 / maxNumberOfQuestions) * questionPosition;
	const isLastQuestion = currentQuestionIndex === maxNumberOfQuestions - 1;
	const currentQuestionHasAnswer = hasAnswer(question.id);
	
	return (
		<div className={cn(className)} {...props}>
			<Ui.Card className="w-full max-w-3xl mx-auto">
				<Ui.CardHeader>
					<Ui.CardTitle>
						Question {questionPosition} of {maxNumberOfQuestions}
					</Ui.CardTitle>
					<Ui.CardDescription>
						{question.question}
					</Ui.CardDescription>
					<Ui.Progress value={progress} className="h-2"/>
				</Ui.CardHeader>
				<Ui.CardContent>
					<DynamicQuestion question={question}/>
				</Ui.CardContent>
				<Ui.CardFooter className="flex justify-between">
					<Ui.Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
						Previous
					</Ui.Button>
					<Ui.Button onClick={isLastQuestion ? finishQuestions : goToNextQuestion} disabled={!currentQuestionHasAnswer}>
						{isLastQuestion ? "Finish" : "Next"}
					</Ui.Button>
				</Ui.CardFooter>
			</Ui.Card>
		</div>
	);
}

function DynamicQuestion(
	{ question }: { question: Question },
) {
	if (Questions.isTrueFalseQuestion(question)) {
		return <TrueFalseQuestion question={question}/>;
	} else if (Questions.isNumericQuestion(question)) {
		return <NumericQuestion question={question}/>;
	} else if (Questions.isTextAnswerQuestion(question)) {
		return <TextAnswerQuestion question={question}/>;
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
		<div className="text-red-500">
			Unsupported question type
		</div>
	);
}
