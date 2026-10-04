import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JLPTHub from './JLPTHub';
import LevelSelection from './LevelSelection';
import TestSelection from './TestSelection';
import ExamView from './ExamView';
import ResultView from './ResultView';

// Practice — selection screens
import PracticeLevelSelection from './practice/PracticeLevelSelection';
import PracticeTypeSelection from './practice/PracticeTypeSelection';
import PracticeTestSelection from './practice/PracticeTestSelection';

// Practice — set-based flow (Phase 3.1 / 3.2)
import PracticeSetExamView from './practice/PracticeSetExamView';
import PracticeSetResultView from './practice/PracticeSetResultView';

const JLPTMockTest = () => {
    return (
        <Routes>
            <Route index element={<JLPTHub />} />

            {/* ── Mock Test ─────────────────────────────────────────────── */}
            <Route path="mock-test" element={<LevelSelection />} />
            <Route path="mock-test/level/:levelId" element={<TestSelection />} />
            <Route path="exam/:testId/:qIndex" element={<ExamView />} />
            <Route path="exam/:testId" element={<ExamView />} />
            <Route path="result/:testId" element={<ResultView />} />

            {/* ── Practice — level / category selection ─────────────────── */}
            <Route path="practice" element={<PracticeLevelSelection />} />
            <Route path="practice/:levelId" element={<PracticeTypeSelection />} />

            {/*
              Practice — set list.
              URL: /thi-thu-JLPT/practice/:levelId/:type
              type = vocabulary | kanji | grammar | reading
              PracticeTestSelection fetches GET /jlpt/practice/sets?level=&category=
              and opens popup to /practice/exam/set/:setId
            */}
            <Route path="practice/:levelId/:type" element={<PracticeTestSelection />} />

            {/*
              Practice — exam popup (set-based).
              URL: /thi-thu-JLPT/practice/exam/set/:setId
              Fetches GET /jlpt/practice/sets/:setId
              Submits via POST /jlpt/practice/sets/:setId/submit
              No /answer call on option click.
            */}
            <Route path="practice/exam/set/:setId" element={<PracticeSetExamView />} />

            {/*
              Practice — result page (set-based).
              URL: /thi-thu-JLPT/practice/result/set/:setId
              Reads backend result from localStorage (setResultKey).
            */}
            <Route path="practice/result/set/:setId" element={<PracticeSetResultView />} />
        </Routes>
    );
};

export default JLPTMockTest;
