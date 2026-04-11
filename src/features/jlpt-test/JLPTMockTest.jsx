import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JLPTHub from './JLPTHub';
import LevelSelection from './LevelSelection';
import TestSelection from './TestSelection';
import ExamView from './ExamView';
import ResultView from './ResultView';
// Practice components (to be created)
import PracticeLevelSelection from './practice/PracticeLevelSelection';
import PracticeTypeSelection from './practice/PracticeTypeSelection';
import PracticeTestSelection from './practice/PracticeTestSelection';
import PracticeExamView from './practice/PracticeExamView';
import PracticeResultView from './practice/PracticeResultView';

const JLPTMockTest = () => {
    return (
        <Routes>
            <Route index element={<JLPTHub />} />
            
            {/* Part 1: Thi Thử (Mock Test) */}
            <Route path="mock-test" element={<LevelSelection />} />
            <Route path="mock-test/level/:levelId" element={<TestSelection />} />
            
            {/* Part 2: Luyện Tập (Practice) */}
            <Route path="practice" element={<PracticeLevelSelection />} />
            <Route path="practice/:levelId" element={<PracticeTypeSelection />} />
            <Route path="practice/:levelId/:type" element={<PracticeTestSelection />} />
            <Route path="practice/exam/:testId/:qIndex" element={<PracticeExamView />} />
            <Route path="practice/exam/:testId" element={<PracticeExamView />} />
            <Route path="practice/result/:testId" element={<PracticeResultView />} />

            {/* Common Exam & Result (Shared for now, or can be specific) */}
            <Route path="exam/:testId/:qIndex" element={<ExamView />} />
            <Route path="exam/:testId" element={<ExamView />} />
            <Route path="result/:testId" element={<ResultView />} />
        </Routes>
    );
};

export default JLPTMockTest;
