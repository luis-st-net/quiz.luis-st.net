# Quiz Website Redesign - Implementation Plan

> **Reference:** See [QUIZ_REDESIGN_SUGGESTIONS.md](./QUIZ_REDESIGN_SUGGESTIONS.md) for detailed specifications and design decisions.

## Overview

This plan outlines the step-by-step implementation of the quiz website redesign. Each phase builds upon the previous one, allowing for incremental development while keeping the application functional.

---

## Phase 1: Foundation & Layout Restructure
**Goal:** Create the new home page layout with sidebar navigation
**Reference:** Section 2.1 in QUIZ_REDESIGN_SUGGESTIONS.md

### 1.1 Create New Components Structure
- [ ] Create `src/lib/components/quiz/` directory
- [ ] Create `src/lib/components/quiz/quiz-sidebar.tsx`
  - Collapsible category groups
  - Quiz list items
  - Active quiz highlighting
  - Click handlers for quiz selection
- [ ] Create `src/lib/components/quiz/quiz-info-card.tsx`
  - Quiz metadata display (questions, time, difficulty)
  - Start button
  - Empty state when no quiz selected
- [ ] Update or remove `src/lib/components/content-pane.tsx`
  - Keep only for specific use cases
  - Not for general card layout

**Acceptance Criteria:**
- Sidebar displays all quizzes in collapsible groups
- Clicking quiz shows info in center panel
- Start button appears when quiz selected
- Responsive layout (sidebar becomes drawer on mobile)

---

### 1.2 Update Home Page
- [ ] Modify `src/app/page.tsx`
  - Replace center quiz list with two-column layout
  - Left: Quiz sidebar (30% width)
  - Right: Quiz info card (70% width)
  - Mobile: Drawer for sidebar
- [ ] Add quiz selection state to QuizContext
  ```typescript
  // In src/lib/contexts/quiz-context.tsx
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  ```
- [ ] Wire up sidebar to quiz info card
- [ ] Handle "Start Quiz" button click
  - Check if user info needed (name/email)
  - If yes, show user form modal or inline
  - If no, navigate to quiz interface

**Acceptance Criteria:**
- Home page shows sidebar + info layout
- Selecting quiz updates center panel
- Start button navigates to quiz
- User info collected if needed
- Mobile-friendly drawer implementation

---

### 1.3 User Info Integration
- [ ] Convert `src/app/user/page.tsx` to modal/dialog component
  - Use shadcn Dialog component
  - Make it a component instead of page route
- [ ] Create `src/lib/components/quiz/user-info-dialog.tsx`
  - Same form fields as current user page
  - Opens as modal before starting quiz
  - Only shows if name not already set
- [ ] Integrate with "Start Quiz" flow

**Acceptance Criteria:**
- User info modal opens before quiz if needed
- Can skip if info already provided
- Modal has cancel and submit actions
- On submit, navigates to quiz interface

---

## Phase 2: Quiz Interface Redesign
**Goal:** Build the new quiz-taking experience with question navigator
**Reference:** Section 2.2 in QUIZ_REDESIGN_SUGGESTIONS.md

### 2.1 Create Question Navigator Sidebar
- [ ] Create `src/lib/components/quiz/question-navigator.tsx`
  - Grid layout of question numbers (e.g., 4x5)
  - Color-coded states:
    - Answered: green/filled
    - Not answered: gray/outline
    - Current: blue/border
    - Flagged: yellow star/badge
  - Click handler to jump to questions
  - Progress indicator (X/Y answered, percentage)
  - Flagged questions counter
  - "Review Answers" button
- [ ] Add to QuestionContext:
  ```typescript
  // In src/lib/contexts/question-context.tsx
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())

  const goToQuestion = (index: number) => { ... }
  const flagQuestion = (id: string) => { ... }
  const unflagQuestion = (id: string) => { ... }
  ```
- [ ] Persist flagged questions in sessionStorage

**Acceptance Criteria:**
- Sidebar shows all question numbers in grid
- Clicking number jumps to that question
- Color coding accurately reflects state
- Progress updates in real-time
- Flagged questions tracked and displayed

---

### 2.2 Redesign Quiz Layout
- [ ] Modify `src/app/[quizId]/[questionId]/page.tsx` to `src/app/[quizId]/quiz/page.tsx`
  - Single route for all questions
  - Use state for current question (not route param)
  - Two-column layout: navigator (25%) + question (75%)
  - Mobile: full-width question, navigator in bottom sheet
- [ ] Update `src/app/[quizId]/layout.tsx`
  - Add quiz header with name, timer placeholder, cancel button
  - Remove old layout if any
- [ ] Create `src/lib/components/quiz/quiz-header.tsx`
  - Quiz name display
  - Timer placeholder (for future)
  - Cancel button
  - Theme toggle
- [ ] Remove `src/app/[quizId]/page.tsx` (old quiz overview)

**Acceptance Criteria:**
- New `/[quizId]/quiz` route works
- Two-column layout on desktop
- Mobile bottom sheet for navigator
- No route changes when switching questions
- Smooth transitions between questions

---

### 2.3 Enhance Question Card
- [ ] Create `src/lib/components/quiz/question-card.tsx`
  - Larger card with generous padding
  - Question type badge/icon
  - Question number display
  - Question text (larger font)
  - Answer area (uses existing question components)
  - Flag button
  - Previous/Next navigation
- [ ] Update question type components styling
  - Increase font sizes
  - Better spacing
  - Hover/focus states
  - Consistent styling across all types
- [ ] Add question type icons
  - Import from lucide-react
  - Map question types to icons

**Acceptance Criteria:**
- Question card is prominent and easy to read
- Type indicator shows correct icon
- Flag button works and shows state
- Navigation buttons work correctly
- Disabled states for first/last questions
- Auto-save on answer change (already exists)

---

### 2.4 Cancel Quiz Functionality
- [ ] Create `src/lib/components/quiz/cancel-quiz-dialog.tsx`
  - Confirmation dialog with options:
    - Save & Exit (keeps sessionStorage)
    - Discard & Exit (clears sessionStorage)
    - Continue Quiz
  - Use shadcn AlertDialog component
- [ ] Wire up to cancel button in header
- [ ] Handle navigation back to home
- [ ] Clear state appropriately based on choice

**Acceptance Criteria:**
- Cancel button opens confirmation dialog
- "Save & Exit" preserves answers
- "Discard & Exit" clears all data
- "Continue Quiz" closes dialog
- Navigates to home on exit

---

## Phase 3: Review, Submit & Results
**Goal:** Implement review page, submission flow, and enhanced results
**Reference:** Sections 2.3, 2.4, 2.5 in QUIZ_REDESIGN_SUGGESTIONS.md

### 3.1 Create Review Page
- [ ] Create `src/app/[quizId]/review/page.tsx`
  - Summary statistics at top (X/Y answered)
  - Warning for unanswered questions
  - List all questions with answers
  - Edit button per question
- [ ] Create `src/lib/components/quiz/review-list.tsx`
  - Review list item component
  - Shows question number, text, answer preview
  - Status indicator (✓ answered, ⚠️ unanswered, 🏴 flagged)
  - "Edit" button to jump to question
- [ ] Add review mode to QuestionContext
  ```typescript
  const [isReviewMode, setReviewMode] = useState(false)
  ```
- [ ] Handle "Edit" click
  - Navigate to `/[quizId]/quiz`
  - Set current question index
  - User can edit and return to review

**Acceptance Criteria:**
- Review page shows all questions
- Unanswered questions highlighted
- Edit button navigates to question
- Can return to review after editing
- Submit button only enabled when all required questions answered
- "Back to Quiz" returns to last question

---

### 3.2 Update Submit Page
- [ ] Modify `src/app/[quizId]/submit/page.tsx`
  - Centered layout
  - Quiz name display
  - Statistics summary (questions answered, time taken)
  - Clear messaging about submission
  - Two buttons: "Review Answers" and "Submit Quiz"
  - Loading state during submission
  - Prevent double submission
- [ ] Add confirmation dialog before final submit
- [ ] Calculate time taken from QuestionContext

**Acceptance Criteria:**
- Submit page shows quiz summary
- Review button goes to review page
- Submit button submits quiz
- Loading indicator during submission
- Confirmation dialog works
- No double submissions possible

---

### 3.3 Enhance Results Page
- [ ] Redesign `src/app/[quizId]/result/page.tsx`
  - Top summary card with score
  - Detailed results list below
  - Action buttons at bottom
- [ ] Create `src/lib/components/quiz/results-summary.tsx`
  - Celebration header (🎉 or similar)
  - Circular progress indicator for score
  - Display percentage and fraction (17/20)
  - Time taken
  - Accuracy percentage
  - Confetti animation for high scores (>80%)
- [ ] Create score calculation utility
  ```typescript
  // In src/lib/utils/calculate-score.ts
  export function calculateScore(answers: Record<string, QuestionInput>): QuizScore {
    // Calculate correct/incorrect/total
    // Handle different question types
    // Return score object
  }
  ```
- [ ] Update results list
  - Show all questions with answers
  - Color-coded (green = correct, red = incorrect, orange = text)
  - Correct answer shown when wrong
  - Better formatting and spacing
- [ ] Add action buttons
  - "Restart Quiz" - clears answers, goes to quiz start
  - "Return Home" - goes to home page
  - "Download PDF" - placeholder for future

**Acceptance Criteria:**
- Results summary shows accurate score
- Confetti animation for good scores
- All questions listed with correctness
- Color coding is clear
- Restart button clears data and allows retake
- Home button navigates correctly
- Mobile-friendly layout

---

## Phase 4: Complete Styling Overhaul
**Goal:** Apply new design system across all components
**Reference:** Section 3 in QUIZ_REDESIGN_SUGGESTIONS.md

### 4.1 Update Design Tokens
- [ ] Modify `src/app/globals.css`
  - Update color variables for new palette
  - Define semantic colors (success, warning, error, info)
  - Update typography scale
  - Define spacing scale
- [ ] Create new CSS utilities if needed
  - Card shadows
  - Transitions
  - Focus states

**File Changes:**
```css
/* globals.css updates */
@theme {
  /* New color palette */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Update existing colors as needed */
}
```

---

### 4.2 Replace ContentPane Usage
- [ ] Audit all uses of `ContentPane` component
- [ ] Replace with shadcn/ui `Card` component
  - In question cards
  - In quiz info card
  - In review items
  - In results display
- [ ] Remove green glow effects
  - Use standard shadows instead
  - Reserve special effects for important moments (confetti, etc.)
- [ ] Update component styling
  - Use `cn()` utility for class composition
  - Apply consistent padding/spacing
  - Use design tokens

**Files to Update:**
- `src/lib/components/quiz/question-card.tsx`
- `src/lib/components/quiz/quiz-info-card.tsx`
- `src/lib/components/quiz/review-list.tsx`
- `src/lib/components/quiz/results-summary.tsx`
- Question type components (all 7 types)
- Any other components using ContentPane

**Acceptance Criteria:**
- No ContentPane glows on regular cards
- Consistent card styling throughout
- Clean, modern appearance
- Good visual hierarchy
- Readable typography

---

### 4.3 Component Styling Updates
- [ ] Update all button styles
  - Primary: accent color background
  - Secondary: outlined
  - Consistent sizing (sm, md, lg)
  - Hover/focus states
- [ ] Update all input styles
  - Radio buttons (single choice)
  - Checkboxes (multiple choice)
  - Text inputs
  - Number inputs
  - Clear focus indicators
- [ ] Update navigation styles
  - Sidebar items
  - Question navigator grid
  - Header navigation
  - Mobile drawer/bottom sheet
- [ ] Add loading states
  - Skeleton screens for loading
  - Spinners for actions
  - Disabled states
- [ ] Add animations
  - Page transitions
  - Question transitions
  - Button hover effects
  - Confetti on results

**Acceptance Criteria:**
- All components follow design system
- Consistent spacing throughout
- Clear interactive states
- Smooth animations
- Professional appearance

---

### 4.4 Mobile Responsiveness
- [ ] Test on mobile breakpoints
  - < 768px: Mobile
  - 768-1024px: Tablet
  - > 1024px: Desktop
- [ ] Update layouts for mobile
  - Sidebar becomes drawer (hamburger menu)
  - Question navigator becomes bottom sheet
  - Floating action button for navigation
  - Full-width cards
  - Stacked buttons
- [ ] Add touch interactions
  - Swipe gestures for next/previous (optional)
  - Large tap targets (min 44x44px)
  - Proper spacing for touch
- [ ] Test on actual devices
  - iPhone (Safari)
  - Android (Chrome)
  - Tablet (iPad)

**Acceptance Criteria:**
- Fully functional on mobile
- Easy to use with touch
- No horizontal scrolling
- Readable text sizes
- Accessible tap targets

---

## Phase 5: Additional Features
**Goal:** Add nice-to-have features that enhance the experience
**Reference:** Section 5 in QUIZ_REDESIGN_SUGGESTIONS.md

### 5.1 Timer System (Optional)
- [ ] Add timer support to quiz JSON schema
  ```json
  {
    "config": {
      "timeLimit": 1800  // seconds (30 minutes)
    }
  }
  ```
- [ ] Create `src/lib/hooks/use-quiz-timer.ts`
  - Track start time
  - Calculate elapsed time
  - Support countdown mode
  - Warning at 5 minutes remaining
  - Auto-submit when time expires
- [ ] Add timer display to quiz header
- [ ] Add pause functionality (if allowed)
- [ ] Persist time in sessionStorage

**Acceptance Criteria:**
- Timer displays in header when quiz has time limit
- Counts up or down based on configuration
- Warning shown near end
- Auto-submits when time expires
- Time tracked accurately across refreshes

---

### 5.2 Keyboard Shortcuts
- [ ] Create `src/lib/hooks/use-keyboard-shortcuts.ts`
  - Arrow Left/Right: Previous/Next
  - Numbers 1-9: Jump to question 1-9
  - F: Flag current question
  - Enter: Next question (or submit if last)
  - Esc: Cancel quiz (with confirmation)
- [ ] Add keyboard shortcut hints
  - Tooltip on buttons showing shortcuts
  - Help dialog with all shortcuts
  - "Press ? for shortcuts" indicator
- [ ] Ensure inputs don't conflict
  - Disable shortcuts when typing in text fields

**Acceptance Criteria:**
- All shortcuts work as expected
- No conflicts with form inputs
- Hints visible to users
- Accessible alternative methods exist

---

### 5.3 Question Type Indicators
- [ ] Add icons to question types
  - True/False: Toggle icon
  - Numeric: Hash icon
  - Text: Text icon
  - Single Choice: Radio icon
  - Multiple Choice: Checkbox icon
  - Ordering: List ordered icon
  - Matching: Link icon
- [ ] Display in question card
- [ ] Add tooltip with type name
- [ ] Color code if desired

**Acceptance Criteria:**
- Icon shows on every question
- Icon matches question type
- Tooltip shows type name
- Visually appealing

---

### 5.4 Enhanced Features (Nice-to-Have)
- [ ] Add search/filter to quiz sidebar
- [ ] Add quiz tags/categories
- [ ] Add answer explanations support in JSON
  ```json
  {
    "questions": [{
      "explanation": "Paris is the capital of France..."
    }]
  }
  ```
- [ ] Show explanations in results
- [ ] Add statistics dashboard
  - Total quizzes taken
  - Average score
  - Time spent
  - Charts/graphs
- [ ] Add PDF export for results
  - Use library like jsPDF or Puppeteer
  - Format nicely with scores and answers

**Acceptance Criteria:**
- Features work as specified
- Don't interfere with core functionality
- Enhance user experience
- Optional/progressive enhancement

---

## Phase 6: Testing & Polish
**Goal:** Ensure quality, fix bugs, optimize performance

### 6.1 Testing
- [ ] Manual testing of all flows
  - Quiz selection
  - Quiz taking (all question types)
  - Flagging questions
  - Review before submit
  - Submit and results
  - Cancel quiz
  - Restart quiz
- [ ] Test edge cases
  - No quizzes available
  - All questions answered
  - No questions answered
  - Mix of answered/unanswered
  - Very long quiz (100+ questions)
  - Very short quiz (1 question)
  - Very long question text
  - Very long answers
- [ ] Cross-browser testing
  - Chrome
  - Firefox
  - Safari
  - Edge
- [ ] Mobile testing
  - Various screen sizes
  - Touch interactions
  - Orientation changes
- [ ] Accessibility testing
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast (WCAG AA)
  - Focus indicators

**Acceptance Criteria:**
- All flows work correctly
- No console errors
- Accessible to all users
- Works in all major browsers
- Responsive on all devices

---

### 6.2 Performance Optimization
- [ ] Optimize images (if any)
- [ ] Code splitting
  - Lazy load routes
  - Dynamic imports for heavy components
- [ ] Bundle size analysis
  - Remove unused dependencies
  - Tree shaking
- [ ] Lighthouse audit
  - Performance score > 90
  - Accessibility score 100
  - Best practices score > 90
  - SEO score > 90

**Acceptance Criteria:**
- Fast load times (< 2s)
- Smooth interactions (60fps)
- Small bundle size
- Good Lighthouse scores

---

### 6.3 Final Polish
- [ ] Review all copy/text
  - Fix typos
  - Improve wording
  - Consistent terminology
- [ ] Add loading states everywhere
- [ ] Add error handling
  - Network errors
  - Invalid data
  - User-friendly error messages
- [ ] Add empty states
  - No quizzes
  - No answers
  - No flagged questions
- [ ] Add success feedback
  - Toast notifications
  - Visual confirmations
  - Smooth transitions
- [ ] Documentation
  - Update README.md
  - Update CLAUDE.md
  - Code comments where needed
  - API documentation (quiz JSON schema)

**Acceptance Criteria:**
- Professional appearance
- Clear, helpful copy
- Graceful error handling
- Good developer experience
- Documented for future work

---

## Implementation Timeline Estimate

> **Note:** These are estimates and may vary based on development speed and complexity

- **Phase 1:** 2-3 days (Foundation & Layout)
- **Phase 2:** 3-4 days (Quiz Interface)
- **Phase 3:** 2-3 days (Review, Submit, Results)
- **Phase 4:** 3-4 days (Styling Overhaul)
- **Phase 5:** 2-3 days (Additional Features)
- **Phase 6:** 2-3 days (Testing & Polish)

**Total:** ~14-20 days of focused development

---

## Success Criteria

The redesign is complete when:
- ✅ All phases implemented
- ✅ All acceptance criteria met
- ✅ No critical bugs
- ✅ Passes all tests
- ✅ Positive user feedback
- ✅ Lighthouse scores meet targets
- ✅ Accessible (WCAG AA)
- ✅ Mobile-responsive
- ✅ Documented

---

## Next Steps

1. **Review this plan** - Ensure all requirements covered
2. **Set up version control** - Create feature branch
3. **Start Phase 1** - Begin with foundation work
4. **Iterate** - Complete one phase at a time
5. **Get feedback** - Test with real users
6. **Deploy** - Push to production when ready

---

## Notes

- Keep main branch stable
- Commit often with clear messages
- Test each feature before moving on
- Get feedback early and often
- Document as you go
- Don't skip the polish phase!

Good luck with the implementation! 🚀
