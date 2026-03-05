import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { QUESTIONS } from '../data/questions/questions';
import { UserAnswer, AnswerChoice, QuestionCategory } from '../domain/model/types';

const CATEGORY_LABELS: Record<QuestionCategory, { label: string; emoji: string; color: string }> = {
  [QuestionCategory.ECONOMY]: { label: '경제', emoji: '💰', color: 'bg-amber-100 text-amber-700' },
  [QuestionCategory.WELFARE]: { label: '복지', emoji: '🏥', color: 'bg-rose-100 text-rose-700' },
  [QuestionCategory.SECURITY]: { label: '안보', emoji: '🛡️', color: 'bg-slate-100 text-slate-700' },
  [QuestionCategory.CULTURE]: { label: '문화·사회', emoji: '🌏', color: 'bg-cyan-100 text-cyan-700' },
  [QuestionCategory.ENVIRONMENT]: { label: '환경', emoji: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  [QuestionCategory.RIGHTS]: { label: '인권', emoji: '⚖️', color: 'bg-violet-100 text-violet-700' },
  [QuestionCategory.TRADITION]: { label: '전통·가치', emoji: '🏛️', color: 'bg-orange-100 text-orange-700' },
  [QuestionCategory.GOVERNANCE]: { label: '거버넌스', emoji: '📜', color: 'bg-indigo-100 text-indigo-700' },
};

interface QuizScreenProps {
  onComplete: (answers: UserAnswer[]) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswer = (choice: AnswerChoice) => {
    const responseTimeMs = Date.now() - questionStartTime;
    const newAnswer: UserAnswer = {
      questionId: QUESTIONS[currentQuestionIndex].id,
      choice,
      timestamp: Date.now(),
      responseTimeMs
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const characterExpression = useMemo(() => {
    const progress = (currentQuestionIndex + 1) / QUESTIONS.length;
    if (progress > 0.9) return '🤯';
    if (progress > 0.6) return '🧐';
    if (progress > 0.3) return '🤔';
    return '😊';
  }, [currentQuestionIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full flex flex-col bg-gradient-to-b from-[#FAFAFA] to-[#F0F0F5] px-5 py-4"
    >
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-[#666666]">
            Q{currentQuestionIndex + 1}/{QUESTIONS.length}
          </span>
        </div>

        <div className="h-2 w-full bg-[#E0E0E0] rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-cta"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="flex justify-center mb-8">
          <motion.div
            key={characterExpression}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-[120px] h-[120px] rounded-full bg-[#F5F5FF] flex items-center justify-center shadow-inner"
          >
            <span className="text-5xl">{characterExpression}</span>
          </motion.div>
        </div>

        <motion.div
          layout
          className="bg-white rounded-[20px] shadow-md p-7 mb-auto"
        >
          <div className="flex justify-center mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${CATEGORY_LABELS[QUESTIONS[currentQuestionIndex].category].color}`}>
              {CATEGORY_LABELS[QUESTIONS[currentQuestionIndex].category].emoji} {CATEGORY_LABELS[QUESTIONS[currentQuestionIndex].category].label}
            </span>
          </div>
          <h3 className="text-[22px] font-semibold leading-[1.6] text-center text-[#1A1A1A]" style={{ textWrap: 'balance' }}>
            {QUESTIONS[currentQuestionIndex].text}
          </h3>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mt-8">
          <AnswerButton
            text="예"
            icon="👍"
            color="bg-[#4ECDC4]"
            onClick={() => handleAnswer(AnswerChoice.YES)}
          />
          <AnswerButton
            text="글쎄요"
            icon="🤔"
            color="bg-[#AEAEAE]"
            onClick={() => handleAnswer(AnswerChoice.UNSURE)}
          />
          <AnswerButton
            text="아니오"
            icon="👎"
            color="bg-[#FF6B6B]"
            onClick={() => handleAnswer(AnswerChoice.NO)}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`text-sm font-medium py-2 px-4 transition-opacity ${currentQuestionIndex === 0 ? 'opacity-0' : 'opacity-60 hover:opacity-100'}`}
          >
            ← 이전
          </button>
          <button
            onClick={() => handleAnswer(AnswerChoice.UNSURE)}
            className="text-sm font-medium py-2 px-4 opacity-60 hover:opacity-100"
          >
            건너뛰기 →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

function AnswerButton({ text, icon, color, onClick }: { text: string, icon: string, color: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`${color} h-[72px] rounded-2xl flex flex-col items-center justify-center text-white shadow-sm active:scale-95 transition-transform`}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-sm font-bold">{text}</span>
    </motion.button>
  );
}
