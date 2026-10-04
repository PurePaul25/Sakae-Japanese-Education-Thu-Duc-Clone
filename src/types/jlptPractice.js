/**
 * JLPT Practice — shared constants & type documentation.
 */

// ─── Category enum (matches backend JlptPracticeCategory) ──────────────────
export const PRACTICE_CATEGORY = {
  VOCABULARY: 'VOCABULARY',
  KANJI: 'KANJI',
  GRAMMAR: 'GRAMMAR',
  READING: 'READING',
};

// ─── URL type slug → backend enum ──────────────────────────────────────────
export const TYPE_SLUG_TO_CATEGORY = {
  vocabulary: 'VOCABULARY',
  kanji: 'KANJI',
  grammar: 'GRAMMAR',
  reading: 'READING',
};

// ─── Backend enum → URL type slug ──────────────────────────────────────────
export const CATEGORY_TO_TYPE_SLUG = {
  VOCABULARY: 'vocabulary',
  KANJI: 'kanji',
  GRAMMAR: 'grammar',
  READING: 'reading',
};

// ─── Exam timer helper ──────────────────────────────────────────────────────
export const SECONDS_PER_QUESTION = 90; // 1.5 phút/câu
export const MAX_EXAM_SECONDS = 30 * 60; // tối đa 30 phút

/** Tính thời gian làm bài (giây) từ số câu hỏi */
export const calcExamTime = (questionCount) =>
  Math.min(questionCount * SECONDS_PER_QUESTION, MAX_EXAM_SECONDS);

// ─── localStorage key helpers (set-based flow) ─────────────────────────────

/**
 * Key lưu selectedAnswers trong quá trình làm bài.
 * Chỉ lưu { [questionId]: optionId } — KHÔNG lưu isCorrect/correctOptionId.
 */
export const setStateKey = (setId) => `jlpt_set_state_${setId}`;

/**
 * Key lưu kết quả sau khi submit.
 * Lưu toàn bộ backend response:
 *   { set, total, answered, unanswered, correct, wrong, score, results[], questions[] }
 */
export const setResultKey = (setId) => `jlpt_set_result_${setId}`;

// ─── JSDoc types ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PracticeOption
 * @property {string} id
 * @property {string} content
 * @property {number} order
 */

/**
 * @typedef {Object} ReadingPassage
 * @property {string} id
 * @property {string|null} title
 * @property {string} passage
 * @property {string|null} imageUrl
 * @property {number} order
 */

/**
 * @typedef {Object} PracticeQuestion
 * @property {string} id
 * @property {string} level
 * @property {string} category
 * @property {string} content
 * @property {number} order
 * @property {PracticeOption[]} options  – no isCorrect field
 * @property {ReadingPassage|null} readingPassage
 */

/**
 * selectedAnswers state — only what the user chose, never contains isCorrect.
 * @typedef {{ [questionId: string]: string }} SelectedAnswers
 */

/**
 * Result from backend POST /sets/:setId/submit
 * @typedef {Object} SetSubmitResult
 * @property {{ id, level, category, title }} set
 * @property {number} total
 * @property {number} answered
 * @property {number} unanswered
 * @property {number} correct
 * @property {number} wrong
 * @property {number} score
 * @property {Array<{ questionId, selectedOptionId, correct, correctOptionId, explanation }>} results
 * @property {PracticeQuestion[]} questions  – snapshot attached by PracticeSetExamView
 */
