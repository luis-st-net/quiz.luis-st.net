"use client";

import { useQuestionContext } from "@/lib/contexts/question-context";
import { Question } from "@/lib/types";
import Link from "next/link";
import ContentPane from "@/lib/components/content-pane";

export default function () {
	const { quizId, questions } = useQuestionContext();
	
	return (
		<div className="w-full flex flex-col items-center mt-16 mb-8">
			<h1 className="text-4xl font-bold mb-16">
				Questions of quiz Test
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
	{ quizId, id: questionId, index, shortQuestion, question }: Question & { quizId: string, index: number },
) {
	return (
		<Link href={"/" + quizId + "/" + questionId} className="w-full">
			<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
				<div className="p-4 text-xl">
					Question {index + 1}: {shortQuestion}
				</div>
			</ContentPane>
		</Link>
	);
}
