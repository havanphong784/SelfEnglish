import { useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import FlashcardStudy from './FlashcardStudy';
import MultipleChoiceStudy from './MultipleChoiceStudy';
import TypingStudy from './TypingStudy';
import {
  EmptyStudyState,
  FinishedStudy,
  InlineError,
  LevelPanel,
  SessionLedger,
  StudyHeader,
  StudyLoadError,
  StudyLoading,
  ResumeSessionPrompt,
  ShortcutsPanel,
} from './StudySessionChrome';
import { useStudySession } from './useStudySession';

const getStudyComponent = (level) => {
  if (level <= 2) return FlashcardStudy;
  if (level <= 4) return MultipleChoiceStudy;
  return TypingStudy;
};

const StudyController = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  const mode = searchParams.get('mode');
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/dashboard/vocabulary'), [navigate]);

  const {
    words,
    currentIndex,
    loading,
    isFinished,
    error,
    isSubmitting,
    summary,
    retryWords,
    modeLabel,
    handleMaster,
    handleResult,
    retryLoad,
    retryMissedWords,
    loadAnotherPracticeRound,
    pendingResumeSession,
    resumeSavedSession,
    discardSavedSession,
  } = useStudySession({ packageId, mode });

  const currentWord = words[currentIndex];
  const currentLevel = currentWord?.level || 1;
  const StudyComponent = getStudyComponent(currentLevel);
  const handlePracticeAgain = mode === 'practice'
    ? loadAnotherPracticeRound
    : packageId
      ? () => navigate(`/dashboard/vocabulary/study?packageId=${packageId}&mode=practice`)
      : null;

  if (pendingResumeSession) {
    return (
      <ResumeSessionPrompt
        session={pendingResumeSession}
        onResume={resumeSavedSession}
        onDiscard={discardSavedSession}
        onBack={goBack}
      />
    );
  }
  if (loading) return <StudyLoading />;
  if (error && words.length === 0) return <StudyLoadError error={error} onRetry={retryLoad} onBack={goBack} />;
  if (words.length === 0) return <EmptyStudyState onBack={goBack} />;
  if (isFinished) {
    return (
      <FinishedStudy
        error={error}
        summary={summary}
        retryCount={retryWords.length}
        onRetryMissed={retryMissedWords}
        onPracticeAgain={handlePracticeAgain}
        onBack={goBack}
      />
    );
  }

  return (
    <div className="se-shell pt-4 md:pt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      <section className="min-w-0">
        <StudyHeader
          currentIndex={currentIndex}
          totalWords={words.length}
          modeLabel={modeLabel}
          summary={summary}
          onBack={goBack}
        />

        {error && <InlineError error={error} />}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentWord.id}>
          <StudyComponent
            word={currentWord}
            onNext={handleResult}
            onMaster={handleMaster}
            disabled={isSubmitting}
          />
        </div>
      </section>

      <aside className="space-y-3 xl:sticky xl:top-3 xl:self-start">
        <SessionLedger summary={summary} totalWords={words.length} />
        <LevelPanel level={currentLevel} />
        <div className="hidden xl:block">
          <ShortcutsPanel />
        </div>
      </aside>
    </div>
  );
};

export default StudyController;
