import api from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// PRACTICE SET APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách Practice Set của một level + category.
 * GET /api/v1/jlpt/practice/sets?level=N5&category=VOCABULARY
 *
 * @param {string} level    – e.g. 'N5'
 * @param {string} category – e.g. 'VOCABULARY'
 * @returns {Promise<Array>} mảng set objects { id, level, category, title, description, setNumber, questionCount }
 */
export const getPracticeSets = async (level, category) => {
  const response = await api.get('/jlpt/practice/sets', { params: { level, category } });
  return response.data.data; // → array of sets
};

/**
 * Lấy chi tiết một Practice Set (questions + options, không có isCorrect).
 * GET /api/v1/jlpt/practice/sets/:setId
 *
 * @param {string} setId
 * @returns {Promise<Object>} { id, level, category, title, description, setNumber, questions[] }
 */
export const getPracticeSet = async (setId) => {
  const response = await api.get(`/jlpt/practice/sets/${setId}`);
  return response.data.data; // → set object with questions
};

/**
 * Nộp bài toàn bộ Practice Set. Backend chấm điểm — frontend KHÔNG tự tính.
 * POST /api/v1/jlpt/practice/sets/:setId/submit
 *
 * @param {string} setId
 * @param {{ questionId: string, optionId: string }[]} answers  – chỉ các câu đã trả lời
 * @returns {Promise<Object>} { set, total, answered, unanswered, correct, wrong, score, results[] }
 */
export const submitPracticeSet = async (setId, answers) => {
  const response = await api.post(`/jlpt/practice/sets/${setId}/submit`, { answers });
  return response.data.data; // → grading result
};
