// Fake API for authentication
// In a real app, these would call a backend server

const fakeUsers = [
    {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234',
        avatar: 'https://i.pravatar.cc/150?img=1',
        fullName: 'Test User Đẹp Zai',
        role: 'user',
    },
    {
        id: '2',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'John1234',
        avatar: 'https://i.pravatar.cc/150?img=2',
        fullName: 'John Doe',
        role: 'user',
    },
];

const fakeAdmins = [
    {
        id: 'admin-1',
        username: 'Admin',
        email: 'admin@sakae.com',
        password: 'Admin1234',
        avatar: 'https://i.pravatar.cc/150?img=33',
        fullName: 'Sakae Cute nè',
        role: 'admin',
    },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Login API
export const loginAPI = async (email, password) => {
    await delay(500); // Simulate network delay

    const user = fakeUsers.find((u) => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Signup API
export const signupAPI = async (username, email, password) => {
    await delay(500); // Simulate network delay

    // Check if user already exists
    if (fakeUsers.some((u) => u.email === email)) {
        throw new Error('Email đã được sử dụng');
    }

    if (fakeUsers.some((u) => u.username === username)) {
        throw new Error('Tên người dùng đã được sử dụng');
    }

    // Create new user
    const newUser = {
        id: String(fakeUsers.length + 1),
        username,
        email,
        password,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        fullName: username,
    };

    fakeUsers.push(newUser);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// Forgot Password API
export const forgotPasswordAPI = async (email) => {
    await delay(500); // Simulate network delay

    const user = fakeUsers.find((u) => u.email === email);

    if (!user) {
        throw new Error('Email không tồn tại');
    }

    // In a real app, send reset email here
    return { success: true, message: 'Email reset đã được gửi' };
};

// Get current user (simulated - in real app would check token)
export const getCurrentUserAPI = async (userId) => {
    await delay(300);

    const user = fakeUsers.find((u) => u.id === userId);

    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// ====== ADMIN AUTHENTICATION ======

// Admin Login API
export const adminLoginAPI = async (email, password) => {
    await delay(500); // Simulate network delay

    const admin = fakeAdmins.find((a) => a.email === email && a.password === password);

    if (!admin) {
        throw new Error('Email hoặc mật khẩu admin không chính xác');
    }

    // Return admin data without password
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
};
