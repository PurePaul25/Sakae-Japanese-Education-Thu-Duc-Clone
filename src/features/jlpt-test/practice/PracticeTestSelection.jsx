import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, CheckCircle, Lock } from 'lucide-react';

const PracticeTestSelection = () => {
    const { levelId, type } = useParams();
    const navigate = useNavigate();

    const typeLabels = {
        vocabulary: 'Từ vựng',
        kanji: 'Kanji',
        grammar: 'Ngữ pháp',
    };

    // Mock data for tests
    const tests = [
        { id: 'p1', title: 'Bài kiểm tra 1', questions: 20, time: 15, completed: true, score: 90 },
        { id: 'p2', title: 'Bài kiểm tra 2', questions: 20, time: 15, completed: false },
        { id: 'p3', title: 'Bài kiểm tra 3', questions: 25, time: 20, completed: false },
        { id: 'p4', title: 'Bài kiểm tra 4', questions: 25, time: 20, completed: false },
        {
            id: 'p5',
            title: 'Bài kiểm tra 5',
            questions: 30,
            time: 25,
            completed: false,
            locked: true,
        },
        {
            id: 'p6',
            title: 'Bài kiểm tra 6',
            questions: 30,
            time: 25,
            completed: false,
            locked: true,
        },
    ];

    const openExamPopup = (testId) => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        localStorage.removeItem(`jlpt_practice_state_${testId}`);
        localStorage.removeItem(`jlpt_practice_result_${testId}`);

        window.open(
            `/thi-thu-JLPT/practice/exam/${testId}/0`,
            `PracticeWindow_${testId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
    };

    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate(`/thi-thu-JLPT/practice/${levelId}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-6 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black tracking-widest uppercase">
                                {levelId}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-black tracking-widest uppercase">
                                {typeLabels[type]}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Danh sách bài kiểm tra</h1>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Đã học
                            </p>
                            <p className="text-xl text-slate-800 font-bold">
                                1<span className="text-slate-800">/6</span>
                            </p>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Trung bình
                            </p>
                            <p className="text-xl font-black text-red-600">90%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map((test, idx) => (
                        <motion.div
                            key={test.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative bg-white p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                test.locked
                                    ? 'opacity-70 border-transparent grayscale'
                                    : 'border-transparent hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/10 cursor-pointer'
                            }`}
                            onClick={() => !test.locked && openExamPopup(test.id)}
                        >
                            {test.completed && (
                                <div className="absolute top-4 right-4 text-green-500">
                                    <CheckCircle size={24} fill="currentColor" className="text-white fill-green-500" />
                                </div>
                            )}

                            {test.locked && (
                                <div className="absolute top-6 right-6 text-slate-400 bg-slate-50 p-2 rounded-xl">
                                    <Lock size={18} />
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                                        test.completed
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors'
                                    }`}
                                >
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-red-600 transition-colors">
                                        {test.title}
                                    </h3>
                                    <div className="flex items-center">
                                        {test.completed && (
                                            <span className="text-xs font-bold text-green-500">
                                                Điểm: {test.score}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} strokeWidth={2.5} /> {test.time}ph
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Play size={14} strokeWidth={2.5} /> {test.questions} câu
                                    </span>
                                </div>
                                {!test.locked && (
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <Play size={18} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PracticeTestSelection;
