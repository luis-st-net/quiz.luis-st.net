import { Quiz, QuizGroup } from "@/lib/types";
import fs from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import {
	calculateQuizTime,
	calculateAllQuizDifficulties,
	prepareQuizForDifficultyCalculation,
} from "./quiz-estimation";

export interface LoadQuizzesResult {
	quizzes: Quiz[];
	hierarchy: QuizGroup;
}

export async function loadQuizzes(): Promise<LoadQuizzesResult> {
	noStore();

	const quizzesDir = path.join(process.cwd(), "quizzes");
	console.log("Loading quizzes from directory:", quizzesDir);

	try {
		await fs.access(quizzesDir);
		const hierarchy = await loadDirectory(quizzesDir, "", "");
		const quizzes = flattenHierarchy(hierarchy);

		// Calculate difficulty scores across all quizzes
		const quizDataForDifficulty = quizzes.map((q) =>
			prepareQuizForDifficultyCalculation(q.id, q.questions)
		);
		const difficultyResults = calculateAllQuizDifficulties(quizDataForDifficulty);

		// Update quizzes with calculated values
		for (const quiz of quizzes) {
			quiz.estimatedTimeSeconds = calculateQuizTime(quiz.questions);
			const diffResult = difficultyResults.get(quiz.id);
			if (diffResult) {
				quiz.difficulty = diffResult.difficulty;
				quiz.difficultyScore = diffResult.difficultyScore;
			} else {
				quiz.difficulty = "Einfach";
				quiz.difficultyScore = 0;
			}
		}

		// Also update quizzes in the hierarchy
		updateHierarchyWithCalculations(hierarchy, difficultyResults);

		console.log(`Loaded ${quizzes.length} quizzes`);
		return { quizzes, hierarchy };
	} catch (error) {
		console.error("Error accessing quizzes directory:", error);
		return {
			quizzes: [],
			hierarchy: { name: "", quizzes: [], subgroups: new Map() }
		};
	}
}

function updateHierarchyWithCalculations(
	group: QuizGroup,
	difficultyResults: Map<string, { difficultyScore: number; difficulty: Quiz["difficulty"] }>
): void {
	for (const quiz of group.quizzes) {
		quiz.estimatedTimeSeconds = calculateQuizTime(quiz.questions);
		const diffResult = difficultyResults.get(quiz.id);
		if (diffResult) {
			quiz.difficulty = diffResult.difficulty;
			quiz.difficultyScore = diffResult.difficultyScore;
		} else {
			quiz.difficulty = "Einfach";
			quiz.difficultyScore = 0;
		}
	}

	for (const subgroup of group.subgroups.values()) {
		updateHierarchyWithCalculations(subgroup, difficultyResults);
	}
}

async function loadDirectory(dirPath: string, name: string, groupPath: string): Promise<QuizGroup> {
	const entries = await fs.readdir(dirPath, { withFileTypes: true });
	const group: QuizGroup = { name, quizzes: [], subgroups: new Map() };

	for (const entry of entries) {
		const entryPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			const subPath = groupPath ? `${groupPath}/${entry.name}` : entry.name;
			const subgroup = await loadDirectory(entryPath, entry.name, subPath);
			// Only add non-empty subgroups
			if (subgroup.quizzes.length > 0 || subgroup.subgroups.size > 0) {
				group.subgroups.set(entry.name, subgroup);
			}
		} else if (entry.name.endsWith(".json")) {
			const quiz = await loadQuizFile(entryPath, groupPath);
			if (quiz) {
				group.quizzes.push(quiz);
			}
		}
	}

	// Sort quizzes by order
	group.quizzes.sort((a, b) => a.order - b.order);

	return group;
}

async function loadQuizFile(filePath: string, groupPath: string): Promise<Quiz | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const data = JSON.parse(content);

		// Validate required fields
		if (!data.id || !data.name || !data.description || !Array.isArray(data.questions)) {
			console.error(`Invalid quiz format in file: ${filePath}`);
			return null;
		}

		// Handle both old format (config.order) and new format (order at root)
		const order = typeof data.order === "number" ? data.order : (data.config?.order ?? 0);

		return {
			id: data.id,
			name: data.name,
			description: data.description,
			order,
			group: groupPath,
			questions: data.questions,
			// These will be calculated after all quizzes are loaded
			estimatedTimeSeconds: 0,
			difficulty: "Einfach" as const,
			difficultyScore: 0,
		};
	} catch (error) {
		console.error(`Error loading quiz file ${filePath}:`, error);
		return null;
	}
}

function flattenHierarchy(group: QuizGroup): Quiz[] {
	const quizzes: Quiz[] = [...group.quizzes];

	for (const subgroup of group.subgroups.values()) {
		quizzes.push(...flattenHierarchy(subgroup));
	}

	return quizzes;
}
