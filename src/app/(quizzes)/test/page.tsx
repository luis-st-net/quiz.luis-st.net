"use client";

import { useQuestionContext } from "@/lib/contexts/question-context";
import { Question } from "@/lib/types";
import Link from "next/link";
import ContentPane from "@/lib/components/content-pane";

export default function () {
	const { questions } = useQuestionContext();
	
	return (
		<div className="w-full flex flex-col items-center mt-12 mb-8">
			<h1 className="text-4xl font-bold mb-12">
				Questions of quiz Test
			</h1>
			<div className="w-4/5 flex flex-wrap gap-6 lg:w-1/2 2xl:w-1/5">
				{questions.map((question) => (
					<QuestionItem key={question.id} {...question} />
				))}
			</div>
		</div>
	);
}

function QuestionItem(
	{ id, index, shortDescription, question }: Question,
) {
	return (
		<Link href={"/test/" + id} className="w-full">
			<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
				<div className="p-4 text-xl">
					Question {index + 1}: {shortDescription}
				</div>
			</ContentPane>
		</Link>
	);
}
