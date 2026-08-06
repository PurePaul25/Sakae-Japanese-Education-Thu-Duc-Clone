import api from '../utils/api';

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách khóa học (public chỉ thấy isPublished=true)
 * @param {Object} params - { q, level, type, sort, page, limit }
 */
export const getCourses = (params = {}) =>
    api.get('/courses', { params }).then((res) => res.data);

/**
 * Lấy chi tiết khóa học theo slug
 * @param {string} slug
 */
export const getCourseBySlug = (slug) =>
    api.get(`/courses/${slug}`).then((res) => res.data);

/**
 * Lấy lịch khai giảng của một khóa học
 * @param {string} courseId - UUID của khóa học
 */
export const getCourseSchedules = (courseId) =>
    api.get(`/courses/${courseId}/schedules`).then((res) => res.data);

/**
 * Lấy toàn bộ lịch khai giảng
 */
export const getAllSchedules = () =>
    api.get('/courses/schedules').then((res) => res.data);

/**
 * Đăng ký tư vấn khóa học (public, không cần đăng nhập)
 * Rate limited: 5 lần/phút/IP
 * @param {Object} payload - { courseId, scheduleId?, fullName, email, phone, zalo?, note? }
 */
export const createRegistration = (payload) =>
    api.post('/course-registrations', payload).then((res) => res.data);

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Lấy thống kê đăng ký (Admin)
 */
export const getRegistrationDashboard = () =>
    api.get('/course-registrations/dashboard').then((res) => res.data);

/**
 * Lấy danh sách đăng ký (Admin)
 * @param {Object} params - { q, status, courseId, sort, page, limit }
 */
export const getRegistrations = (params = {}) =>
    api.get('/course-registrations', { params }).then((res) => res.data);

/**
 * Lấy chi tiết một đăng ký (Admin)
 * @param {string} id
 */
export const getRegistrationById = (id) =>
    api.get(`/course-registrations/${id}`).then((res) => res.data);

/**
 * Cập nhật trạng thái đăng ký (Admin)
 * @param {string} id
 * @param {string} status - PENDING | CONTACTED | CONFIRMED | CANCELLED
 */
export const updateRegistrationStatus = (id, status) =>
    api.patch(`/course-registrations/${id}`, { status }).then((res) => res.data);

/**
 * Xóa đăng ký (Admin)
 * @param {string} id
 */
export const deleteRegistration = (id) =>
    api.delete(`/course-registrations/${id}`).then((res) => res.data);
