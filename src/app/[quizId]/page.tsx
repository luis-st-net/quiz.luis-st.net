"use client";

import { useQuestionContext } from "@/lib/contexts/question-context";
import { Question } from "@/lib/types";
import Link from "next/link";
import ContentPane from "@/lib/components/content-pane";

export default function () {
	const { quizId, questions } = useQuestionContext();
	
	return (
		<div className="w-full flex flex-col items-center mt-16 mb-8">
			<h1 className="text-3xl mb-16 mx-2 text-center tiny:text-4xl xxs:text-start">
				<strong>
					Fragen des Quiz
				</strong>
			</h1>
			<div className="w-4/5 flex flex-wrap gap-6 lg:w-1/2 2xl:w-1/4">
				{questions.map((question, index) => (
					<QuestionItem key={question.id} quizId={quizId} index={index} {...question} />
				))}
			</div>
		</div>
	);
}

function QuestionItem(
	{ quizId, id: questionId, index, shortQuestion }: Question & { quizId: string, index: number },
) {
	return (
		<Link href={"/" + quizId + "/" + questionId} className="w-full">
			<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
				<div className="p-2 text-base tiny:p-4 tiny:text-xl">
					Frage {index + 1}: {shortQuestion}
				</div>
			</ContentPane>
		</Link>
	);
}
