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

export async function sendMail(name: string, mail: string, quiz: string, answers: Record<string, QuestionInput>) {
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
			subject: "Quiz " + quiz + " completed by " + name,
			text: text,
			html: html,
		};
		
		await transporter.sendMail(mailOptions);
		
		return {
			success: true,
			message: "Quiz was submitted successfully",
		}
	} catch (e) {
		return {
			success: false,
			message: "Error occurred while submitting the quiz",
		}
	}
}

function getText(name: string, quiz: string, answers: Record<string, QuestionInput>) {
	let text = `Quiz ${quiz} completed by ${name}\n\n`;
	
	for (const key in answers) {
		const question = answers[key];
		text += `Question: ${question.question}\n`;
		
		if (question.type === "true-false") {
			const questionInput = question as TrueFalseQuestionInput;
			
			text += `Answer: ${questionInput.inputAnswer ? "True" : "False"}\n`;
			text += `Correct Answer: ${questionInput.correctAnswer ? "True" : "False"}\n`;
			
		} else if (question.type === "numeric") {
			const questionInput = question as NumericQuestionInput;
			
			text += `Answer: ${questionInput.inputAnswer}\n`;
			text += `Correct Answer: ${questionInput.correctAnswer}`;
			if (questionInput.tolerance) {
				text += ` (±${questionInput.tolerance})`;
			}
			text += "\n";
			
		} else if (question.type === "text") {
			const questionInput = question as TextQuestionInput;
			text += `Answer: ${questionInput.inputAnswer}\n`;
			
		} else if (question.type === "single-choice") {
			const questionInput = question as SingleChoiceQuestionInput;
			
			text += `Answer: ${questionInput.answers[questionInput.inputAnswer]}\n`;
			text += `Correct Answer: ${questionInput.answers[questionInput.correctAnswerIndex]}\n`;
			
		} else if (question.type === "multiple-choice") {
			const questionInput = question as MultipleChoiceQuestionInput;
			
			text += "Selected Answers:\n";
			questionInput.inputAnswer.forEach(index => {
				text += `- ${questionInput.answers[index].answer}\n`;
			});
			
			text += "Correct Answers:\n";
			questionInput.answers.forEach((answer) => {
				if (answer.isCorrect) {
					text += `- ${answer.answer}\n`;
				}
			});
			
		} else if (question.type === "ordering") {
			const questionInput = question as OrderingQuestionInput;
			
			text += "Your Order:\n";
			questionInput.inputAnswer.forEach((itemIndex, index) => {
				text += `${index + 1}. ${questionInput.items[itemIndex]}\n`;
			});
			
			text += "Correct Order:\n";
			questionInput.correctAnswerOrder.forEach((item, index) => {
				text += `${index + 1}. ${item}\n`;
			});
			
		} else if (question.type === "matching") {
			const questionInput = question as MatchingQuestionInput;
			text += "Your Matches:\n";
			
			for (const item in questionInput.inputMatches) {
				text += `- ${item} → ${questionInput.inputMatches[item]}\n`;
			}
			
			text += "Correct Matches:\n";
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
    <html lang="en">
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
        .divider { height: 1px; background: #eee; margin: 15px 0; }
      </style>
    </head>
    <body>
    <div class="container"><h1>Quiz ${quiz} completed by ${name}</h1>`;
	
	for (const key in answers) {
		const question = answers[key];
		html += `<div class="question"> <div class="question-text">${question.question}</div>`;
		
		if (question.type === "true-false") {
			const questionInput = question as TrueFalseQuestionInput;
			
			html += `<div class="answer">Your answer: <span class="${questionInput.inputAnswer === questionInput.correctAnswer ? "correct" : "incorrect"}">${questionInput.inputAnswer ? "True" : "False"}</span></div>`;
			html += `<div class="answer correct">Correct answer: ${questionInput.correctAnswer ? "True" : "False"}</div>`;
			
		} else if (question.type === "numeric") {
			const questionInput = question as NumericQuestionInput;
			const isCorrect = questionInput.tolerance ? Math.abs(questionInput.inputAnswer - questionInput.correctAnswer) <= questionInput.tolerance : questionInput.inputAnswer === questionInput.correctAnswer;
			
			html += `<div class="answer">Your answer: <span class="${isCorrect ? "correct" : "incorrect"}">${questionInput.inputAnswer}</span></div>`;
			html += `<div class="answer correct">Correct answer: ${questionInput.correctAnswer}`;
			if (questionInput.tolerance) {
				html += ` (±${questionInput.tolerance})`;
			}
			html += `</div>`;
			
		} else if (question.type === "text") {
			const questionInput = question as TextQuestionInput;
			
			const answer = questionInput.inputAnswer.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
			html += `<div class="answer">Answer: ${answer}</div>`;
			
		} else if (question.type === "single-choice") {
			const questionInput = question as SingleChoiceQuestionInput;
			
			html += `<div class="answer">Your answer: <span class="${questionInput.inputAnswer === questionInput.correctAnswerIndex ? "correct" : "incorrect"}">${questionInput.answers[questionInput.inputAnswer]}</span></div>`;
			html += `<div class="answer correct">Correct answer: ${questionInput.answers[questionInput.correctAnswerIndex]}</div>`;
			
		} else if (question.type === "multiple-choice") {
			const questionInput = question as MultipleChoiceQuestionInput;
			
			html += `<div class="answer">Your answers:<ul>`;
			questionInput.inputAnswer.forEach(index => {
				const isCorrect = questionInput.answers[index].isCorrect;
				html += `<li class="${isCorrect ? "correct" : "incorrect"}">${questionInput.answers[index].answer}</li>`;
			});
			
			html += `</ul></div><div class="answer correct">Correct answers:<ul>`;
			questionInput.answers.forEach((answer) => {
				if (answer.isCorrect) {
					html += `<li>${answer.answer}</li>`;
				}
			});
			html += `</ul></div>`;
		} else if (question.type === "ordering") {
			const questionInput = question as OrderingQuestionInput;
			
			html += `<div class="answer">Your order:<ol>`;
			questionInput.inputAnswer.forEach(itemIndex => {
				html += `<li>${questionInput.items[itemIndex]}</li>`;
			});
			
			html += `</ol></div><div class="answer correct">Correct order:<ol>`;
			questionInput.correctAnswerOrder.forEach(item => {
				html += `<li>${item}</li>`;
			});
			html += `</ol></div>`;
			
		} else if (question.type === "matching") {
			const questionInput = question as MatchingQuestionInput;
			
			html += `<div class="answer">Your matches:<ul>`;
			for (const item in questionInput.inputMatches) {
				html += `<li>${item} → ${questionInput.inputMatches[item]}</li>`;
			}
			
			html += `</ul></div><div class="answer correct">Correct matches:<ul>`;
			for (const match in questionInput.correctMatches) {
				html += `<li>${match} → ${questionInput.correctMatches[match]}</li>`;
			}
			html += `</ul></div>`;
		}
		
		html += `</div>`;
	}
	
	html += `</div></body></html>`;
	return html;
}
