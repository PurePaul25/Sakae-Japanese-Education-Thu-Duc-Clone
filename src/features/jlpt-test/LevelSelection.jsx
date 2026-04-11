import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Info } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { levels } from './constants';

const LevelSelection = () => {
    const navigate = useNavigate();
    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate('/thi-thu-JLPT')}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-8 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>

                <div className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                            Thi thử JLPT chuẩn hóa
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Chọn Cấp Độ Thi Thử</h1>
                        <p className="text-slate-500 md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
                            Chọn cấp độ phù hợp để bắt đầu luyện đề. Mỗi đề thi đều được thiết kế sát với cấu trúc chuẩn
                            JLPT mới nhất, giúp bạn đánh giá chính xác năng lực bản thân.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => navigate(`level/${level.id}`)}
                            className={`group bg-white cursor-pointer p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:-translate-y-1 flex flex-col items-center text-center ${level.accent.replace('border-', 'hover:border-')}`}
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-opacity-80 ${level.id === 'N5' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}
                            >
                                <span className="text-3xl font-black">{level.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{level.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{level.desc}</p>
                            <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                                <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1 uppercase tracking-tighter">
                                    <Clock size={12} strokeWidth={2.5} /> {level.duration}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <Info size={24} />
                        </div>
                        Cấu trúc và thời gian thi JLPT
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                        <div className="space-y-3">
                            <h4 className="font-black text-red-600 border-b border-red-50 pb-3 uppercase tracking-widest text-xs">
                                N2 (155 phút)
                            </h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                <li className="flex items-center gap-2">• Từ vựng + Ngữ pháp + Đọc hiểu (105 phút)</li>
                                <li className="flex items-center gap-2">• Nghe hiểu (50 phút)</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-black text-red-600 border-b border-red-50 pb-3 uppercase tracking-widest text-xs">
                                N3 (140 phút)
                            </h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                <li className="flex items-center gap-2">• Từ vựng (30 phút)</li>
                                <li className="flex items-center gap-2">• Ngữ pháp + Đọc hiểu (70 phút)</li>
                                <li className="flex items-center gap-2">• Nghe hiểu (40 phút)</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-black text-red-600 border-b border-red-50 pb-3 uppercase tracking-widest text-xs">
                                N4 (115-125 phút)
                            </h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                <li className="flex items-center gap-2">• Từ vựng (25 phút)</li>
                                <li className="flex items-center gap-2">• Ngữ pháp + Đọc hiểu (55 phút)</li>
                                <li className="flex items-center gap-2">• Nghe hiểu (35 phút)</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-black text-red-600 border-b border-red-50 pb-3 uppercase tracking-widest text-xs">
                                N5 (90 phút)
                            </h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                <li className="flex items-center gap-2">• Từ vựng (20 phút)</li>
                                <li className="flex items-center gap-2">• Ngữ pháp + Đọc hiểu (40 phút)</li>
                                <li className="flex items-center gap-2">• Nghe hiểu (30 phút)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelSelection;
