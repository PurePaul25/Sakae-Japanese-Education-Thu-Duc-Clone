import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LevelSelection from './LevelSelection';
import TestSelection from './TestSelection';
import ExamView from './ExamView';
import ResultView from './ResultView';

const JLPTMockTest = () => {
    return (
        <Routes>
            <Route index element={<LevelSelection />} />
            <Route path="level/:levelId" element={<TestSelection />} />
            <Route path="exam/:testId/:qIndex" element={<ExamView />} />
            <Route path="exam/:testId" element={<ExamView />} />
            <Route path="result/:testId" element={<ResultView />} />
        </Routes>
    );
};

export default JLPTMockTest;
