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
  } = useStudySession({ packageId, mode });

  const currentWord = words[currentIndex];
  const currentLevel = currentWord?.level || 1;
  const StudyComponent = getStudyComponent(currentLevel);

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
        onBack={goBack}
      />
    );
  }

  return (
    <div className="se-shell grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
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

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <SessionLedger summary={summary} totalWords={words.length} />
        <LevelPanel level={currentLevel} />
      </aside>
    </div>
  );
};

export default StudyController;
