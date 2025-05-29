"use client";

import * as Ui from "@/lib/components/ui/";
import ContentPane from "@/lib/components/content-pane";
import React from "react";
import { useQuestionContext } from "@/lib/contexts/question-context";
import { useQuizContext } from "@/lib/contexts/quiz-context";

export default function () {
	const { getQuizById } = useQuizContext();
	const { quizId, finishQuiz } = useQuestionContext();
	
	const quiz = getQuizById(quizId);
	if (!quiz) {
		return <div className="p-4 text-custom-red">Quiz not found</div>;
	}
	
	const [submitted, setSubmitted] = React.useState(false);
	
	const handleSubmit = () => {
		if (submitted) {
			return;
		}
		setSubmitted(true);
		finishQuiz();
	};
	
	return (
		<ContentPane defaultColor={true} className="w-4/5 lg:w-2/3 2xl:w-1/3">
			<div className="m-1">
				<div>
					<h3 className="mb-3 text-xl tiny:text-2xl">
						<strong>
							Submit answers for {quiz.name}
						</strong>
					</h3>
				</div>
				<div className="my-8">
					By submitting, your answers will be sent for evaluation to the quiz owner. If you have provided a mail address, you receive a copy of your answers.
				</div>
				<Ui.Button onClick={() => handleSubmit()} className="w-full">
					{submitted ? "Submitting..." : "Submit answers"}
				</Ui.Button>
			</div>
		</ContentPane>
	);
}
