import api from './api';

const normalizeResponse = (response) => response?.data?.data ?? response?.data;

const normalizeLoginError = (error, fallbackMessage) => {
    const responseMessage = error.response?.data?.message;
    if (
        responseMessage?.includes('CSRF') ||
        responseMessage?.includes('Phiên bảo mật')
    ) {
        return 'Phiên bảo mật không hợp lệ hoặc đã hết hạn. Vui lòng tải lại trang và thử lại.';
    }
    if (responseMessage?.includes('Origin')) {
        return 'Không thể kết nối an toàn với máy chủ đăng nhập. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.';
    }
    if (error.response?.status === 401) return fallbackMessage;
    if (Array.isArray(responseMessage)) return responseMessage.join(', ');
    return responseMessage || error.message || fallbackMessage;
};

// Login API
export const loginAPI = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return normalizeResponse(response);
    } catch (error) {
        throw new Error(normalizeLoginError(error, 'Email hoặc mật khẩu không chính xác.'));
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
        const response = await api.post('/auth/admin/login', { email, password });
        const result = normalizeResponse(response);
        return result;
    } catch (error) {
        throw new Error(
            normalizeLoginError(
                error,
                'Email hoặc mật khẩu không chính xác, hoặc tài khoản không có quyền quản trị.',
            ),
        );
    }
};
