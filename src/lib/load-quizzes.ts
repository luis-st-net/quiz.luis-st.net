import { Quiz } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

export async function loadQuizzes(): Promise<Quiz[]> {
	const quizzesDir = path.join(process.cwd(), "quizzes");
	const quizzes: Quiz[] = [];
	
	try {
		await fs.access(quizzesDir);
		
		const files = await fs.readdir(quizzesDir);
		
		const quizFiles = files.filter(file => file.endsWith(".json"));
		
		for (const file of quizFiles) {
			try {
				const filePath = path.join(quizzesDir, file);
				const fileContent = await fs.readFile(filePath, "utf-8");
				const quiz = JSON.parse(fileContent) as Quiz;
				
				if (quiz.id && quiz.name && quiz.description && quiz.config && Array.isArray(quiz.questions)) {
					quizzes.push(quiz);
				} else {
					console.error(`Invalid quiz format in file: ${file}`);
				}
			} catch (error) {
				console.error(`Error loading quiz file ${file}:`, error);
			}
		}
	} catch (error) {
		console.error("Error accessing quizzes directory:", error);
	}
	
	return quizzes;
}
