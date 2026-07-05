import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Check, CheckCircle, Crown, X, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { Button, Panel } from '../../components/ui/Primitives';

const normalizeSynonyms = (synonyms) => {
  if (Array.isArray(synonyms)) return synonyms;
  if (typeof synonyms === 'string') {
    return synonyms
      .split(',')
      .flatMap((item) => {
        const trimmed = item.trim();
        return trimmed ? [trimmed] : [];
      });
  }
  return [];
};

const MultipleChoiceStudy = ({ word, onNext, onMaster, disabled = false }) => {
  const [options, setOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      setSelectedAnswer(null);
      setOptions([]);
      setIsLoadingOptions(true);

      try {
        let query = `/vocabularies/random?excludeId=${word.id}&limit=3`;
        const synonyms = normalizeSynonyms(word.synonyms);

        if (word.partOfSpeech) query += `&partOfSpeech=${encodeURIComponent(word.partOfSpeech)}`;
        if (synonyms.length > 0) query += `&excludeSynonyms=${encodeURIComponent(synonyms.join(','))}`;

        const distractors = await fetchWithAuth(query);
        const others = Array.isArray(distractors) ? distractors.slice(0, 3) : [];
        const mergedOptions = [word, ...others].sort(() => 0.5 - Math.random());

        if (isActive) setOptions(mergedOptions);
      } catch (error) {
        console.error('Lỗi khi tải distractors:', error);
        if (isActive) setOptions([word]);
      } finally {
        if (isActive) setIsLoadingOptions(false);
      }
    };

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, [word]);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleAnswer = useCallback((option) => {
    if (disabled || selectedAnswer !== null) return;

    setSelectedAnswer(option);
    const isCorrect = option.id === word.id;

    if (isCorrect && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(word.word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onNext(isCorrect);
    }, 1500);
  }, [disabled, onNext, selectedAnswer, word]);

  const handleKeyboardAnswer = useEffectEvent((event) => {
    if (disabled || selectedAnswer !== null || options.length < 2) return;
    const key = Number.parseInt(event.key, 10);
    if (key >= 1 && key <= options.length && options[key - 1]) {
      handleAnswer(options[key - 1]);
    }
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      handleKeyboardAnswer(event);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoadingOptions) {
    return <div className="py-10 text-center font-bold text-muted-foreground">Đang tạo câu hỏi cho bạn...</div>;
  }

  if (options.length < 2) {
    return (
      <Panel className="mx-auto max-w-2xl text-center">
        <p className="se-label mb-4 justify-center">Tự kiểm tra</p>
        <h2 className="mb-4 font-secondary text-5xl font-black tracking-tight text-primary">{word.word}</h2>
        <p className="mx-auto mb-8 max-w-lg text-2xl font-bold leading-snug text-foreground">"{word.meaning}"</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onNext(false)}
            disabled={disabled}
            className="flex min-h-[80px] items-center justify-center gap-3 rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] p-4 font-bold text-[#8a6200] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            type="button"
          >
            <X className="h-5 w-5" />
            Chưa chắc
          </button>
          <button
            onClick={() => onNext(true)}
            disabled={disabled}
            className="flex min-h-[80px] items-center justify-center gap-3 rounded-xl border-2 border-primary bg-storybook-green p-4 font-bold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            type="button"
          >
            <Check className="h-5 w-5" />
            Nhớ rồi
          </button>
        </div>
        {onMaster && (
          <Button
            onClick={onMaster}
            disabled={disabled}
            variant="soft"
            className="mt-8"
          >
            <Crown className="h-4 w-4" />
            Mình nhớ rồi
          </Button>
        )}
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto max-w-2xl text-center">
      <h2 className="mb-12 font-secondary text-5xl font-black tracking-tight text-primary">{word.word}</h2>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => {
          let btnClass = 'p-5 border-2 rounded-xl text-lg font-bold transition-all text-left flex justify-between items-center group';

          if (selectedAnswer !== null) {
            if (option.id === word.id) {
              btnClass += ' bg-storybook-green border-primary text-foreground';
            } else if (selectedAnswer.id === option.id) {
              btnClass += ' bg-[#fff2f2] border-danger text-danger';
            } else {
              btnClass += ' opacity-50 bg-card border-border';
            }
          } else {
            btnClass += ' bg-card hover:border-primary hover:bg-storybook-green cursor-pointer hover:-translate-y-0.5';
          }

          return (
            <button
              key={`${option.id}-${idx}`}
              onClick={() => handleAnswer(option)}
              className={btnClass}
              disabled={disabled || selectedAnswer !== null}
              type="button"
            >
              <span><span className="mr-2 font-bold opacity-50">{idx + 1}.</span> {option.meaning}</span>
              {selectedAnswer !== null && option.id === word.id && <CheckCircle className="text-primary" />}
              {selectedAnswer !== null && selectedAnswer.id === option.id && option.id !== word.id && <XCircle className="text-danger" />}
            </button>
          );
        })}
      </div>

      {onMaster && selectedAnswer === null && (
        <Button
          onClick={onMaster}
          disabled={disabled}
          variant="soft"
          className="mx-auto mt-8"
        >
          <Crown className="h-4 w-4" />
          Mình nhớ rồi
        </Button>
      )}
    </Panel>
  );
};

export default MultipleChoiceStudy;
