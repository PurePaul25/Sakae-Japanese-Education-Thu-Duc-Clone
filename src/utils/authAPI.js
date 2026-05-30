import api from './api';

const normalizeResponse = (response) => response?.data?.data ?? response?.data;

// Login API
export const loginAPI = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    }
};

// Signup API
export const signupAPI = async (username, email, password, fullName, gender = 'OTHER') => {
    try {
        const response = await api.post('/auth/register', {
            username,
            email,
            password,
            fullName: fullName || username,
            gender,
        });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    }
};

// Forgot Password API
export const forgotPasswordAPI = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Email không tồn tại trong hệ thống');
    }
};

// Verify Email API
export const verifyEmailAPI = async (email, code) => {
    try {
        const response = await api.post('/auth/verify-email', { email, code });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Xác thực thất bại');
    }
};

// Resend Verification Code API
export const resendCodeAPI = async (email) => {
    try {
        const response = await api.post('/auth/resend-code', { email });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể gửi lại mã');
    }
};

// Cancel Registration API
export const cancelRegistrationAPI = async (email) => {
    try {
        const response = await api.post('/auth/cancel-registration', { email });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể hủy đăng ký');
    }
};

// Reset Password API
export const resetPasswordAPI = async (email, token, password) => {
    try {
        const response = await api.post('/auth/reset-password', { email, token, password });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn');
    }
};

// Get current user
export const getCurrentUserAPI = async () => {
    try {
        const response = await api.get('/auth/me');
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
};

// ====== ADMIN AUTHENTICATION ======

// Admin Login API
export const adminLoginAPI = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        const result = normalizeResponse(response);
        // Check if user is admin
        if (result.user.role !== 'ADMIN') {
            throw new Error('Bạn không có quyền truy cập trang quản trị');
        }
        return result;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Đăng nhập admin thất bại');
    }
};
