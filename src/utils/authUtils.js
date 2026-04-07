// Tính toán mức độ mật khẩu (yếu, trung bình, khá, mạnh, rất mạnh)
export const calculatePasswordStrength = (password) => {
    if (!password) {
        return {
            strength: 0,
            level: 'empty',
            color: 'bg-gray-300',
            text: 'Tạo mật khẩu',
            isPredictable: false,
        };
    }

    let strength = 0;
    const commonPasswords = ['123456', 'password', 'abc123', '654321', '111111', '000000', 'aaaaaa', 'qwerty'];

    // Kiểm tra mật khẩu phổ biến
    if (commonPasswords.some((p) => password.toLowerCase().includes(p))) {
        return {
            strength: 1,
            level: 'predictable',
            color: 'bg-red-500',
            text: 'Mật khẩu dễ đoán',
            isPredictable: true,
        };
    }

    // Độ dài
    if (password.length >= 7) strength++;
    if (password.length >= 10) strength++;
    if (password.length >= 14) strength++;

    // Chữ thường
    if (/[a-z]/.test(password)) strength++;

    // Chữ hoa
    if (/[A-Z]/.test(password)) strength++;

    // Số
    if (/[0-9]/.test(password)) strength++;

    // Ký tự đặc biệt
    if (/[!@#$%^&*()_+=\-[\]{}:;'".,<>?/\\|`~]/.test(password)) strength++;

    // Tính phần trăm
    const percentage = (strength / 7) * 100;

    let level, color, text;
    if (percentage < 30) {
        level = 'weak';
        color = 'bg-red-600';
        text = 'Mật khẩu yếu';
    } else if (percentage < 50) {
        level = 'fair';
        color = 'bg-yellow-500';
        text = 'Mật khẩu khá';
    } else if (percentage < 75) {
        level = 'good';
        color = 'bg-blue-500';
        text = 'Mật khẩu tốt';
    } else {
        level = 'strong';
        color = 'bg-green-500';
        text = 'Mật khẩu rất mạnh';
    }

    return {
        strength: Math.min(strength, 7),
        level,
        color,
        text,
        percentage: Math.min(percentage, 100),
        isPredictable: false,
    };
};

// Kiểm tra các yêu cầu mật khẩu
export const checkPasswordRequirements = (password) => {
    return {
        hasNumber: /[0-9]/.test(password),
        hasLetter: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        isLongEnough: password.length >= 7,
    };
};

// Kiểm tra tất cả yêu cầu được đáp ứng
export const isPasswordValid = (password) => {
    const requirements = checkPasswordRequirements(password);
    return Object.values(requirements).every((req) => req === true);
};

// Kiểm tra email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Kiểm tra username
export const isValidUsername = (username) => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
};
