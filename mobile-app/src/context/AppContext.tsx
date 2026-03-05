import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  UserAnswer, 
  DiagnosisResult, 
  CompatibilityResult, 
  BubbleReport, 
  DebateTopic, 
  DebateChoice,
  DebateVote,
  OrientationLabel,
  DebateResult
} from '../domain/model/types';
import { ScoringEngine } from '../domain/scoring/engine';
import { BubbleAnalyzer } from '../domain/scoring/BubbleAnalyzer';
import { CompatibilityEngine } from '../domain/scoring/CompatibilityEngine';
import { DebateRepository } from '../domain/repository/DebateRepository';

export interface AppState {
  hasCompletedQuiz: boolean;
  answers: UserAnswer[];
  result: DiagnosisResult | null;
  compatibility: CompatibilityResult | null;
  bubbleReport: BubbleReport | null;
  debateTopic: DebateTopic | null;
  userVote: DebateVote | null;
  debateResult: DebateResult | null;
  partnerResult: DiagnosisResult | null;
}

interface AppContextType {
  state: AppState;
  processAnswers: (answers: UserAnswer[]) => void;
  calculateCompatibility: (partnerResult: DiagnosisResult) => void;
  analyzeBubble: (selectedMediaIds: number[]) => void;
  voteDebate: (choice: DebateChoice, userLabel: OrientationLabel) => Promise<void>;
  setPartnerResult: (result: DiagnosisResult) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const engine = new ScoringEngine();
const bubbleAnalyzer = new BubbleAnalyzer();
const compatibilityEngine = new CompatibilityEngine();
const debateRepo = new DebateRepository();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    hasCompletedQuiz: false,
    answers: [],
    result: null,
    compatibility: null,
    bubbleReport: null,
    debateTopic: null,
    userVote: null,
    debateResult: null,
    partnerResult: null,
  });

  useEffect(() => {
    const unsubscribe = debateRepo.subscribeToCurrentTopic((topic) => {
      setState(prev => ({ ...prev, debateTopic: topic }));
    });
    return () => unsubscribe();
  }, []);

  const processAnswers = useCallback((answers: UserAnswer[]) => {
    const result = engine.calculateResult(answers);
    setState(prev => {
      const newState = {
        ...prev,
        answers,
        result,
        hasCompletedQuiz: true,
      };
      
      // If we have a partner result waiting, calculate compatibility immediately
      if (prev.partnerResult) {
        newState.compatibility = compatibilityEngine.compare(result, prev.partnerResult);
      }
      
      return newState;
    });
  }, []);

  const calculateCompatibility = useCallback((partnerResult: DiagnosisResult) => {
    if (!state.result) {
      setState(prev => ({ ...prev, partnerResult }));
      return;
    }
    const compatibility = compatibilityEngine.compare(state.result, partnerResult);
    setState(prev => ({ ...prev, compatibility, partnerResult }));
  }, [state.result]);

  const setPartnerResult = useCallback((result: DiagnosisResult) => {
    setState(prev => {
      const newState = { ...prev, partnerResult: result };
      if (prev.result) {
        newState.compatibility = compatibilityEngine.compare(prev.result, result);
      }
      return newState;
    });
  }, []);

  const analyzeBubble = useCallback((selectedMediaIds: number[]) => {
    const bubbleReport = bubbleAnalyzer.analyze(selectedMediaIds);
    setState(prev => ({ ...prev, bubbleReport }));
  }, []);

  const voteDebate = useCallback(async (choice: DebateChoice, userLabel: OrientationLabel) => {
    if (!state.debateTopic) return;
    
    await debateRepo.vote(state.debateTopic.id, choice, userLabel);
    const result = await debateRepo.getVoteResults(state.debateTopic, userLabel, choice);
    
    const vote: DebateVote = {
      topicId: state.debateTopic.id,
      userId: 'current-user',
      userLabel,
      choice,
      timestamp: Date.now(),
    };
    
    setState(prev => ({ ...prev, userVote: vote, debateResult: result }));
  }, [state.debateTopic]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasCompletedQuiz: false,
      answers: [],
      result: null,
      compatibility: null,
      bubbleReport: null,
      userVote: null,
      debateResult: null,
    }));
  }, []);

  const value = useMemo(() => ({
    state,
    processAnswers,
    calculateCompatibility,
    analyzeBubble,
    voteDebate,
    setPartnerResult,
    reset,
  }), [state, processAnswers, calculateCompatibility, analyzeBubble, voteDebate, setPartnerResult, reset]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
