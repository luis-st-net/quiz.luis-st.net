"use server";

export async function onComplete(name: string, quizId: string, answers: Record<string, string>) {
	console.log("onComplete", name, quizId, answers);
}
