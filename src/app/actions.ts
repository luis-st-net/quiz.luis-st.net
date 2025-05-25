"use server";

export async function onComplete(quizId: string,answers: Record<string, string>) {
	console.log("onComplete", quizId, answers);
}
