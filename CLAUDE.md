# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 quiz application built for HFU students. The application loads quiz questions from JSON files, displays them in an interactive UI with multiple question types, and emails completed quiz results via SMTP.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run open     # Open utility links (util/open-links.js)
```

## Architecture

### Context Hierarchy

The application uses three React contexts, nested in this order:

1. **QuizProvider** (`src/lib/contexts/quiz-context.tsx`)
   - Global quiz data loaded from `quizzes/` directory
   - Provides `getQuizById()` and `finishQuiz()` (triggers email)

2. **UserProvider** (`src/lib/contexts/user-context.tsx`)
   - User info (name/email) persisted in localStorage

3. **QuestionProvider** (`src/lib/contexts/question-context.tsx`)
   - Scoped to individual quiz sessions
   - Answer state in sessionStorage (survives refreshes)
   - Navigation, flagging, and review mode

### Quiz Data Flow

1. `loadQuizzes()` in `src/lib/load-quizzes.ts` reads `.json` files from `quizzes/` at build time
2. Home page groups quizzes hierarchically by `config.group` path
3. Users navigate through questions using QuestionProvider routing
4. Answers sent via `sendMail()` server action in `src/app/actions.ts`

### Question Types

The application supports 11 question types (defined in `src/lib/types.ts`):

| Type | Key Fields | Component |
|------|------------|-----------|
| True/False | `correctAnswer: boolean` | `true-false-question.tsx` |
| Numeric | `correctAnswer: number`, `tolerance?` | `numeric-question.tsx` |
| Text | `minLength?`, `maxLength?` | `text-question.tsx` |
| Single Choice | `answers[]`, `correctAnswerIndex` | `single-choice-question.tsx` |
| Multiple Choice | `answers[]` with `isCorrect` | `multiple-choice-question.tsx` |
| Ordering | `items[]` with `correctPosition` | `ordering-question.tsx` |
| Matching | `items[]`, `matches[]` with `matchesTo` | `matching-question.tsx` |
| Fill-in-Blank | `blanks[]` with `correctAnswers[]` | `fill-blank-question.tsx` |
| Categorization | `categories[]`, `items[]` with `correctCategory` | `categorization-question.tsx` |
| File Upload | `upload: { accept, maxSizeMB, maxFiles }` | `file-upload-question.tsx` |
| Syntax Error | `code`, `language`, `errorTokens[]` | `syntax-error-question.tsx` |

Type guards in `src/lib/question-helper.ts` determine question type from JSON structure.

### Quiz JSON Format

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "description": "Quiz description",
  "config": { "order": 0, "group": "Category/Subcategory" },
  "questions": [
    {
      "id": "1",
      "question": "Question text (supports {{blank:1}} for fill-blank)",
      "shortQuestion": "Short text for navigation",
      "code": "optional code block",
      "codeLanguage": "javascript"
    }
  ]
}
```

### Route Structure

- `/` - Quiz selection
- `/user` - User info form (`?redirect=` param supported)
- `/[quizId]` - Quiz overview
- `/[quizId]/[questionId]` - Individual question
- `/[quizId]/submit` - Submission confirmation
- `/[quizId]/result` - Completion result

## Configuration

### shadcn/ui

```bash
npx shadcn@latest add <component-name>
```

- Components: `@/lib/components/ui`
- Icons: lucide-react
- Config: `components.json`

### Environment Variables

Required in `.env`:
```
SMTP_HOST=          # SMTP server hostname
SMTP_PORT=          # SMTP port (usually 465)
SMTP_SECURE=        # "true" or "false"
SMTP_USER=          # Email for auth and from/to
SMTP_PASSWORD=      # SMTP password
```

### TypeScript Paths

- `@/*` → `./src/*`

## Key Files

- `src/app/actions.ts` - Server actions including `sendMail()` with HTML/text formatting
- `src/lib/load-quizzes.ts` - Quiz loading with difficulty/time estimation
- `src/lib/question-helper.ts` - Type guards and fill-blank text resolution
- `src/lib/types.ts` - All TypeScript interfaces

## Styling

- Tailwind CSS with CSS variables
- Dark theme by default (next-themes)
- Custom breakpoints: `tiny`, `xxs`
- Custom colors in `globals.css`: `custom-primary`, `custom-secondary`, etc.
