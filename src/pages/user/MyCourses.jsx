import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const MyCourses = () => {
    const { addToast } = useToast();
    const hasToasted = useRef(false);

    useEffect(() => {
        if (!hasToasted.current) {
            addToast('Tính năng Khóa học của tôi đang được phát triển. Vui lòng quay lại sau!', 'info');
            hasToasted.current = true;
        }
    }, [addToast]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner"
            >
                <FiClock size={40} className="animate-pulse" />
            </motion.div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-800">Đang phát triển</h1>
                <p className="text-gray-500 max-w-md mx-auto">
                    Chúng tôi đang nỗ lực hoàn thiện giao diện quản lý khóa học để mang lại trải nghiệm tốt nhất cho bạn.
                </p>
            </div>

            <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                    COMING SOON...
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
