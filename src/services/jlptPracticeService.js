import api from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// USER — PRACTICE SET APIs
// Base: GET|POST /api/v1/jlpt/practice/*
// Guard: JwtAuthGuard (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách Practice Set đang hoạt động (isActive = true).
 * GET /api/v1/jlpt/practice/sets?level=N5&category=VOCABULARY
 *
 * @param {string} [level]    – 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {string} [category] – 'VOCABULARY' | 'KANJI' | 'GRAMMAR' | 'READING'
 * @returns {Promise<Array>} [{ id, level, category, title, description, setNumber, questionCount }]
 */
export const getPracticeSets = async (level, category) => {
  const response = await api.get('/jlpt/practice/sets', { params: { level, category } });
  return response.data.data;
};

/**
 * Lấy chi tiết một Practice Set kèm câu hỏi — options KHÔNG có isCorrect.
 * GET /api/v1/jlpt/practice/sets/:setId
 *
 * @param {string} setId
 * @returns {Promise<Object>} { id, level, category, title, description, setNumber, questions[] }
 */
export const getPracticeSet = async (setId) => {
  const response = await api.get(`/jlpt/practice/sets/${setId}`);
  return response.data.data;
};

/**
 * Nộp bài toàn bộ Practice Set. Backend chấm điểm — KHÔNG tự tính ở frontend.
 * POST /api/v1/jlpt/practice/sets/:setId/submit
 *
 * @param {string} setId
 * @param {{ questionId: string, optionId: string }[]} answers
 * @returns {Promise<Object>} { set, total, answered, unanswered, correct, wrong, score, results[] }
 */
export const submitPracticeSet = async (setId, answers) => {
  const response = await api.post(`/jlpt/practice/sets/${setId}/submit`, { answers });
  return response.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PRACTICE SET APIs
// Base: /api/v1/admin/jlpt/practice/sets
// Guard: JwtAuthGuard + RolesGuard + ADMIN role
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả Practice Set (bao gồm isActive = false) với filter + pagination.
 * GET /api/v1/admin/jlpt/practice/sets
 *
 * @param {Object} [params]
 * @param {string}  [params.level]    – 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {string}  [params.category] – 'VOCABULARY' | 'KANJI' | 'GRAMMAR' | 'READING'
 * @param {boolean} [params.isActive] – true | false
 * @param {string}  [params.search]   – tìm trong title / description
 * @param {number}  [params.page]     – mặc định 1
 * @param {number}  [params.limit]    – mặc định 20
 * @returns {Promise<{ items: Array, meta: { page, limit, total, totalPages } }>}
 */
export const adminGetSets = async (params = {}) => {
  const response = await api.get('/admin/jlpt/practice/sets', { params });
  return response.data.data;
};

/**
 * Lấy chi tiết một Practice Set bao gồm toàn bộ questions + options + isCorrect.
 * GET /api/v1/admin/jlpt/practice/sets/:id
 *
 * @param {string} id – UUID của bộ đề
 * @returns {Promise<Object>} set với questions[].options[].isCorrect
 */
export const adminGetSetById = async (id) => {
  const response = await api.get(`/admin/jlpt/practice/sets/${id}`);
  return response.data.data;
};

/**
 * Tạo Practice Set mới. level + category + setNumber phải unique.
 * POST /api/v1/admin/jlpt/practice/sets  → 201
 *
 * @param {{ level, category, title, setNumber, description?, isActive? }} data
 * @returns {Promise<Object>} set vừa tạo
 * @throws {AxiosError} 409 nếu level+category+setNumber đã tồn tại
 */
export const adminCreateSet = async (data) => {
  const response = await api.post('/admin/jlpt/practice/sets', data);
  return response.data.data;
};

/**
 * Cập nhật Practice Set (PATCH — chỉ field được gửi mới thay đổi).
 * PATCH /api/v1/admin/jlpt/practice/sets/:id
 *
 * @param {string} id
 * @param {{ title?, description?, setNumber?, isActive? }} data
 * @returns {Promise<Object>} set đã cập nhật
 * @throws {AxiosError} 409 nếu setNumber mới đã tồn tại trong cùng level+category
 */
export const adminUpdateSet = async (id, data) => {
  const response = await api.patch(`/admin/jlpt/practice/sets/${id}`, data);
  return response.data.data;
};

/**
 * Vô hiệu hóa Practice Set (soft delete — đặt isActive = false).
 * DELETE /api/v1/admin/jlpt/practice/sets/:id/disable
 *
 * @param {string} id
 * @returns {Promise<{ id, isActive, title }>}
 */
export const adminDisableSet = async (id) => {
  const response = await api.delete(`/admin/jlpt/practice/sets/${id}/disable`);
  return response.data.data;
};

/**
 * Xóa vĩnh viễn Practice Set (hard delete).
 * DELETE /api/v1/admin/jlpt/practice/sets/:id
 *
 * Backend từ chối nếu còn câu hỏi isActive = true liên kết.
 * @param {string} id
 * @returns {Promise<null>}
 */
export const adminDeleteSet = async (id) => {
  const response = await api.delete(`/admin/jlpt/practice/sets/${id}`);
  return response.data.data;
};

/**
 * Xóa nhiều Practice Set cùng lúc.
 * POST /api/v1/admin/jlpt/practice/sets/bulk-delete
 * @param {string[]} ids
 * @returns {Promise<{ deleted: number, failed: number, failures: Array }>}
 */
export const adminBulkDeleteSets = async (ids) => {
  const response = await api.post(`/admin/jlpt/practice/sets/bulk-delete`, { ids });
  return response.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — QUESTION APIs
// Base: /api/v1/admin/jlpt/practice  (no /questions prefix — controller root)
// Guard: JwtAuthGuard + RolesGuard + ADMIN role
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách câu hỏi (bao gồm isActive = false) với filter + pagination.
 * GET /api/v1/admin/jlpt/practice
 *
 * @param {Object} [params]
 * @param {string}  [params.level]
 * @param {string}  [params.category]
 * @param {boolean} [params.isActive]
 * @param {string}  [params.search]   – tìm trong content / explanation
 * @param {number}  [params.page]
 * @param {number}  [params.limit]
 * @returns {Promise<{ items: Array, meta: { page, limit, total, totalPages } }>}
 */
export const adminGetQuestions = async (params = {}) => {
  const response = await api.get('/admin/jlpt/practice', { params });
  return response.data.data;
};

/**
 * Lấy chi tiết một câu hỏi kèm isCorrect, practiceSet info, readingPassage.
 * GET /api/v1/admin/jlpt/practice/:id
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const adminGetQuestionById = async (id) => {
  const response = await api.get(`/admin/jlpt/practice/${id}`);
  return response.data.data;
};

/**
 * Tạo câu hỏi mới.
 * POST /api/v1/admin/jlpt/practice  → 201
 *
 * Body phải có đúng 4 options và đúng 1 option có isCorrect = true.
 * Nếu có practiceSetId, level + category phải khớp với set.
 * Chỉ category = READING mới được có readingPassageId.
 *
 * @param {{
 *   level: string,
 *   category: string,
 *   content: string,
 *   options: Array<{ content: string, isCorrect: boolean, order: number }>,
 *   explanation?: string,
 *   practiceSetId?: string | null,
 *   readingPassageId?: string | null,
 *   isActive?: boolean,
 *   order?: number,
 * }} data
 * @returns {Promise<Object>} câu hỏi vừa tạo kèm options, readingPassage, practiceSet
 */
export const adminCreateQuestion = async (data) => {
  const response = await api.post('/admin/jlpt/practice', data);
  return response.data.data;
};

/**
 * Cập nhật câu hỏi (PATCH).
 * PATCH /api/v1/admin/jlpt/practice/:id
 *
 * - Nếu options được gửi: phải đủ 4 options và đúng 1 isCorrect = true.
 * - practiceSetId:
 *     undefined → giữ nguyên set hiện tại
 *     null      → bỏ gán khỏi set
 *     string    → chuyển sang set mới (phải khớp level + category)
 *
 * @param {string} id
 * @param {{
 *   level?: string,
 *   category?: string,
 *   content?: string,
 *   explanation?: string,
 *   isActive?: boolean,
 *   order?: number,
 *   options?: Array<{ content: string, isCorrect: boolean, order: number }>,
 *   practiceSetId?: string | null,
 * }} data
 * @returns {Promise<Object>}
 */
export const adminUpdateQuestion = async (id, data) => {
  const response = await api.patch(`/admin/jlpt/practice/${id}`, data);
  return response.data.data;
};

/**
 * Vô hiệu hóa câu hỏi (soft delete — đặt isActive = false).
 * DELETE /api/v1/admin/jlpt/practice/:id/disable
 *
 * @param {string} id
 * @returns {Promise<{ id, isActive, content }>}
 */
export const adminDisableQuestion = async (id) => {
  const response = await api.delete(`/admin/jlpt/practice/${id}/disable`);
  return response.data.data;
};

/**
 * Xóa vĩnh viễn câu hỏi kèm tất cả options (hard delete — cascade).
 * DELETE /api/v1/admin/jlpt/practice/:id
 *
 * CẢNH BÁO: Không thể hoàn tác. Chỉ gọi sau khi đã vô hiệu hóa câu hỏi
 * và xác nhận nó không còn nằm trong bộ đề nào đang hoạt động.
 *
 * @param {string} id
 * @returns {Promise<null>}
 */
export const adminDeleteQuestion = async (id) => {
  const response = await api.delete(`/admin/jlpt/practice/${id}`);
  return response.data.data;
};

/**
 * Xóa nhiều câu hỏi cùng lúc (hard delete - cascade).
 * POST /api/v1/admin/jlpt/practice/bulk-delete
 * @param {string[]} ids
 * @returns {Promise<{ deleted: number }>}
 */
export const adminBulkDeleteQuestions = async (ids) => {
  const response = await api.post(`/admin/jlpt/practice/bulk-delete`, { ids });
  return response.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — READING PASSAGE APIs
// Base: /api/v1/admin/jlpt/practice/reading
// Guard: JwtAuthGuard + RolesGuard + ADMIN role
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách Reading Passages kèm questions (bao gồm isCorrect).
 * GET /api/v1/admin/jlpt/practice/reading/list?level=N5
 *
 * @param {string} [level] – lọc theo cấp độ
 * @returns {Promise<Array>} passages kèm questions[].options[].isCorrect
 */
/**
 * Lấy chi tiết một Reading Passage theo ID kèm questions + options (isCorrect).
 * GET /api/v1/admin/jlpt/practice/reading/:id
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const adminGetPassageById = async (id) => {
  const response = await api.get(`/admin/jlpt/practice/reading/${id}`);
  return response.data.data;
};

export const adminGetPassages = async (level) => {
  const response = await api.get('/admin/jlpt/practice/reading/list', {
    params: level ? { level } : {},
  });
  return response.data.data;
};

export const adminVerifyReadingImageUrl = async (url) => {
  const response = await api.post('/admin/jlpt/practice/reading/verify-image-url', { url });
  return response.data.data;
};

export const adminUploadReadingImage = async (file, level, practiceSetId) => {
  const body = new FormData();
  body.append('file', file);
  body.append('level', level);
  body.append('practiceSetId', practiceSetId);
  const response = await api.post('/admin/jlpt/practice/reading/upload-image', body);
  return response.data.data;
};

/**
 * Tạo Reading Passage kèm questions trong một transaction.
 * POST /api/v1/admin/jlpt/practice/reading  → 201
 *
 * Nếu bất kỳ câu hỏi nào lỗi validation, toàn bộ rollback.
 * Mỗi câu hỏi phải có đúng 4 options và đúng 1 isCorrect = true.
 *
 * @param {{
 *   level: string,
 *   passage: string,
 *   title?: string,
 *   passageTranslation?: string,
 *   imageUrl?: string,
 *   order?: number,
 *   questions: Array<{
 *     content: string,
 *     options: Array<{ content: string, isCorrect: boolean, order: number }>,
 *     explanation?: string,
 *     isActive?: boolean,
 *     order?: number,
 *   }>,
 * }} data
 * @returns {Promise<Object>} passage vừa tạo kèm questions + options
 */
export const adminCreatePassage = async (data) => {
  const response = await api.post('/admin/jlpt/practice/reading', data);
  return response.data.data;
};

/**
 * Cập nhật Reading Passage (PATCH — chỉ field được gửi mới thay đổi).
 * PATCH /api/v1/admin/jlpt/practice/reading/:id
 *
 * level không thể thay đổi sau khi tạo.
 * Questions được quản lý riêng qua adminCreateQuestion / adminUpdateQuestion.
 *
 * @param {string} id
 * @param {{
 *   title?: string,
 *   passage?: string,
 *   passageTranslation?: string,
 *   imageUrl?: string | null,
 *   order?: number,
 * }} data
 * @returns {Promise<Object>} passage đã cập nhật kèm questions hiện tại
 */
export const adminUpdatePassage = async (id, data) => {
  const response = await api.patch(`/admin/jlpt/practice/reading/${id}`, data);
  return response.data.data;
};

/**
 * Xóa Reading Passage (hard delete).
 * DELETE /api/v1/admin/jlpt/practice/reading/:id
 *
 * Backend từ chối nếu còn câu hỏi isActive = true liên kết.
 * Phải vô hiệu hóa hoặc xóa tất cả câu hỏi trước khi gọi hàm này.
 *
 * @param {string} id
 * @returns {Promise<null>}
 * @throws {AxiosError} 400 nếu còn câu hỏi đang hoạt động liên kết
 */
export const adminDeletePassage = async (id) => {
  const response = await api.delete(`/admin/jlpt/practice/reading/${id}`);
  return response.data.data;
};

/**
 * Xóa nhiều Reading Passages cùng lúc.
 * POST /api/v1/admin/jlpt/practice/reading/bulk-delete
 * @param {string[]} ids
 * @returns {Promise<{ deleted: number, failed: number, failures: Array }>}
 */
export const adminBulkDeletePassages = async (ids) => {
  const response = await api.post(`/admin/jlpt/practice/reading/bulk-delete`, { ids });
  return response.data.data;
};
