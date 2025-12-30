# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Documents

- **[QUIZ_REDESIGN_SUGGESTIONS.md](./QUIZ_REDESIGN_SUGGESTIONS.md)** - Complete redesign specifications with detailed requirements, layout mockups, and feature descriptions
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Phase-by-phase implementation plan with tasks, acceptance criteria, and timeline

> **Note:** The application is being redesigned. Please refer to the documents above for the new architecture and features being implemented.

## Project Overview

This is a Next.js 15 quiz application built for HFU students. The application loads quiz questions from JSON files, displays them in an interactive UI with multiple question types, and emails completed quiz results via SMTP.

## Development Commands

```bash
# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open utility script (opens links from util/open-links.js)
npm run open
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (quiz selection)
│   ├── user/page.tsx             # User information form
│   ├── actions.ts                # Server actions (email sending)
│   └── [quizId]/                 # Dynamic quiz routes
│       ├── layout.tsx            # Quiz layout with QuestionProvider
│       ├── page.tsx              # Quiz overview
│       ├── [questionId]/page.tsx # Individual question view
│       ├── submit/page.tsx       # Quiz submission confirmation
│       └── result/page.tsx       # Quiz completion result
└── lib/
    ├── types.ts                  # TypeScript type definitions
    ├── load-quizzes.ts           # Server-side quiz loading
    ├── question-helper.ts        # Question type guards and utilities
    ├── utility.ts                # Utility functions (cn, etc.)
    ├── contexts/                 # React Context providers
    │   ├── quiz-context.tsx      # Global quiz state
    │   ├── question-context.tsx  # Question navigation and answers
    │   └── user-context.tsx      # User info (name/email)
    ├── components/
    │   ├── ui/                   # shadcn/ui components
    │   ├── questions/            # Question type components
    │   │   ├── question.tsx      # Main question wrapper
    │   │   ├── true-false-question.tsx
    │   │   ├── numeric-question.tsx
    │   │   ├── text-question.tsx
    │   │   ├── single-choice-question.tsx
    │   │   ├── multiple-choice-question.tsx
    │   │   ├── ordering-question.tsx
    │   │   └── matching-question.tsx
    │   ├── navigation-bar.tsx
    │   ├── footer.tsx
    │   └── code-block.tsx
    └── hooks/
        ├── use-toast.ts
        └── use-mobile.tsx

quizzes/                          # Quiz JSON files
types/                            # Additional type definitions
util/                             # Utility scripts
```

## Architecture

### Context Hierarchy

The application uses three main React contexts:

1. **QuizProvider** (`src/lib/contexts/quiz-context.tsx`)
   - Manages global quiz data loaded from `quizzes/` directory
   - Provides `getQuizById()` to retrieve quiz metadata
   - Handles quiz completion via `finishQuiz()` which triggers email sending

2. **UserProvider** (`src/lib/contexts/user-context.tsx`)
   - Manages user information (name and email) in localStorage
   - Used for personalizing quiz submissions

3. **QuestionProvider** (`src/lib/contexts/question-context.tsx`)
   - Scoped to individual quiz sessions
   - Manages answer state in sessionStorage (survives page refreshes)
   - Provides navigation between questions
   - Tracks completion progress

### Quiz Data Flow

1. **Loading**: `loadQuizzes()` in `src/lib/load-quizzes.ts` reads all `.json` files from the `quizzes/` directory at build time
2. **Rendering**: Home page (`src/app/page.tsx`) displays quizzes grouped hierarchically by `config.group` path
3. **Navigation**: Users navigate through questions using the QuestionProvider's routing logic
4. **Submission**: Answers are collected and sent via the `sendMail()` server action in `src/app/actions.ts`

### Question Types

The application supports 7 question types (see `src/lib/types.ts`):
- True/False
- Numeric (with optional tolerance)
- Text (open-ended)
- Single Choice
- Multiple Choice
- Ordering (drag-and-drop sequence)
- Matching (pair items)

Each type has:
- A TypeScript interface in `types.ts`
- A question component in `src/lib/components/questions/`
- Type guards in `src/lib/question-helper.ts`
- Email formatting logic in `src/app/actions.ts`

### Quiz JSON Format

Quizzes are stored as JSON files in the `quizzes/` directory with this structure:

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "description": "Quiz description",
  "config": {
    "order": 0,
    "group": "Category/Subcategory"
  },
  "questions": [
    {
      "id": "1",
      "question": "Question text",
      "shortQuestion": "Short text for navigation",
      // ... type-specific fields
    }
  ]
}
```

Question type is inferred from the presence of specific fields (e.g., `correctAnswer: boolean` indicates true/false, `answers` array indicates choice questions).

## Configuration

### shadcn/ui

This project uses shadcn/ui components. Configuration is in `components.json`:
- Components are aliased to `@/lib/components`
- UI components are in `@/lib/components/ui`
- Uses Tailwind CSS with CSS variables
- Icon library: lucide-react

To add new shadcn components:
```bash
npx shadcn@latest add <component-name>
```

### Environment Variables

Required in `.env`:
```
SMTP_HOST=          # SMTP server hostname
SMTP_PORT=          # SMTP port (usually 465 for secure)
SMTP_SECURE=        # "true" or "false"
SMTP_USER=          # Email address for authentication and from/to
SMTP_PASSWORD=      # SMTP password
```

### TypeScript Paths

Path aliases configured in `tsconfig.json`:
- `@/*` → `./src/*`

## Key Implementation Details

### Email Submission

Quiz results are emailed when a user completes a quiz:
- Server action: `sendMail()` in `src/app/actions.ts`
- Sends both plain text and HTML formatted results
- Recipients: user's email (if provided) and `SMTP_USER`
- Includes all answers with correctness indicators (color-coded in HTML)

### Session Storage

The QuestionProvider uses sessionStorage to persist answers during a quiz session:
- Storage key: `"quiz-answers"` (customizable)
- Cleared when quiz is completed
- Allows users to refresh without losing progress

### Route Structure

Dynamic routes use Next.js App Router:
- `/` - Quiz selection
- `/user` - User info form (with `?redirect=` query param)
- `/[quizId]` - Quiz overview
- `/[quizId]/[questionId]` - Individual question
- `/[quizId]/submit` - Confirmation before submission
- `/[quizId]/result` - Completion message

### Styling

- Tailwind CSS with custom CSS variables
- Dark theme by default (next-themes)
- Responsive breakpoints including custom `tiny` and `xxs` sizes
- Custom colors defined in `globals.css` (custom-primary, custom-secondary, etc.)
