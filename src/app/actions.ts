"use server";

import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { MatchingQuestionInput, MultipleChoiceQuestionInput, NumericQuestionInput, OrderingQuestionInput, QuestionInput, SingleChoiceQuestionInput, TextQuestionInput, TrueFalseQuestionInput } from "@/lib/types";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

export async function sendMail(name: string | undefined, mail: string | undefined, quiz: string, answers: Record<string, QuestionInput>) {
	if (!name) {
		name = "Anonymous";
	}
	name = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
	quiz = quiz.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
	
	console.log("Sending mail for quiz", quiz, "by", name);
	try {
		const text = getText(name, quiz, answers);
		const html = getHtml(name, quiz, answers);
		
		const recipients = mail ? [mail, process.env.SMTP_USER as string] : [process.env.SMTP_USER as string];
		
		const mailOptions: Mail.Options = {
			from: process.env.SMTP_USER,
			to: recipients,
			subject: "Quiz " + quiz + " abgeschlossen von " + name,
			text: text,
			html: html,
		};
		
		await transporter.sendMail(mailOptions);
		
		return {
			success: true,
			message: "Quiz wurde erfolgreich eingereicht.",
		};
	} catch (e) {
		return {
			success: false,
			message: "Beim Absenden des Quiz ist ein Fehler aufgetreten.",
		};
	}
}

function getText(name: string, quiz: string, answers: Record<string, QuestionInput>) {
	let text = `Quiz ${quiz} abgeschlossen von ${name}\n\n`;
	
	for (const key in answers) {
		const question = answers[key];
		text += `Frage: ${question.question}\n`;
		
		if (question.type === "true-false") {
			const questionInput = question as TrueFalseQuestionInput;
			
			text += `Antwort: ${questionInput.inputAnswer ? "Wahr" : "Falsch"}\n`;
			text += `Richtige Antwort: ${questionInput.correctAnswer ? "Wahr" : "Falsch"}\n`;
		} else if (question.type === "numeric") {
			const questionInput = question as NumericQuestionInput;
			
			text += `Antwort: ${questionInput.inputAnswer}\n`;
			text += `Richtige Antwort: ${questionInput.correctAnswer}`;
			if (questionInput.tolerance) {
				text += ` (±${questionInput.tolerance})`;
			}
			text += "\n";
		} else if (question.type === "text") {
			const questionInput = question as TextQuestionInput;
			text += `Antwort: ${questionInput.inputAnswer}\n`;
		} else if (question.type === "single-choice") {
			const questionInput = question as SingleChoiceQuestionInput;
			
			text += `Antwort: ${questionInput.answers[questionInput.inputAnswer]}\n`;
			text += `Richtige Antwort: ${questionInput.answers[questionInput.correctAnswerIndex]}\n`;
		} else if (question.type === "multiple-choice") {
			const questionInput = question as MultipleChoiceQuestionInput;
			
			text += "Gewählte Antworten:\n";
			questionInput.inputAnswer.forEach(value => {
				text += `- ${questionInput.answers[value].answer}\n`;
			});
			
			text += "Richtige Antworten:\n";
			questionInput.answers.forEach(answer => {
				if (answer.isCorrect) {
					text += `- ${answer.answer}\n`;
				}
			});
		} else if (question.type === "ordering") {
			const questionInput = question as OrderingQuestionInput;
			
			text += "Deine Reihenfolge:\n";
			questionInput.inputAnswer.forEach((itemIndex, index) => {
				text += `${index + 1}. ${questionInput.items[itemIndex]}\n`;
			});
			
			text += "Richtige Reihenfolge:\n";
			questionInput.correctAnswerOrder.forEach((item, index) => {
				text += `${index + 1}. ${item}\n`;
			});
		} else if (question.type === "matching") {
			const questionInput = question as MatchingQuestionInput;
			text += "Deine Zuordnungen:\n";
			
			for (const item in questionInput.inputMatches) {
				text += `- ${item} → ${questionInput.inputMatches[item]}\n`;
			}
			
			text += "Richtige Zuordnungen:\n";
			for (const match in questionInput.correctMatches) {
				text += `- ${match} → ${questionInput.correctMatches[match]}\n`;
			}
		}
		
		text += "\n---\n\n";
	}
	return text;
}

function getHtml(name: string, quiz: string, answers: Record<string, QuestionInput>) {
	let html = `
    <html lang="de">
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .question { margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        .question-text { font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .answer { margin-left: 15px; }
        .correct { color: #27ae60; }
        .incorrect { color: #e74c3c; }
        .unknown { color: #f39c12; }
      </style>
    </head>
    <body>
    <div class="container"><h1>Quiz ${quiz} abgeschlossen von ${name}</h1>`;
	
	for (const key in answers) {
		const question = answers[key];
		html += `<div class="question"> <div class="question-text">${question.question}</div>`;
		
		if (question.type === "true-false") {
			const questionInput = question as TrueFalseQuestionInput;
			
			html += `<div class="answer">Deine Antwort: <span class="${questionInput.inputAnswer === questionInput.correctAnswer ? "correct" : "incorrect"}">${questionInput.inputAnswer ? "Wahr" : "Falsch"}</span></div>`;
			html += `<div class="answer">Richtige Antwort: <span class="correct">${questionInput.correctAnswer ? "Wahr" : "Falsch"}</span></div>`;
			
		} else if (question.type === "numeric") {
			const questionInput = question as NumericQuestionInput;
			const isCorrect = questionInput.tolerance ? Math.abs(questionInput.inputAnswer - questionInput.correctAnswer) <= questionInput.tolerance : questionInput.inputAnswer === questionInput.correctAnswer;
			
			html += `<div class="answer">Deine Antwort: <span class="${isCorrect ? "correct" : "incorrect"}">${questionInput.inputAnswer}</span></div>`;
			html += `<div class="answer">Richtige Antwort: <span class="correct">${questionInput.correctAnswer}</span>`;
			if (questionInput.tolerance) {
				html += ` (±${questionInput.tolerance})`;
			}
			html += `</div>`;
		} else if (question.type === "text") {
			const questionInput = question as TextQuestionInput;
			
			const answer = questionInput.inputAnswer.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
			html += `<div class="answer">Antwort: <span class="unknown">${answer}</span></div>`;
		} else if (question.type === "single-choice") {
			const questionInput = question as SingleChoiceQuestionInput;
			
			html += `<div class="answer">Deine Antwort: <span class="${questionInput.inputAnswer === questionInput.correctAnswerIndex ? "correct" : "incorrect"}">${questionInput.answers[questionInput.inputAnswer]}</span></div>`;
			html += `<div class="answer">Richtige Antwort: <span class="correct">${questionInput.answers[questionInput.correctAnswerIndex]}</span></div>`;
		} else if (question.type === "multiple-choice") {
			const questionInput = question as MultipleChoiceQuestionInput;
			
			html += `<div class="answer">Deine Antworten:<ul>`;
			questionInput.inputAnswer.forEach(value => {
				const isCorrect = questionInput.answers[value].isCorrect;
				html += `<li class="${isCorrect ? "correct" : "incorrect"}">${questionInput.answers[value].answer}</li>`;
			});
			
			html += `</ul></div><div class="answer">Richtige Antworten:<ul>`;
			questionInput.answers.forEach(answer => {
				if (answer.isCorrect) {
					html += `<li class="correct">${answer.answer}</li>`;
				}
			});
			html += `</ul></div>`;
		} else if (question.type === "ordering") {
			const questionInput = question as OrderingQuestionInput;
			
			html += `<div class="answer">Deine Reihenfolge:<ol>`;
			questionInput.inputAnswer.forEach((itemIndex, arrayIndex) => {
				const item = questionInput.items[itemIndex];
				const isCorrect = item === questionInput.correctAnswerOrder[arrayIndex];
				html += `<li class="${isCorrect ? "correct" : "incorrect"}">${item}</li>`;
			});
			
			html += `</ol></div><div class="answer">Richtige Reihenfolge:<ol>`;
			questionInput.correctAnswerOrder.forEach(item => {
				html += `<li class="correct">${item}</li>`;
			});
			html += `</ol></div>`;
		} else if (question.type === "matching") {
			const questionInput = question as MatchingQuestionInput;
			
			html += `<div class="answer">Deine Zuordnungen:<ul>`;
			for (const item in questionInput.inputMatches) {
				const isCorrect = questionInput.correctMatches[item] === questionInput.inputMatches[item];
				html += `<li class="${isCorrect ? "correct" : "incorrect"}">${item} → ${questionInput.inputMatches[item]}</li>`;
			}
			
			html += `</ul></div><div class="answer">Richtige Zuordnungen:<ul>`;
			for (const match in questionInput.correctMatches) {
				html += `<li class="correct">${match} → ${questionInput.correctMatches[match]}</li>`;
			}
			html += `</ul></div>`;
		}
		
		html += `</div>`;
	}
	
	html += `</div></body></html>`;
	return html;
}
