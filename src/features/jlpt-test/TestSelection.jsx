import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, List, Trophy, BookOpen, Play } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { jlptTests } from '../../dataTest/jlptTests';
import { levels } from './constants';
import SEO from '../../hooks/useSEO';

const TestSelection = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const tests = jlptTests.filter((t) => t.level === levelId);

    const openExamPopup = (testId) => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        localStorage.removeItem(`jlpt_exam_state_${testId}`);
        localStorage.removeItem(`jlpt_result_${testId}`);

        window.open(
            `/thi-thu-JLPT/exam/${testId}`,
            `ExamWindow_${testId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
    };

    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <SEO page="jlptTest" />
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate('/thi-thu-JLPT/mock-test')}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-6 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại chọn cấp độ</span>
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-black tracking-widest">
                            {levelId}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500 font-bold">Danh sách đề thi thử</span>
                    </div>
                </div>

                {tests.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tests.map((test, idx) => (
                            <motion.div
                                key={test.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group flex flex-col h-full"
                            >
                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                            <List size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                                            {test.sections.length} PHẦN THI
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                                        {test.title}
                                    </h3>
                                    <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 font-bold">
                                        <span className="flex items-center gap-2">
                                            <Clock size={16} className="text-red-500" /> {test.totalDuration} phút
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Trophy size={16} className="text-orange-500" />{' '}
                                            {levels.find((l) => l.id === test.level)?.passingScore || 0}đ đạt
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openExamPopup(test.id)}
                                        className="mt-auto w-full py-3 cursor-pointer bg-slate-900 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>Bắt đầu làm bài</span>
                                        <Play
                                            size={18}
                                            fill="currentColor"
                                            className="group-hover/btn:translate-x-1 transition-transform"
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                            <BookOpen size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Đang cập nhật đề thi</h3>
                        <p className="text-slate-500 font-medium">
                            Các đề thi trình độ {levelId} đang được đội ngũ Sakae hoàn thiện.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestSelection;
