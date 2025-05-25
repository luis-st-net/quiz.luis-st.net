"use client";

import Link from "next/link";
import { Quiz } from "@/lib/types";
import ContentPane from "@/lib/components/content-pane";
import { quizzes } from "@/lib/quizzes";

export default async function () {
	return (
		<div className="w-full flex flex-col items-center mt-12 mb-8">
			<h1 className="text-4xl font-bold mb-12">
				Select a quiz
			</h1>
			<div className="w-4/5 flex flex-wrap gap-6 lg:w-1/2 2xl:w-1/5">
				{quizzes.map((quiz) => (
					<QuizItem key={quiz.id} {...quiz} />
				))}
			</div>
		</div>
	);
}

function QuizItem(
	{ id, name }: Quiz,
) {
	return (
		<Link href={"/name?redirect=/" + id.toLowerCase()} className="w-full">
			<ContentPane defaultColor={true} defaultSpacing={false} className="w-full">
				<div className="p-4 text-xl">
					<strong>
						{name}
					</strong>
				</div>
			</ContentPane>
		</Link>
	);
}
