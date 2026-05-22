import api from '../utils/api';

const blogService = {
    // Public APIs
    getAll: (params = {}) => api.get('/blog', { params }),

    getBySlug: (slug) => api.get(`/blog/${slug}`),

    getRelated: (slug) => api.get(`/blog/${slug}/related`),

    getComments: (id) => api.get(`/blog/${id}/comments`),

    // Auth required
    toggleLike: (id) => api.post(`/blog/${id}/like`),

    createComment: (id, data) => api.post(`/blog/${id}/comments`, data),

    // Admin APIs
    create: (formData) => api.post('/blog', formData),

    update: (id, formData) => api.patch(`/blog/${id}`, formData),

    updateThumbnail: (id, formData) => api.patch(`/blog/${id}/thumbnail`, formData),

    remove: (id) => api.delete(`/blog/${id}`),
};

export default blogService;
