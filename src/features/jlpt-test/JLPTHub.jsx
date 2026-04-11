import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ClipboardCheck, BookOpen, GraduationCap, ArrowRight, Trophy, Target } from 'lucide-react';

const JLPTHub = () => {
    const navigate = useNavigate();

    const options = [
        {
            id: 'mock-test',
            title: 'Thi Thử JLPT',
            description: 'Trải nghiệm kỳ thi như thật với thời gian và cấu trúc đề thi sát thực tế N1-N5.',
            icon: ClipboardCheck,
            color: 'bg-red-600',
            lightColor: 'bg-red-50 text-red-600',
            shadow: 'shadow-red-200',
            path: '/thi-thu-JLPT/mock-test',
            stats: '150+ Đề thi mới',
        },
        {
            id: 'practice',
            title: 'Luyện Tập Kỹ Năng',
            description: 'Tập trung luyện tập từng phần kiến thức: Từ vựng, Kanji, Ngữ pháp theo trình độ.',
            icon: BookOpen,
            color: 'bg-orange-500',
            lightColor: 'bg-orange-50 text-orange-600',
            shadow: 'shadow-orange-200',
            path: '/thi-thu-JLPT/practice',
            stats: '5000+ Câu hỏi',
        },
    ];

    return (
        <div className="pt-24 md:pt-28 pb-12 bg-slate-50 min-h-screen overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-50/50 to-transparent pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 relative">
                <div className="text-center mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-block px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold mb-4 uppercase tracking-widest shadow-lg shadow-red-200">
                            TRUNG TÂM JLPT SAKAE
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Bắt đầu hành trình <br />
                            <span className="text-red-600">Chinh phục JLPT</span>
                        </h1>
                        <p className="text-slate-500 md:text-lg max-w-3xl mx-auto font-medium">
                            Nền tảng thi thử và luyện tập tiếng Nhật toàn diện nhất, theo sát lộ trình{' '}
                            <br className="hidden md:block" />
                            chuẩn từ sơ cấp đến cao cấp.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 px-2 md:px-0">
                    {options.map((option, idx) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => navigate(option.path)}
                            className="group bg-white p-7 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100 flex flex-col relative overflow-hidden h-full"
                        >
                            {/* Decorative element */}
                            <div
                                className={`absolute top-0 right-0 w-24 h-24 ${option.color} opacity-[0.03] rounded-bl-[100px] transition-all duration-500 group-hover:scale-150`}
                            ></div>

                            <div className="flex items-start justify-between mb-8">
                                <div
                                    className={`w-14 h-14 ${option.lightColor} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}
                                >
                                    <option.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                                    {option.stats}
                                </div>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 group-hover:text-red-600 transition-colors">
                                {option.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-6 font-medium">{option.description}</p>

                            <div className="mt-auto flex items-center gap-2 text-slate-900 font-bold group-hover:gap-4 transition-all">
                                <span className={idx === 0 ? 'text-red-600' : 'text-orange-600'}>Khám phá ngay</span>
                                <ArrowRight size={20} className={idx === 0 ? 'text-red-600' : 'text-orange-600'} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Extra info cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/50 backdrop-blur p-5 rounded-3xl border border-slate-300/50 flex items-center gap-4 hover:bg-white transition-colors">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Mục tiêu học tập</p>
                            <p className="text-xs text-slate-500 font-medium">Theo dõi tiến độ hàng ngày</p>
                        </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur p-5 rounded-3xl border border-slate-300/50 flex items-center gap-4 hover:bg-white transition-colors">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Chứng chỉ</p>
                            <p className="text-xs text-slate-500 font-medium">Nhận kết quả sau mỗi kỳ thi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JLPTHub;
