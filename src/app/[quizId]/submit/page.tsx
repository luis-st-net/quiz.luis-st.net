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
		return (
			<ContentPane className="w-4/5 bg-custom-red lg:w-2/3 2xl:w-1/3">
				<h3 className="m-1 text-2xl">
					<strong>
						Quiz wurde nicht gefunden
					</strong>
				</h3>
			</ContentPane>
		);
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
							Antworten für Quiz {quiz.name} einreichen
						</strong>
					</h3>
				</div>
				<div className="my-8">
					Mit dem Absenden werden Ihre Antworten zur Auswertung an den Eigentümer des Quiz gesendet. Wenn Sie eine Mailadresse angegeben haben, erhalten Sie eine Kopie Ihrer Antworten.
				</div>
				<Ui.Button onClick={() => handleSubmit()} className="w-full">
					{submitted ? "Einreichen..." : "Antworten einreichen"}
				</Ui.Button>
			</div>
		</ContentPane>
	);
}
