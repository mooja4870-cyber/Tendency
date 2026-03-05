import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useApp } from './context/AppContext';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { QuizScreen } from './screens/QuizScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DetailScreen } from './screens/DetailScreen';
import { BiasReportScreen } from './screens/BiasReportScreen';
import { EmpathyScreen } from './screens/EmpathyScreen';
import { EmpathyDetailScreen } from './screens/EmpathyDetailScreen';
import { TimeMatchScreen } from './screens/TimeMatchScreen';
import { InviteScreen } from './screens/InviteScreen';
import { CompareResultScreen } from './screens/CompareResultScreen';
import { BubbleScreen } from './screens/BubbleScreen';
import { BubbleResultScreen } from './screens/BubbleResultScreen';
import { DebateScreen } from './screens/DebateScreen';
import { DebateResultScreen } from './screens/DebateResultScreen';
import { FigureMatchScreen } from './screens/FigureMatchScreen';

export default function App() {
  const { state, processAnswers, analyzeBubble, voteDebate, setPartnerResult } = useApp();
  const navigate = useNavigate();

  // Handle Deep Links
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode) {
      try {
        const { DeepLinkService } = require('./services/DeepLinkService');
        const partnerResult = DeepLinkService.decodeResult(inviteCode);
        setPartnerResult(partnerResult);
        // If user hasn't completed quiz, they should do it first
        if (!state.hasCompletedQuiz) {
          navigate('/onboarding');
        } else {
          navigate('/compare-result');
        }
      } catch (e) {
        console.error('Invalid invite code', e);
      }
    }
  }, [state.hasCompletedQuiz]);

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] text-[#1A1A1A] font-sans selection:bg-cta selection:text-white safe-top safe-bottom safe-left safe-right">
      <div className="h-full mobile-scroll">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Initial Flow */}
            <Route path="/" element={
              <SplashScreen onTimeout={() => navigate(state.hasCompletedQuiz ? '/home' : '/onboarding')} />
            } />

            <Route path="/onboarding" element={
              <OnboardingScreen onStart={() => navigate('/quiz')} />
            } />

            <Route path="/quiz" element={
              <QuizScreen onComplete={(answers) => {
                processAnswers(answers);
                navigate('/loading');
              }} />
            } />

            <Route path="/loading" element={
              <LoadingScreen onFinish={() => navigate('/home')} />
            } />

            {/* Main Hub */}
            <Route path="/home" element={
              state.result ? (
                <HomeScreen result={state.result} onNavigate={(route) => navigate(route)} />
              ) : <Navigate to="/" />
            } />

            <Route path="/detail" element={
              state.result ? (
                <DetailScreen result={state.result} onBack={() => navigate('/home')} />
              ) : <Navigate to="/" />
            } />

            {/* Features */}
            <Route path="/bias" element={
              state.result ? (
                <BiasReportScreen biasReport={state.result.biasReport} onBack={() => navigate('/home')} />
              ) : <Navigate to="/" />
            } />

            <Route path="/empathy" element={
              state.result ? (
                <EmpathyScreen
                  scenarios={state.result.empathyScenarios}
                  onSelectScenario={(id) => navigate(`/empathy/${id}`)}
                  onBack={() => navigate('/home')}
                />
              ) : <Navigate to="/" />
            } />

            <Route path="/empathy/:id" element={
              state.result ? (
                <EmpathyDetailWrapper onBack={() => navigate('/empathy')} />
              ) : <Navigate to="/" />
            } />

            <Route path="/time-match" element={
              state.result ? (
                <TimeMatchScreen matches={state.result.countryMatches} onBack={() => navigate('/home')} />
              ) : <Navigate to="/" />
            } />

            <Route path="/invite" element={
              <InviteScreen onBack={() => navigate('/home')} />
            } />

            <Route path="/compare-result" element={
              state.compatibility ? (
                <CompareResultScreen compatibility={state.compatibility} onBack={() => navigate('/home')} />
              ) : <Navigate to="/invite" />
            } />

            <Route path="/bubble" element={
              <BubbleScreen
                onAnalyze={(ids) => {
                  analyzeBubble(ids);
                  navigate('/bubble-result');
                }}
                onBack={() => navigate('/home')}
              />
            } />

            <Route path="/bubble-result" element={
              state.bubbleReport ? (
                <BubbleResultScreen report={state.bubbleReport} onBack={() => navigate('/bubble')} />
              ) : <Navigate to="/bubble" />
            } />

            <Route path="/debate" element={
              state.result ? (
                <DebateScreen
                  topic={state.debateTopic}
                  userLabel={state.result.overallLabel}
                  onVote={(choice) => {
                    voteDebate(choice, state.result!.overallLabel);
                    navigate('/debate-result');
                  }}
                  onBack={() => navigate('/home')}
                />
              ) : <Navigate to="/" />
            } />

            <Route path="/debate-result" element={
              state.userVote ? (
                <DebateResultScreen
                  topic={state.debateTopic}
                  userVote={state.userVote.choice}
                  onBack={() => navigate('/debate')}
                />
              ) : <Navigate to="/debate" />
            } />

            <Route path="/figure-match" element={
              state.result ? (
                <FigureMatchScreen matches={state.result.figureMatches} onBack={() => navigate('/home')} />
              ) : <Navigate to="/" />
            } />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper component to handle dynamic scenario ID
function EmpathyDetailWrapper({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const { id } = useParams<{ id: string }>();
  const scenario = state.result?.empathyScenarios.find(s => s.id === Number(id));

  if (!scenario) return <Navigate to="/empathy" />;
  return <EmpathyDetailScreen scenario={scenario} onBack={onBack} />;
}
