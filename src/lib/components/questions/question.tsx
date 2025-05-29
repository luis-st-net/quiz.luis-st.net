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
import ContentPane from "@/lib/components/content-pane";

export default function Question(
	{ questionId }: { questionId: string },
) {
	const {
		getIndexOfQuestion,
		getQuestionById,
		getMaxNumberOfQuestions,
		preventNavigation,
		previousQuestion,
		nextQuestion,
		getNumberOfAnsweredQuestions,
		areAllQuestionsAnswered,
	} = useQuestionContext();
	
	const question = getQuestionById(questionId);
	const questionIndex = question ? getIndexOfQuestion(question.id) : -1;
	if (!question || questionIndex === undefined || questionIndex === -1) {
		return (
			<ContentPane className="w-4/5 bg-custom-red lg:w-2/3 2xl:w-1/3">
				<div className="m-1 text-lg">
					Frage wurde nicht gefunden
				</div>
			</ContentPane>
		);
	}
	
	const isFirstQuestion = questionIndex === 0;
	const isLastQuestion = questionIndex === getMaxNumberOfQuestions() - 1;
	const progress = (100 / getMaxNumberOfQuestions()) * getNumberOfAnsweredQuestions();
	
	return (
		<ContentPane defaultColor={true} className="w-4/5 lg:w-2/3 2xl:w-1/3">
			<div className="m-1">
				<div>
					<h3 className="mb-3 text-xl tiny:text-2xl">
						<strong>
							Frage {questionIndex + 1} von {getMaxNumberOfQuestions()}
						</strong>
					</h3>
					<p className="mb-2 text-sm tiny:text-base">
						{question.question}
					</p>
					<Ui.Progress value={progress} className="h-2 bg-custom-quaternary"/>
				</div>
				<div className="my-8">
					<DynamicQuestion question={question}/>
				</div>
				<div className="flex justify-between">
					<Ui.Button variant="outline" onClick={() => previousQuestion(questionIndex)} disabled={isFirstQuestion || preventNavigation}>
						Zurück
					</Ui.Button>
					<Ui.Button onClick={() => nextQuestion(questionIndex)} disabled={(isLastQuestion && !areAllQuestionsAnswered()) || preventNavigation}>
						{isLastQuestion ? "Abschließen" : "Weiter"}
					</Ui.Button>
				</div>
			</div>
		</ContentPane>
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
