import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { fetchWithAuth } from '../../utils/api';

const STUDY_SESSION_STORAGE_KEY = 'currentStudySession:v2';
const LEGACY_STUDY_SESSION_STORAGE_KEYS = ['currentStudySession', 'currentStudySession:v1'];

const initialStudyState = {
  words: [],
  currentIndex: 0,
  loading: true,
  isFinished: false,
  error: '',
  isSubmitting: false,
  outcomes: {},
};

const emptySummary = {
  answered: 0,
  remembered: 0,
  needsReview: 0,
  mastered: 0,
  skipped: 0,
  score: 0,
};

const studyReducer = (state, action) => {
  switch (action.type) {
    case 'load:start':
      return { ...initialStudyState, loading: true };
    case 'load:success':
      return {
        ...initialStudyState,
        words: action.words,
        currentIndex: action.currentIndex || 0,
        loading: false,
        outcomes: action.outcomes || {},
      };
    case 'load:error':
      return { ...initialStudyState, loading: false, error: action.error };
    case 'session:resume-prompt':
      return { ...initialStudyState, loading: false };
    case 'session:resume':
      return {
        ...initialStudyState,
        words: action.words,
        currentIndex: action.currentIndex,
        loading: false,
        outcomes: action.outcomes || {},
      };
    case 'navigate:prev':
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0), error: '' };
    case 'navigate:next':
      return { ...state, currentIndex: action.index, error: '' };
    case 'session:finish':
      return { ...state, isFinished: true, error: '' };
    case 'session:retry-missed':
      return { ...initialStudyState, words: action.words, loading: false };
    case 'outcome:set':
      return {
        ...state,
        outcomes: {
          ...state.outcomes,
          [action.wordId]: action.outcome,
        },
      };
    case 'error:set':
      return { ...state, error: action.error };
    case 'error:clear':
      return { ...state, error: '' };
    case 'submit:set':
      return { ...state, isSubmitting: action.value };
    default:
      return state;
  }
};

const summarizeOutcomes = (outcomes) => {
  const summary = Object.values(outcomes).reduce((acc, outcome) => {
    if (!outcome) return acc;
    if (outcome.type === 'remembered') acc.remembered += 1;
    if (outcome.type === 'needsReview') acc.needsReview += 1;
    if (outcome.type === 'mastered') acc.mastered += 1;
    if (outcome.type === 'skipped') acc.skipped += 1;
    return acc;
  }, { ...emptySummary });

  summary.answered = summary.remembered + summary.needsReview + summary.mastered;
  summary.score = summary.answered > 0
    ? Math.round(((summary.remembered + summary.mastered) / summary.answered) * 100)
    : 0;

  return summary;
};

const getOutcomeFromResult = (result) => {
  return result
    ? { type: 'remembered', rating: 'correct' }
    : { type: 'needsReview', rating: 'incorrect' };
};

const getRetryWords = (words, outcomes) => (
  words.filter((word) => outcomes[word.id]?.type === 'needsReview')
);

const isNewWordSession = (mode, packageId) => Boolean(packageId && mode !== 'practice' && mode !== 'review');

const getModeLabel = (mode, packageId) => {
  if (mode === 'practice') return 'Ôn lại';
  if (mode === 'review' || !packageId) return 'Đến hạn';
  return 'Từ mới';
};

export const useStudySession = ({ packageId, mode }) => {
  const [state, dispatch] = useReducer(studyReducer, initialStudyState);
  const [pendingResumeSession, setPendingResumeSession] = useState(null);
  const { words, currentIndex, isFinished, outcomes } = state;
  const outcomesRef = useRef(null);
  const sessionStartRef = useRef(null);
  const submittingRef = useRef(false);
  const countsNewWordsRef = useRef(false);

  if (outcomesRef.current === null) outcomesRef.current = {};
  if (sessionStartRef.current === null) sessionStartRef.current = Date.now();

  const summary = useMemo(() => summarizeOutcomes(outcomes), [outcomes]);
  const retryWords = useMemo(() => getRetryWords(words, outcomes), [words, outcomes]);
  const modeLabel = getModeLabel(mode, packageId);

  const resetSessionRefs = useCallback((nextOutcomes = {}) => {
    outcomesRef.current = nextOutcomes;
    sessionStartRef.current = Date.now();
  }, []);

  const recordOutcome = useCallback((word, outcome) => {
    const nextOutcomes = { ...outcomesRef.current, [word.id]: outcome };
    outcomesRef.current = nextOutcomes;
    dispatch({ type: 'outcome:set', wordId: word.id, outcome });
  }, []);

  const loadStudySession = useCallback(async () => {
    dispatch({ type: 'load:start' });
    resetSessionRefs();
    countsNewWordsRef.current = isNewWordSession(mode, packageId);

    try {
      let data = [];
      if (mode === 'practice' && packageId) {
        data = await fetchWithAuth(`/vocabularies/packages/${packageId}/practice`);
      } else if (packageId) {
        data = await fetchWithAuth(`/vocabularies/packages/${packageId}/learn`);
      } else {
        data = await fetchWithAuth('/vocabularies/review');
      }

      if (!Array.isArray(data)) throw new Error('Dữ liệu bài học không hợp lệ.');
      dispatch({ type: 'load:success', words: data });
    } catch (loadError) {
      console.error('Lỗi tải bài học:', loadError);
      dispatch({
        type: 'load:error',
        error: loadError.message || 'Không thể tải bài học. Vui lòng thử lại.',
      });
    }
  }, [mode, packageId, resetSessionRefs]);

  useEffect(() => {
    setPendingResumeSession(null);
    LEGACY_STUDY_SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));

    const savedSessionStr = sessionStorage.getItem(STUDY_SESSION_STORAGE_KEY);
    if (savedSessionStr) {
      try {
        const savedSession = JSON.parse(savedSessionStr);
        if (
          savedSession.packageId === packageId
          && savedSession.mode === mode
          && Array.isArray(savedSession.words)
          && savedSession.words.length > 0
        ) {
          const safeIndex = Math.min(
            Math.max(Number(savedSession.currentIndex) || 0, 0),
            savedSession.words.length - 1,
          );

          setPendingResumeSession({
            words: savedSession.words,
            currentIndex: safeIndex,
            outcomes: savedSession.outcomes || {},
            startedAt: savedSession.startedAt,
            countsNewWords: savedSession.countsNewWords,
          });
          dispatch({ type: 'session:resume-prompt' });
          return;
        }
      } catch (parseError) {
        console.error('Lỗi đọc phiên học đã lưu:', parseError);
        sessionStorage.removeItem(STUDY_SESSION_STORAGE_KEY);
      }
    }

    loadStudySession();
  }, [loadStudySession, packageId, mode]);

  const resumeSavedSession = useCallback(() => {
    if (!pendingResumeSession) return;

    outcomesRef.current = pendingResumeSession.outcomes;
    sessionStartRef.current = pendingResumeSession.startedAt || Date.now();
    countsNewWordsRef.current = pendingResumeSession.countsNewWords ?? isNewWordSession(mode, packageId);
    dispatch({
      type: 'session:resume',
      words: pendingResumeSession.words,
      currentIndex: pendingResumeSession.currentIndex,
      outcomes: pendingResumeSession.outcomes,
    });
    setPendingResumeSession(null);
  }, [mode, packageId, pendingResumeSession]);

  const discardSavedSession = useCallback(() => {
    sessionStorage.removeItem(STUDY_SESSION_STORAGE_KEY);
    setPendingResumeSession(null);
    void loadStudySession();
  }, [loadStudySession]);

  useEffect(() => {
    if (words.length > 0 && !isFinished) {
      sessionStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify({
        packageId,
        mode,
        currentIndex,
        words,
        outcomes,
        startedAt: sessionStartRef.current,
        countsNewWords: countsNewWordsRef.current,
      }));
    } else if (isFinished) {
      sessionStorage.removeItem(STUDY_SESSION_STORAGE_KEY);
    }
  }, [currentIndex, words, outcomes, isFinished, packageId, mode]);

  const playSound = useCallback((type) => {
    try {
      const audio = new Audio(type === 'correct' ? '/sounds/correct.mp3' : '/sounds/error.mp3');
      audio.volume = 0.5;
      void audio.play().catch(() => {});
    } catch (soundError) {
      console.error('Lỗi phát âm thanh:', soundError);
    }
  }, []);

  const moveToNext = useCallback(async () => {
    dispatch({ type: 'error:clear' });

    if (currentIndex + 1 < words.length) {
      dispatch({ type: 'navigate:next', index: currentIndex + 1 });
      return;
    }

    dispatch({ type: 'session:finish' });
    const completedCount = summarizeOutcomes(outcomesRef.current).answered;
    if (completedCount === 0) return;

    const durationMinutes = Math.max(1, Math.floor((Date.now() - sessionStartRef.current) / 60000));
    const wordsLearned = countsNewWordsRef.current ? completedCount : 0;

    try {
      await fetchWithAuth('/vocabularies/session', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes, wordsLearned }),
      });
    } catch (saveError) {
      console.error('Lỗi lưu phiên học:', saveError);
      dispatch({
        type: 'error:set',
        error: 'Đã hoàn thành bài học, nhưng chưa lưu được thống kê phiên học.',
      });
    }
  }, [currentIndex, words.length]);

  const handleResult = useCallback(async (result) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    if (result && result.action === 'prev') {
      dispatch({ type: 'navigate:prev' });
      return;
    }

    if (result && result.action === 'next') {
      recordOutcome(currentWord, { type: 'skipped' });
      await moveToNext();
      return;
    }

    if (submittingRef.current) return;

    const outcome = getOutcomeFromResult(result);
    const isCorrect = outcome.type === 'remembered';

    submittingRef.current = true;
    dispatch({ type: 'submit:set', value: true });
    dispatch({ type: 'error:clear' });
    playSound(isCorrect ? 'correct' : 'incorrect');

    try {
      if (mode !== 'practice') {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/review`, {
          method: 'POST',
          body: JSON.stringify({ isCorrect }),
        });
      }

      recordOutcome(currentWord, outcome);
      await moveToNext();
    } catch (saveError) {
      console.error('Lỗi khi lưu kết quả:', saveError);
      dispatch({
        type: 'error:set',
        error: 'Không lưu được kết quả cho từ này. Vui lòng thử lại.',
      });
    } finally {
      submittingRef.current = false;
      dispatch({ type: 'submit:set', value: false });
    }
  }, [currentIndex, mode, moveToNext, playSound, recordOutcome, words]);

  const handleMaster = useCallback(async () => {
    if (submittingRef.current) return;

    const currentWord = words[currentIndex];
    if (!currentWord) return;

    submittingRef.current = true;
    dispatch({ type: 'submit:set', value: true });
    dispatch({ type: 'error:clear' });
    playSound('correct');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6'],
    });

    try {
      if (mode !== 'practice') {
        await fetchWithAuth(`/vocabularies/${currentWord.id}/master`, { method: 'POST' });
      }

      recordOutcome(currentWord, { type: 'mastered' });
      await moveToNext();
    } catch (saveError) {
      console.error('Lỗi khi đánh dấu thuộc:', saveError);
      dispatch({
        type: 'error:set',
        error: 'Không đánh dấu thuộc được. Vui lòng thử lại.',
      });
    } finally {
      submittingRef.current = false;
      dispatch({ type: 'submit:set', value: false });
    }
  }, [currentIndex, mode, moveToNext, playSound, recordOutcome, words]);

  const retryLoad = useCallback(() => {
    void loadStudySession();
  }, [loadStudySession]);

  const retryMissedWords = useCallback(() => {
    const nextWords = getRetryWords(words, outcomesRef.current);
    if (nextWords.length === 0) return;
    resetSessionRefs();
    countsNewWordsRef.current = false;
    dispatch({ type: 'session:retry-missed', words: nextWords });
  }, [resetSessionRefs, words]);

  return {
    ...state,
    summary,
    retryWords,
    modeLabel,
    handleMaster,
    handleResult,
    retryLoad,
    retryMissedWords,
    pendingResumeSession,
    resumeSavedSession,
    discardSavedSession,
  };
};
