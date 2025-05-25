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
	{ questionId, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "children"> & { questionId: string },
) {
	const {
		getIndexOfQuestion,
		getQuestionById,
		getMaxNumberOfQuestions,
		previousQuestion,
		nextQuestion,
		getNumberOfAnsweredQuestions,
		areAllQuestionsAnswered
	} = useQuestionContext();
	
	const question = getQuestionById(questionId);
	const questionIndex = question ? getIndexOfQuestion(question.id) : -1;
	if (!question || questionIndex === undefined || questionIndex === -1) {
		return null;
	}
	
	const isFirstQuestion = questionIndex === 0;
	const isLastQuestion = questionIndex === getMaxNumberOfQuestions() - 1;
	const progress = (100 / getMaxNumberOfQuestions()) * getNumberOfAnsweredQuestions();
	
	return (
		<div className={cn(className)} {...props}>
			<Ui.Card className="w-full max-w-3xl mx-auto">
				<Ui.CardHeader>
					<Ui.CardTitle>
						Question {questionIndex + 1} of {getMaxNumberOfQuestions()}
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
					<Ui.CardFooter className="flex justify-between">
						<Ui.Button variant="outline" onClick={() => previousQuestion(questionIndex)} disabled={isFirstQuestion} className="mr-2">
							Previous
						</Ui.Button>
						<Ui.Button onClick={() => nextQuestion(questionIndex)} disabled={isLastQuestion && !areAllQuestionsAnswered()}>
							{isLastQuestion ? "Finish" : "Next"}
						</Ui.Button>
					</Ui.CardFooter>
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
