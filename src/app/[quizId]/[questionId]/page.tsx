"use client";

import Question from "@/lib/components/questions/question";
import { useParams } from "next/navigation";

export default function () {
	const questionId = useParams().questionId as string;
	
	return (
		<Question questionId={questionId}/>
	);
}
