import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Languages, Type, BookOpen, ChevronRight } from 'lucide-react';
import SEO from '../../../hooks/useSEO';

const PracticeTypeSelection = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();

    const types = [
        {
            id: 'vocabulary',
            title: 'Luyện tập Từ vựng',
            desc: 'Ôn tập từ mới, nghĩa của từ và cách dùng từ trong ngữ cảnh.',
            icon: Languages,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            accentBg: 'bg-blue-500',
        },
        {
            id: 'kanji',
            title: 'Luyện tập Kanji',
            desc: 'Trau dồi cách đọc Âm và cách viết Hán tự theo trình độ.',
            icon: Type,
            color: 'text-red-600',
            bg: 'bg-red-50',
            accentBg: 'bg-red-500',
        },
        {
            id: 'grammar',
            title: 'Luyện tập Ngữ pháp',
            desc: 'Nắm vững cấu trúc câu và các mẫu ngữ pháp quan trọng.',
            icon: Book,
            color: 'text-green-600',
            bg: 'bg-green-50',
            accentBg: 'bg-green-500',
        },
        {
            id: 'reading',
            title: 'Luyện tập Đọc hiểu',
            desc: 'Rèn kỹ năng đọc đoạn văn tiếng Nhật và trả lời câu hỏi liên quan.',
            icon: BookOpen,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            accentBg: 'bg-purple-500',
        },
    ];

    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <SEO page="practicejlptTest" />
            <div className="max-w-7xl mx-auto px-4">
                <button
                    onClick={() => navigate('/thi-thu-JLPT/practice')}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-5 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Chọn trình độ khác</span>
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-sm font-black tracking-widest">
                            {levelId}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500 font-bold">Chế độ luyện tập</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                        Bạn muốn ôn luyện gì hôm nay?
                    </h1>
                    <p className="text-slate-500 md:text-lg max-w-full font-medium leading-relaxed">
                        Hãy chọn kỹ năng bạn muốn tập trung rèn luyện. Mỗi chế độ sẽ có danh sách các câu hỏi được thiết
                        kế riêng theo trình độ.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {types.map((type, idx) => (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => navigate(`/thi-thu-JLPT/practice/${levelId}/${type.id}`)}
                            className="group bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer flex flex-col items-center text-center h-full relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div
                                className={`absolute top-0 left-0 w-full h-1.5 ${type.accentBg} opacity-0 group-hover:opacity-100 transition-opacity`}
                            />

                            <div
                                className={`w-16 h-16 ${type.bg} ${type.color} rounded-[1rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner`}
                            >
                                <type.icon size={30} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                                {type.title}
                            </h3>
                            <p className="text-slate-500 font-medium mb-6 leading-relaxed text-sm">{type.desc}</p>

                            <div className="mt-auto pt-6 border-t border-slate-50 w-full flex items-center justify-end">
                                <div className="text-red-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    <span>Bắt đầu</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PracticeTypeSelection;
