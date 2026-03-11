import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

const RegistrationModal = ({ isOpen, onClose, courseName, courseId }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên!';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email!';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ!';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại!';
        else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ!';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ!';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length === 0) {
            console.log('Registration submitted:', {
                ...formData,
                courseId,
                courseName,
                submittedAt: new Date().toISOString(),
            });
            setSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 3000);
        } else {
            setErrors(newErrors);
        }
    };

    const handleReset = () => {
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            notes: '',
        });
        setErrors({});
        setSubmitted(false);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            handleReset();
            setIsClosing(false);
            onClose();
        }, 500);
    };

    const [show, setShow] = useState(false);

    // Quản lý body overflow và hiệu ứng show/hide
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Trigger animation sau khi mount
            const timer = setTimeout(() => setShow(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Render logic: Giữ modal trong DOM khi đang đóng để thấy transition
    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-500 ${
                show && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop - hiệu ứng tối dần có transition */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
                    show && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div
                className={`relative z-[70] bg-white rounded-2xl shadow-2xl max-w-md md:max-w-xl w-full mx-4 max-h-[90vh] transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden pointer-events-auto flex flex-col ${
                    show && !isClosing 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-8'
                }`}
            >
                {/* Header with Gradient - cố định */}
                <div className="flex-shrink-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white p-6 flex justify-between items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">🎓 Đăng ký khóa học</h2>
                        <p className="text-red-100 text-sm mt-2 font-medium line-clamp-2">{courseName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-white cursor-pointer hover:bg-red-700 p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ml-2 flex-shrink-0"
                    >
                        <FaTimes size={22} />
                    </button>
                </div>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {/* Success Message */}
                    {submitted ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                                <FaCheckCircle className="text-green-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Đăng ký thành công! ✨</h3>
                            <p className="text-gray-600 text-sm max-w-xs">
                                Cảm ơn bạn đã quan tâm đến Sakae. Chúng tôi sẽ liên hệ bạn sớm.
                            </p>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-semibold text-sm">
                                    Họ và tên <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    autoComplete="on"
                                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all duration-200 focus:shadow-lg ${
                                        errors.fullName
                                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                                            : 'border-gray-300 focus:border-red-600'
                                    }`}
                                    placeholder="Nguyễn Văn A"
                                />
                                {errors.fullName && (
                                    <p className="text-red-600 text-xs font-medium">❌ {errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-semibold text-sm">
                                    Email <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="on"
                                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all duration-200 focus:shadow-lg ${
                                        errors.email
                                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                                            : 'border-gray-300 focus:border-red-600'
                                    }`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-600 text-xs font-medium">❌ {errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-semibold text-sm">
                                    Số điện thoại <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    autoComplete="on"
                                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all duration-200 focus:shadow-lg ${
                                        errors.phone
                                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                                            : 'border-gray-300 focus:border-red-600'
                                    }`}
                                    placeholder="0123 456 789"
                                />
                                {errors.phone && <p className="text-red-600 text-xs font-medium">❌ {errors.phone}</p>}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-semibold text-sm">
                                    Địa chỉ <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    autoComplete="on"
                                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all duration-200 focus:shadow-lg ${
                                        errors.address
                                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                                            : 'border-gray-300 focus:border-red-600'
                                    }`}
                                    placeholder="123 Đường ABC, Quận XYZ, TP HCM"
                                />
                                {errors.address && (
                                    <p className="text-red-600 text-xs font-medium">❌ {errors.address}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-semibold text-sm">
                                    Ghi chú thêm (tùy chọn)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-red-600 focus:outline-none transition-all duration-200 focus:shadow-lg resize-none"
                                    rows="3"
                                    placeholder="Bạn có câu hỏi hoặc yêu cầu đặc biệt không?"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 cursor-pointer py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 cursor-pointer py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                                >
                                    ✓ Đăng ký
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                📞 Chúng tôi sẽ liên hệ bạn trong vòng 24 giờ
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
