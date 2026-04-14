import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { levels } from '../constants';
import SEO from '../../../hooks/useSEO';

const PracticeLevelSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <SEO page="practicejlptTest" />
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate('/thi-thu-JLPT')}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-6 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>

                <div className="mb-8">
                    <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                        Luyện tập kỹ năng
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Chọn Trình Độ Luyện Tập</h1>
                    <p className="text-slate-500 md:text-lg max-w-full font-medium leading-relaxed">
                        Mỗi cấp độ được chia nhỏ thành các bài tập trọng tâm về Từ vựng, Kanji và Ngữ pháp để bạn dễ
                        dàng ôn luyện theo từng chủ đề.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level, idx) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(`/thi-thu-JLPT/practice/${level.id}`)}
                            className="group bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-300 group-hover:scale-110 ${
                                        level.id === 'N5'
                                            ? 'bg-red-50 text-red-600'
                                            : level.id === 'N4'
                                              ? 'bg-orange-50 text-orange-600'
                                              : level.id === 'N3'
                                                ? 'bg-blue-50 text-blue-600'
                                                : level.id === 'N2'
                                                  ? 'bg-purple-50 text-purple-600'
                                                  : 'bg-slate-900 text-white'
                                    }`}
                                >
                                    {level.id}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{level.name}</h3>
                                    <p className="text-sm text-slate-400 font-medium">100+ Bài tập luyện tập</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PracticeLevelSelection;
