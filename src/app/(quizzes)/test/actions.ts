"use server";

export async function goToPrevious() {
	console.log("goToPrevious");
}

export async function goToNext() {
	console.log("goToNext");
}

export async function onComplete(answers: Record<string, string>) {
	console.log("onComplete", answers);
}
