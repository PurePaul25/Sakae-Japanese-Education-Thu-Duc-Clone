import { createElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, Moon, Shield, Sun, User, Clock3, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import UserProfile from '../../pages/user/UserProfile';

const MotionDiv = motion.div;

const SETTINGS_SECTIONS = [
    { id: 'ho-so-ca-nhan', label: 'Hồ sơ cá nhân', icon: User },
    { id: 'bao-mat', label: 'Bảo mật', icon: Shield },
    { id: 'thong-bao', label: 'Thông báo', icon: Bell },
    { id: 'chung', label: 'Cài đặt chung', icon: Globe },
];

const getInitialClockPreference = () => localStorage.getItem('sakae_admin_show_clock') !== 'false';

const AdminSettings = ({ section = 'chung' }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const activeSection = SETTINGS_SECTIONS.some((item) => item.id === section) ? section : 'chung';
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [showClock, setShowClock] = useState(getInitialClockPreference);
    const [themeEnabled, setThemeEnabled] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const syncPreferences = () => {
            setThemeEnabled(localStorage.getItem('theme') === 'dark');
            setShowClock(getInitialClockPreference());
        };
        window.addEventListener('sakae-admin-settings-changed', syncPreferences);
        return () => window.removeEventListener('sakae-admin-settings-changed', syncPreferences);
    }, []);

    const updateClockPreference = (enabled) => {
        setShowClock(enabled);
        localStorage.setItem('sakae_admin_show_clock', String(enabled));
        window.dispatchEvent(new CustomEvent('sakae-admin-settings-changed'));
    };

    const updateTheme = (enabled) => {
        const theme = enabled ? 'dark' : 'light';
        setThemeEnabled(enabled);
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new CustomEvent('sakae-admin-settings-changed'));
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast('Mật khẩu mới nhập lại không khớp.', 'error');
            return;
        }
        if (currentPassword === newPassword) {
            addToast('Mật khẩu mới phải khác mật khẩu hiện tại.', 'error');
            return;
        }

        setIsSavingPassword(true);
        try {
            await api.patch('/users/change-password', { currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            addToast('Đổi mật khẩu thành công. Các phiên đăng nhập khác đã bị thu hồi.', 'success');
        } catch (error) {
            const message = error.response?.data?.message;
            addToast(Array.isArray(message) ? message.join(', ') : message || 'Không thể đổi mật khẩu.', 'error');
        } finally {
            setIsSavingPassword(false);
        }
    };

    const activeItem = SETTINGS_SECTIONS.find((item) => item.id === activeSection);
    const ActiveIcon = activeItem.icon;

    return (
        <div className="space-y-6 pb-12">
            <header>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Cài đặt hệ thống</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Quản lý hồ sơ, bảo mật và tùy chỉnh giao diện quản trị.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <nav
                    aria-label="Danh mục cài đặt"
                    className="h-fit space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
                >
                    {SETTINGS_SECTIONS.map(({ id, label, icon }) => (
                        <button
                            type="button"
                            key={id}
                            aria-current={activeSection === id ? 'page' : undefined}
                            onClick={() => navigate(`/admin/dashboard/cai-dat/${id}`)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                                activeSection === id
                                    ? 'bg-red-100 text-red-700 shadow-sm dark:bg-red-500/10 dark:text-red-300'
                                    : 'text-slate-600 hover:translate-x-0.5 cursor-pointer hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                        >
                            {createElement(icon, {
                                size: 19,
                                className: `transition-colors duration-200 ${activeSection === id ? 'text-red-600 dark:text-red-300' : 'text-slate-400 group-hover:text-red-500'}`,
                            })}
                            <span>{label}</span>
                            {activeSection === id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />}
                        </button>
                    ))}
                </nav>

                <section
                    className={`min-w-0 ${
                        activeSection === 'ho-so-ca-nhan'
                            ? ''
                            : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300'
                    }`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <MotionDiv
                            key={activeSection}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                            {activeSection === 'ho-so-ca-nhan' ? (
                                <UserProfile isAdmin />
                            ) : (
                                <>
                                    <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                            {createElement(ActiveIcon, { size: 21 })}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                                {activeItem.label}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {activeSection === 'bao-mat' && 'Đổi mật khẩu tài khoản quản trị.'}
                                                {activeSection === 'thong-bao' &&
                                                    'Trạng thái và khả năng hỗ trợ thông báo của hệ thống.'}
                                                {activeSection === 'chung' &&
                                                    'Tùy chỉnh giao diện hiển thị trên thiết bị này.'}
                                            </p>
                                        </div>
                                    </div>

                                    {activeSection === 'bao-mat' && (
                                        <form onSubmit={handlePasswordChange} className="max-w-xl space-y-5">
                                            <PasswordField
                                                label="Mật khẩu hiện tại"
                                                value={currentPassword}
                                                onChange={setCurrentPassword}
                                                autoComplete="current-password"
                                            />
                                            <PasswordField
                                                label="Mật khẩu mới"
                                                value={newPassword}
                                                onChange={setNewPassword}
                                                autoComplete="new-password"
                                            />
                                            <PasswordField
                                                label="Nhập lại mật khẩu mới"
                                                value={confirmPassword}
                                                onChange={setConfirmPassword}
                                                autoComplete="new-password"
                                            />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Mật khẩu mới cần ít nhất 6 ký tự. Các phiên đăng nhập khác sẽ bị thu hồi
                                                sau khi đổi.
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={
                                                    isSavingPassword ||
                                                    !currentPassword ||
                                                    !newPassword ||
                                                    !confirmPassword
                                                }
                                                className="rounded-xl bg-red-600 cursor-pointer px-5 py-2.5 font-semibold text-white shadow-sm shadow-red-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
                                            >
                                                {isSavingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                            </button>
                                        </form>
                                    )}

                                    {activeSection === 'thong-bao' && (
                                        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                                            <div className="flex items-start gap-3">
                                                <Bell className="mt-0.5 shrink-0 text-slate-400" size={20} />
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-white">
                                                        Trung tâm thông báo chưa được kết nối
                                                    </h4>
                                                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                        Hiện backend chưa có API lưu và quản lý thông báo quản trị. Mục
                                                        này không hiển thị dữ liệu mẫu hoặc thông báo giả.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'chung' && (
                                        <div className="space-y-4">
                                            <PreferenceRow
                                                icon={themeEnabled ? Moon : Sun}
                                                title="Giao diện tối"
                                                description="Đổi giao diện tất cả trang quản trị sang nền tối trên thiết bị này."
                                                checked={themeEnabled}
                                                onChange={updateTheme}
                                            />
                                            <PreferenceRow
                                                icon={Clock3}
                                                title="Hiển thị ngày và giờ"
                                                description="Hiện đồng hồ và ngày hiện tại trên thanh điều hướng admin."
                                                checked={showClock}
                                                onChange={updateClockPreference}
                                            />
                                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 transition-all duration-300">
                                                <Globe className="mt-0.5 shrink-0 text-slate-500" size={19} />
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">
                                                        Ngôn ngữ và múi giờ
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        Tiếng Việt · Giờ Việt Nam (Asia/Ho_Chi_Minh)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </MotionDiv>
                    </AnimatePresence>
                </section>
            </div>
        </div>
    );
};

const PasswordField = ({ label, value, onChange, autoComplete }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>

            <div className="relative">
                <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </label>
    );
};

const PreferenceRow = ({ icon, title, description, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-start gap-3">
            {createElement(icon, { className: 'mt-0.5 shrink-0 text-slate-500', size: 19 })}
            <div>
                <p className="font-medium text-slate-800 dark:text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={title}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 cursor-pointer overflow-hidden rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                checked ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
        >
            <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

export default AdminSettings;
