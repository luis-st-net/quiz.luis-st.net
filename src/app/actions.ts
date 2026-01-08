"use server";

import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { CategorizationQuestionInput, FillBlankQuestionInput, FileUploadQuestionInput, MatchingQuestionInput, MultipleChoiceQuestionInput, NumericQuestionInput, OrderingQuestionInput, QuestionInput, SingleChoiceQuestionInput, SyntaxErrorQuestionInput, TextQuestionInput, TrueFalseQuestionInput } from "@/lib/types";
import { isFillBlankAnswerCorrect, resolveFillBlankText } from "@/lib/question-helper";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

function escapeHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, "<br/>");
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	if (mins >= 60) {
		const hours = Math.floor(mins / 60);
		const remainingMins = mins % 60;
		return `${hours}h ${remainingMins}m ${secs}s`;
	}
	return `${mins}m ${secs}s`;
}

function checkAnswer(input: QuestionInput): boolean | null {
	switch (input.type) {
		case "true-false": {
			const tf = input as TrueFalseQuestionInput;
			return tf.inputAnswer === tf.correctAnswer;
		}
		case "numeric": {
			const num = input as NumericQuestionInput;
			if (num.tolerance) {
				return Math.abs(num.inputAnswer - num.correctAnswer) <= num.tolerance;
			}
			return num.inputAnswer === num.correctAnswer;
		}
		case "single-choice": {
			const sc = input as SingleChoiceQuestionInput;
			return sc.inputAnswer === sc.correctAnswerIndex;
		}
		case "multiple-choice": {
			const mc = input as MultipleChoiceQuestionInput;
			const correctIndices = mc.answers
				.map((a, i) => (a.isCorrect ? i : -1))
				.filter((i) => i >= 0);
			return (
				mc.inputAnswer.length === correctIndices.length &&
				mc.inputAnswer.every((i) => correctIndices.includes(i))
			);
		}
		case "ordering": {
			const ord = input as OrderingQuestionInput;
			return ord.inputAnswer.every(
				(itemIndex, position) =>
					ord.items[itemIndex] === ord.correctAnswerOrder[position]
			);
		}
		case "matching": {
			const match = input as MatchingQuestionInput;
			return Object.entries(match.inputMatches).every(
				([item, m]) => match.correctMatches[item] === m
			);
		}
		case "fill-blank": {
			const fb = input as FillBlankQuestionInput;
			return fb.blanks.every(blank => {
				const userAnswer = fb.inputAnswers[blank.id] || "";
				return blank.correctAnswers.some(correct => {
					if (blank.caseSensitive) {
						return userAnswer === correct;
					}
					return userAnswer.toLowerCase() === correct.toLowerCase();
				});
			});
		}
		case "categorization": {
			const cat = input as CategorizationQuestionInput;
			return cat.items.every(item => {
				const userCategoryId = cat.inputCategories[item.text];
				return userCategoryId === item.correctCategory;
			});
		}
		case "syntax-error": {
			const se = input as SyntaxErrorQuestionInput;
			if (se.selectedTokens.length !== se.errorTokens.length) return false;
			return se.errorTokens.every(error =>
				se.selectedTokens.some(selected =>
					selected.line === error.line && selected.token === error.token
				)
			);
		}
		case "text":
		case "file-upload":
			return null;
		default:
			return null;
	}
}

function calculateScore(answers: Record<string, QuestionInput>, totalQuestions: number) {
	let correct = 0;
	let incorrect = 0;
	let manual = 0;

	for (const answer of Object.values(answers)) {
		const isCorrect = checkAnswer(answer);
		if (isCorrect === true) correct++;
		else if (isCorrect === false) incorrect++;
		else if (isCorrect === null) manual++;
	}

	const autoGradableTotal = totalQuestions - manual;
	const percentage = autoGradableTotal > 0 ? Math.round((correct / autoGradableTotal) * 100) : 0;

	return { correct, incorrect, manual, total: totalQuestions, percentage };
}

function collectAttachments(answers: Record<string, QuestionInput>): Mail.Attachment[] {
	const attachments: Mail.Attachment[] = [];
	let fileIndex = 1;

	Object.entries(answers).forEach(([questionId, input]) => {
		if (input.type === "file-upload") {
			const fileUpload = input as FileUploadQuestionInput;
			fileUpload.files.forEach((file) => {
				attachments.push({
					filename: `Q${questionId}_${fileIndex}_${file.name}`,
					content: file.data,
					encoding: "base64",
					contentType: file.type,
				});
				fileIndex++;
			});
		}
	});

	return attachments;
}

export async function sendMail(name: string | undefined, mail: string | undefined, quiz: string, answers: Record<string, QuestionInput>, elapsedTime: number = 0) {
	if (!name) {
		name = "Anonymous";
	}
	const safeName = escapeHtml(name);
	const safeQuiz = escapeHtml(quiz);

	const totalQuestions = Object.keys(answers).length;
	const score = calculateScore(answers, totalQuestions);

	console.log("Sending mail for quiz", quiz, "by", name);
	try {
		const text = getText(name, quiz, answers, elapsedTime, score);
		const html = getHtml(safeName, safeQuiz, answers, elapsedTime, score);
		const attachments = collectAttachments(answers);

		const recipients = mail ? [mail, process.env.SMTP_USER as string] : [process.env.SMTP_USER as string];

		const mailOptions: Mail.Options = {
			from: process.env.SMTP_USER,
			to: recipients,
			subject: `Quiz ${quiz} abgeschlossen von ${name} (${score.percentage}%)`,
			text: text,
			html: html,
			attachments: attachments,
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

type Score = { correct: number; incorrect: number; manual: number; total: number; percentage: number };

function getText(name: string, quiz: string, answers: Record<string, QuestionInput>, elapsedTime: number, score: Score) {
	const lines: string[] = [
		"=".repeat(60),
		`QUIZ ERGEBNISSE: ${quiz}`,
		"=".repeat(60),
		"",
		`Teilnehmer: ${name}`,
		`Datum: ${new Date().toLocaleDateString("de-DE")} ${new Date().toLocaleTimeString("de-DE")}`,
		`Dauer: ${formatTime(elapsedTime)}`,
		"",
		"-".repeat(60),
		"ZUSAMMENFASSUNG",
		"-".repeat(60),
		`Ergebnis: ${score.percentage}% (${score.correct}/${score.total})`,
		`Richtig: ${score.correct}`,
		`Falsch: ${score.incorrect}`,
		`Manuell zu bewerten: ${score.manual}`,
		"",
		"-".repeat(60),
		"DETAILLIERTE ERGEBNISSE",
		"-".repeat(60),
		"",
	];

	Object.entries(answers).forEach(([, input], index) => {
		const isCorrect = checkAnswer(input);
		const status = isCorrect === true ? "[RICHTIG]" : isCorrect === false ? "[FALSCH]" : "[MANUELL]";

		lines.push(`Frage ${index + 1} ${status}`);
		// Resolve fill-blank patterns in question text
		let questionText = input.question;
		if (input.type === "fill-blank") {
			const fb = input as FillBlankQuestionInput;
			questionText = resolveFillBlankText(fb.question, fb.inputAnswers, fb.blanks, {
				formatAnswer: (answer, blank, correct) => `[${answer}${correct ? " ✓" : " ✗"}]`
			});
		}
		lines.push(`Frage: ${questionText}`);
		lines.push("");

		switch (input.type) {
			case "true-false": {
				const tf = input as TrueFalseQuestionInput;
				lines.push(`Ihre Antwort: ${tf.inputAnswer ? "Wahr" : "Falsch"}`);
				if (tf.inputAnswer !== tf.correctAnswer) {
					lines.push(`Richtige Antwort: ${tf.correctAnswer ? "Wahr" : "Falsch"}`);
				}
				break;
			}
			case "numeric": {
				const num = input as NumericQuestionInput;
				lines.push(`Ihre Antwort: ${num.inputAnswer}`);
				const numCorrect = num.tolerance
					? Math.abs(num.inputAnswer - num.correctAnswer) <= num.tolerance
					: num.inputAnswer === num.correctAnswer;
				if (!numCorrect) {
					lines.push(`Richtige Antwort: ${num.correctAnswer}${num.tolerance ? ` (±${num.tolerance})` : ""}`);
				}
				break;
			}
			case "text": {
				const text = input as TextQuestionInput;
				lines.push(`Ihre Antwort: ${text.inputAnswer || "(Keine Antwort)"}`);
				break;
			}
			case "single-choice": {
				const sc = input as SingleChoiceQuestionInput;
				lines.push(`Ihre Antwort: ${sc.answers[sc.inputAnswer]}`);
				if (sc.inputAnswer !== sc.correctAnswerIndex) {
					lines.push(`Richtige Antwort: ${sc.answers[sc.correctAnswerIndex]}`);
				}
				break;
			}
			case "multiple-choice": {
				const mc = input as MultipleChoiceQuestionInput;
				lines.push("Ihre Auswahl:");
				mc.inputAnswer.forEach((idx) => {
					const marker = mc.answers[idx].isCorrect ? "  ✓" : "  ✗";
					lines.push(`${marker} ${mc.answers[idx].answer}`);
				});
				lines.push("Richtige Antworten:");
				mc.answers.filter((a) => a.isCorrect).forEach((a) => {
					lines.push(`  • ${a.answer}`);
				});
				break;
			}
			case "ordering": {
				const ord = input as OrderingQuestionInput;
				lines.push("Ihre Reihenfolge:");
				ord.inputAnswer.forEach((itemIndex, position) => {
					const item = ord.items[itemIndex];
					const marker = item === ord.correctAnswerOrder[position] ? "✓" : "✗";
					lines.push(`  ${position + 1}. ${marker} ${item}`);
				});
				lines.push("Richtige Reihenfolge:");
				ord.correctAnswerOrder.forEach((item, i) => {
					lines.push(`  ${i + 1}. ${item}`);
				});
				break;
			}
			case "matching": {
				const match = input as MatchingQuestionInput;
				lines.push("Ihre Zuordnungen:");
				Object.entries(match.inputMatches).forEach(([item, m]) => {
					const marker = match.correctMatches[item] === m ? "✓" : "✗";
					lines.push(`  ${marker} ${item} → ${m}`);
				});
				lines.push("Richtige Zuordnungen:");
				Object.entries(match.correctMatches).forEach(([item, m]) => {
					lines.push(`  • ${item} → ${m}`);
				});
				break;
			}
			case "fill-blank": {
				const fb = input as FillBlankQuestionInput;
				lines.push("Ihre Antworten:");
				fb.blanks.forEach(blank => {
					const userAnswer = fb.inputAnswers[blank.id] || "(Keine Antwort)";
					const isCorrect = blank.correctAnswers.some(correct =>
						blank.caseSensitive ? userAnswer === correct : userAnswer.toLowerCase() === correct.toLowerCase()
					);
					const marker = isCorrect ? "✓" : "✗";
					lines.push(`  ${marker} Lücke ${blank.id}: ${userAnswer}`);
					if (!isCorrect) {
						lines.push(`    Richtig: ${blank.correctAnswers.join(" oder ")}`);
					}
				});
				break;
			}
			case "categorization": {
				const cat = input as CategorizationQuestionInput;
				lines.push("Ihre Kategorisierung:");
				cat.items.forEach(item => {
					const userCategoryId = cat.inputCategories[item.text];
					const userCategory = cat.categories.find(c => c.id === userCategoryId)?.name || "(Keine)";
					const correctCategory = cat.categories.find(c => c.id === item.correctCategory)?.name || "";
					const marker = userCategoryId === item.correctCategory ? "✓" : "✗";
					lines.push(`  ${marker} ${item.text} → ${userCategory}`);
					if (userCategoryId !== item.correctCategory) {
						lines.push(`    Richtig: ${correctCategory}`);
					}
				});
				break;
			}
			case "file-upload": {
				const fu = input as FileUploadQuestionInput;
				lines.push(`Hochgeladene Dateien: ${fu.files.length}`);
				fu.files.forEach((file, i) => {
					lines.push(`  ${i + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
				});
				lines.push("(Dateien als Anhang beigefügt)");
				break;
			}
			case "syntax-error": {
				const se = input as SyntaxErrorQuestionInput;
				lines.push("Ihre ausgewählten Fehler:");
				se.selectedTokens.forEach(token => {
					const isCorrect = se.errorTokens.some(e => e.line === token.line && e.token === token.token);
					const marker = isCorrect ? "✓" : "✗";
					lines.push(`  ${marker} Zeile ${token.line}: "${token.token}"`);
				});
				lines.push("Tatsächliche Fehler:");
				se.errorTokens.forEach(error => {
					lines.push(`  • Zeile ${error.line}: "${error.token}"${error.explanation ? ` - ${error.explanation}` : ""}`);
				});
				break;
			}
		}

		lines.push("");
		lines.push("-".repeat(40));
		lines.push("");
	});

	lines.push("=".repeat(60));
	lines.push("Ende der Ergebnisse");
	lines.push("=".repeat(60));

	return lines.join("\n");
}

function getHtml(name: string, quiz: string, answers: Record<string, QuestionInput>, elapsedTime: number, score: Score) {
	// Email-safe inline styles
	const styles = {
		body: "margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6;",
		container: "max-width: 640px; margin: 0 auto; padding: 24px;",
		card: "background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; overflow: hidden;",
		cardHeader: "padding: 24px 24px 16px; text-align: center;",
		cardContent: "padding: 0 24px 24px;",
		title: "margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1f2937;",
		subtitle: "margin: 0; font-size: 14px; color: #6b7280;",
		// Score circle
		scoreCircle: "width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; flex-direction: column;",
		scorePercentage: "font-size: 32px; font-weight: 700; margin: 0;",
		scoreDetail: "font-size: 14px; color: #6b7280; margin: 0;",
		// Stats grid
		statsGrid: "display: flex; gap: 12px; margin-top: 16px;",
		statBox: "flex: 1; padding: 16px; border-radius: 8px; text-align: center;",
		statNumber: "font-size: 24px; font-weight: 700; margin: 0;",
		statLabel: "font-size: 12px; margin: 4px 0 0; opacity: 0.8;",
		// Question card
		questionCard: "background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px;",
		questionHeader: "display: flex; align-items: flex-start; gap: 12px;",
		statusIcon: "width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;",
		questionNumber: "font-weight: 600; margin: 0 8px 0 0;",
		badge: "display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; border: 1px solid;",
		questionText: "color: #6b7280; font-size: 14px; margin: 8px 0 12px 40px;",
		answerSection: "margin-left: 40px; font-size: 14px;",
		// Colors
		greenBg: "background-color: #dcfce7;",
		greenText: "color: #16a34a;",
		greenBorder: "border-color: #86efac;",
		redBg: "background-color: #fee2e2;",
		redText: "color: #dc2626;",
		redBorder: "border-color: #fca5a5;",
		amberBg: "background-color: #fef3c7;",
		amberText: "color: #d97706;",
		amberBorder: "border-color: #fcd34d;",
		mutedText: "color: #6b7280;",
	};

	// Determine score color
	const getScoreColor = () => {
		if (score.percentage >= 80) return { bg: "#dcfce7", text: "#16a34a", border: "#86efac" };
		if (score.percentage >= 50) return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
		return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
	};
	const scoreColor = getScoreColor();

	let html = `<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Quiz Ergebnisse - ${quiz}</title>
</head>
<body style="${styles.body}">
<div style="${styles.container}">
	<!-- Header Card with Score -->
	<div style="${styles.card}">
		<div style="${styles.cardHeader}">
			<!-- Score Circle -->
			<div style="${styles.scoreCircle} background-color: ${scoreColor.bg}; border: 4px solid ${scoreColor.border};">
				<p style="${styles.scorePercentage} color: ${scoreColor.text};">${score.percentage}%</p>
				<p style="${styles.scoreDetail}">${score.correct}/${score.total}</p>
			</div>

			<h1 style="${styles.title}">Quiz abgeschlossen</h1>
			<p style="${styles.subtitle}">${quiz}</p>
			<p style="${styles.subtitle}">von ${name}</p>
		</div>

		<div style="${styles.cardContent}">
			<!-- Info Row -->
			<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">
				<tr>
					<td>${new Date().toLocaleDateString("de-DE")}</td>
					<td style="text-align: right;">⏱️ ${formatTime(elapsedTime)}</td>
				</tr>
			</table>

			<!-- Stats Grid -->
			<table width="100%" cellpadding="0" cellspacing="8">
				<tr>
					<td style="width: 33%; ${styles.statBox} ${styles.greenBg}">
						<p style="${styles.statNumber} ${styles.greenText}">${score.correct}</p>
						<p style="${styles.statLabel} ${styles.greenText}">Richtig</p>
					</td>
					<td style="width: 33%; ${styles.statBox} ${styles.redBg}">
						<p style="${styles.statNumber} ${styles.redText}">${score.incorrect}</p>
						<p style="${styles.statLabel} ${styles.redText}">Falsch</p>
					</td>
					<td style="width: 33%; ${styles.statBox} ${styles.amberBg}">
						<p style="${styles.statNumber} ${styles.amberText}">${score.manual}</p>
						<p style="${styles.statLabel} ${styles.amberText}">Manuell</p>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<!-- Results Header -->
	<div style="${styles.card}">
		<div style="padding: 16px 24px; border-bottom: 1px solid #e5e7eb;">
			<h2 style="margin: 0; font-size: 18px; font-weight: 600;">Detaillierte Ergebnisse</h2>
		</div>
		<div style="padding: 16px 24px;">`;

	// Generate question results
	Object.entries(answers).forEach(([, input], index) => {
		const isCorrect = checkAnswer(input);

		// Status styling
		let statusBg: string, statusText: string, statusBorder: string, statusIcon: string, statusLabel: string;
		if (isCorrect === true) {
			statusBg = "#dcfce7"; statusText = "#16a34a"; statusBorder = "#86efac"; statusIcon = "✓"; statusLabel = "Richtig";
		} else if (isCorrect === false) {
			statusBg = "#fee2e2"; statusText = "#dc2626"; statusBorder = "#fca5a5"; statusIcon = "✗"; statusLabel = "Falsch";
		} else {
			statusBg = "#fef3c7"; statusText = "#d97706"; statusBorder = "#fcd34d"; statusIcon = "−"; statusLabel = "Manuell";
		}

		// Resolve fill-blank patterns in question text for HTML display
		let questionTextHtml = escapeHtml(input.question);
		if (input.type === "fill-blank") {
			const fb = input as FillBlankQuestionInput;
			questionTextHtml = resolveFillBlankText(fb.question, fb.inputAnswers, fb.blanks, {
				formatAnswer: (answer, blank, correct) => {
					const color = correct ? "#16a34a" : "#dc2626";
					const escapedAnswer = escapeHtml(answer);
					return `<strong style="color: ${color}; text-decoration: underline;">${escapedAnswer}</strong>`;
				}
			});
		}

		html += `
			<div style="${styles.questionCard}">
				<div style="${styles.questionHeader}">
					<div style="${styles.statusIcon} background-color: ${statusBg}; color: ${statusText};">${statusIcon}</div>
					<div style="flex: 1;">
						<span style="${styles.questionNumber}">Frage ${index + 1}</span>
						<span style="${styles.badge} background-color: ${statusBg}; color: ${statusText}; border-color: ${statusBorder};">${statusLabel}</span>
					</div>
				</div>
				<p style="${styles.questionText}">${questionTextHtml}</p>
				<div style="${styles.answerSection}">`;

		// Generate answer content based on type
		switch (input.type) {
			case "true-false": {
				const tf = input as TrueFalseQuestionInput;
				const tfCorrect = tf.inputAnswer === tf.correctAnswer;
				html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Ihre Antwort: </span><strong style="color: ${tfCorrect ? "#16a34a" : "#dc2626"};">${tf.inputAnswer ? "Wahr" : "Falsch"}</strong></p>`;
				if (!tfCorrect) {
					html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Richtige Antwort: </span><strong style="color: #16a34a;">${tf.correctAnswer ? "Wahr" : "Falsch"}</strong></p>`;
				}
				break;
			}
			case "numeric": {
				const num = input as NumericQuestionInput;
				const numCorrect = num.tolerance
					? Math.abs(num.inputAnswer - num.correctAnswer) <= num.tolerance
					: num.inputAnswer === num.correctAnswer;
				html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Ihre Antwort: </span><strong style="color: ${numCorrect ? "#16a34a" : "#dc2626"};">${num.inputAnswer}</strong></p>`;
				if (!numCorrect) {
					html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Richtige Antwort: </span><strong style="color: #16a34a;">${num.correctAnswer}${num.tolerance ? ` (±${num.tolerance})` : ""}</strong></p>`;
				}
				break;
			}
			case "text": {
				const text = input as TextQuestionInput;
				html += `<p style="margin: 4px 0; ${styles.mutedText}">Ihre Antwort:</p>`;
				html += `<p style="margin: 4px 0; padding: 8px; background: #fef3c7; border-radius: 4px; color: #d97706;">${escapeHtml(text.inputAnswer) || "(Keine Antwort)"}</p>`;
				break;
			}
			case "single-choice": {
				const sc = input as SingleChoiceQuestionInput;
				const scCorrect = sc.inputAnswer === sc.correctAnswerIndex;
				html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Ihre Antwort: </span><strong style="color: ${scCorrect ? "#16a34a" : "#dc2626"};">${escapeHtml(sc.answers[sc.inputAnswer])}</strong></p>`;
				if (!scCorrect) {
					html += `<p style="margin: 4px 0;"><span style="${styles.mutedText}">Richtige Antwort: </span><strong style="color: #16a34a;">${escapeHtml(sc.answers[sc.correctAnswerIndex])}</strong></p>`;
				}
				break;
			}
			case "multiple-choice": {
				const mc = input as MultipleChoiceQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre Auswahl:</p><ul style="margin: 0; padding-left: 20px;">`;
				mc.inputAnswer.forEach((idx) => {
					const mcItemCorrect = mc.answers[idx].isCorrect;
					html += `<li style="color: ${mcItemCorrect ? "#16a34a" : "#dc2626"};">${escapeHtml(mc.answers[idx].answer)}</li>`;
				});
				html += `</ul><p style="margin: 8px 0 4px; ${styles.mutedText}">Richtige Antworten:</p><ul style="margin: 0; padding-left: 20px;">`;
				mc.answers.filter((a) => a.isCorrect).forEach((a) => {
					html += `<li style="color: #16a34a;">${escapeHtml(a.answer)}</li>`;
				});
				html += `</ul>`;
				break;
			}
			case "ordering": {
				const ord = input as OrderingQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre Reihenfolge:</p><ol style="margin: 0; padding-left: 20px;">`;
				ord.inputAnswer.forEach((itemIndex, position) => {
					const item = ord.items[itemIndex];
					const ordItemCorrect = item === ord.correctAnswerOrder[position];
					html += `<li style="color: ${ordItemCorrect ? "#16a34a" : "#dc2626"};">${escapeHtml(item)}</li>`;
				});
				html += `</ol><p style="margin: 8px 0 4px; ${styles.mutedText}">Richtige Reihenfolge:</p><ol style="margin: 0; padding-left: 20px;">`;
				ord.correctAnswerOrder.forEach((item) => {
					html += `<li style="color: #16a34a;">${escapeHtml(item)}</li>`;
				});
				html += `</ol>`;
				break;
			}
			case "matching": {
				const match = input as MatchingQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre Zuordnungen:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				Object.entries(match.inputMatches).forEach(([item, m]) => {
					const matchItemCorrect = match.correctMatches[item] === m;
					html += `<li style="color: ${matchItemCorrect ? "#16a34a" : "#dc2626"};">${escapeHtml(item)} → ${escapeHtml(m as string)}</li>`;
				});
				html += `</ul><p style="margin: 8px 0 4px; ${styles.mutedText}">Richtige Zuordnungen:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				Object.entries(match.correctMatches).forEach(([item, m]) => {
					html += `<li style="color: #16a34a;">${escapeHtml(item)} → ${escapeHtml(m)}</li>`;
				});
				html += `</ul>`;
				break;
			}
			case "fill-blank": {
				const fb = input as FillBlankQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre Antworten:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				fb.blanks.forEach(blank => {
					const userAnswer = fb.inputAnswers[blank.id] || "(Keine Antwort)";
					const fbCorrect = blank.correctAnswers.some(correct =>
						blank.caseSensitive ? userAnswer === correct : userAnswer.toLowerCase() === correct.toLowerCase()
					);
					html += `<li style="color: ${fbCorrect ? "#16a34a" : "#dc2626"};">Lücke ${blank.id}: ${escapeHtml(userAnswer)}</li>`;
					if (!fbCorrect) {
						html += `<li style="color: #16a34a; margin-left: 20px;">Richtig: ${escapeHtml(blank.correctAnswers.join(" oder "))}</li>`;
					}
				});
				html += `</ul>`;
				break;
			}
			case "categorization": {
				const cat = input as CategorizationQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre Kategorisierung:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				cat.items.forEach(item => {
					const userCategoryId = cat.inputCategories[item.text];
					const userCategory = cat.categories.find(c => c.id === userCategoryId)?.name || "(Keine)";
					const correctCategory = cat.categories.find(c => c.id === item.correctCategory)?.name || "";
					const catCorrect = userCategoryId === item.correctCategory;
					html += `<li style="color: ${catCorrect ? "#16a34a" : "#dc2626"};">${escapeHtml(item.text)} → ${escapeHtml(userCategory)}</li>`;
					if (!catCorrect) {
						html += `<li style="color: #16a34a; margin-left: 20px;">Richtig: ${escapeHtml(correctCategory)}</li>`;
					}
				});
				html += `</ul>`;
				break;
			}
			case "file-upload": {
				const fu = input as FileUploadQuestionInput;
				html += `<p style="margin: 4px 0; ${styles.mutedText}">Hochgeladene Dateien: ${fu.files.length}</p>`;
				html += `<ul style="margin: 0; padding-left: 20px;">`;
				fu.files.forEach((file) => {
					html += `<li style="color: #d97706;">${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)</li>`;
				});
				html += `</ul>`;
				html += `<p style="margin: 4px 0; padding: 8px; background: #fef3c7; border-radius: 4px; color: #d97706; font-size: 12px;">📎 Dateien als Anhang beigefügt</p>`;
				break;
			}
			case "syntax-error": {
				const se = input as SyntaxErrorQuestionInput;
				html += `<p style="margin: 8px 0 4px; ${styles.mutedText}">Ihre ausgewählten Fehler:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				se.selectedTokens.forEach(token => {
					const seCorrect = se.errorTokens.some(e => e.line === token.line && e.token === token.token);
					html += `<li style="color: ${seCorrect ? "#16a34a" : "#dc2626"};">Zeile ${token.line}: <code>"${escapeHtml(token.token)}"</code></li>`;
				});
				html += `</ul><p style="margin: 8px 0 4px; ${styles.mutedText}">Tatsächliche Fehler:</p><ul style="margin: 0; padding-left: 20px; list-style: none;">`;
				se.errorTokens.forEach(error => {
					html += `<li style="color: #16a34a;">Zeile ${error.line}: <code>"${escapeHtml(error.token)}"</code>${error.explanation ? ` - ${escapeHtml(error.explanation)}` : ""}</li>`;
				});
				html += `</ul>`;
				break;
			}
		}

		html += `
				</div>
			</div>`;
	});

	html += `
		</div>
	</div>

	<!-- Footer -->
	<div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
		<p style="margin: 0;">Diese E-Mail wurde automatisch generiert.</p>
	</div>
</div>
</body>
</html>`;

	return html;
}
