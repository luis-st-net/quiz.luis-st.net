import type { Metadata } from "next";
import * as Ui from "@/lib/components/ui/";
import "./globals.css";
import React from "react";
import NavigationBar from "@/lib/components/navigation-bar";
import Footer from "@/lib/components/footer";
import { UserProvider } from "@/lib/contexts/user-context";
import { QuizProvider } from "@/lib/contexts/quiz-context";
import { sendMail } from "@/app/actions";
import { loadQuizzes } from "@/lib/load-quizzes";

export const metadata: Metadata = {
	title: "Quiz-Website für die HFU",
	description: "Dies ist eine Quiz-Website für HFU-Studierende.",
	generator: "Next.js",
	creator: "Luis Staudt",
	publisher: "Luis Staudt",
};

export default async function RootLayout(
	{ children }: { children: React.ReactNode },
) {
	const quizzes = await loadQuizzes();
	
	return (
		<html lang="en" suppressHydrationWarning>
		<body className="min-w-64">
		<Ui.ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<UserProvider>
				<QuizProvider quizzes={quizzes} onCompleteAction={sendMail}>
					<div className="flex flex-col h-screen w-full">
						<NavigationBar/>
						<main className="flex-1 min-h-0 overflow-hidden">
							{children}
						</main>
						<Footer/>
					</div>
				</QuizProvider>
			</UserProvider>
			<Ui.ToasterProvider/>
		</Ui.ThemeProvider>
		</body>
		</html>
	);
}
