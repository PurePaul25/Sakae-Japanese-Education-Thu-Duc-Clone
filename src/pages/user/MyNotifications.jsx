// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import SEO from '../../hooks/useSEO';

const MyNotifications = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <SEO page="myNotifications" />

        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner"
        >
            <FiBell size={40} className="animate-pulse" />
        </motion.div>

        <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-800">Thông báo của tôi</h1>
            <p className="text-gray-500 max-w-md mx-auto">
                Tính năng này đang được cập nhật và phát triển. Mong bạn thông cảm cho sakae nha!
            </p>
        </div>

        <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                ĐANG PHÁT TRIỂN...
            </div>
        </div>
    </div>
);

export default MyNotifications;
