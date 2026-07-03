import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Crown, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const MultipleChoiceStudy = ({ word, onNext, onMaster }) => {
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const loadOptions = useCallback(async () => {
    setSelectedAnswer(null);
    try {
      let query = `/vocabularies/random?excludeId=${word.id}&limit=3`;
      if (word.partOfSpeech) query += `&partOfSpeech=${encodeURIComponent(word.partOfSpeech)}`;
      if (Array.isArray(word.synonyms) && word.synonyms.length > 0) {
        query += `&excludeSynonyms=${encodeURIComponent(word.synonyms.join(','))}`;
      }

      const distractors = await fetchWithAuth(query);
      const others = Array.isArray(distractors) ? [...distractors] : [];

      while (others.length < 3) {
        others.push({ id: `fallback-${others.length}`, meaning: `Lựa chọn bổ sung ${others.length + 1}` });
      }

      const mergedOptions = [word, ...others].sort(() => 0.5 - Math.random());
      setOptions(mergedOptions);
    } catch (error) {
      console.error('Lỗi khi tải lựa chọn:', error);
      const fallbackOptions = [
        word,
        { id: 'fallback-1', meaning: 'Lựa chọn bổ sung 1' },
        { id: 'fallback-2', meaning: 'Lựa chọn bổ sung 2' },
        { id: 'fallback-3', meaning: 'Lựa chọn bổ sung 3' },
      ].sort(() => 0.5 - Math.random());
      setOptions(fallbackOptions);
    }
  }, [word]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleAnswer = useCallback((option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);

    const isCorrect = option.id === word.id;

    if (isCorrect && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(word.word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }

    setTimeout(() => {
      onNext(isCorrect);
    }, 1200);
  }, [onNext, selectedAnswer, word]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedAnswer !== null) return;
      const key = parseInt(event.key, 10);
      if (key >= 1 && key <= 4 && options[key - 1]) {
        handleAnswer(options[key - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedAnswer, handleAnswer]);

  if (options.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl surface-panel p-8 text-center text-sm font-semibold text-muted-foreground">
        Đang tạo câu hỏi...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl surface-panel p-6 text-center md:p-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Chọn nghĩa đúng</p>
      <h2 className="mb-8 text-balance text-4xl font-bold tracking-tight text-primary md:text-6xl">{word.word}</h2>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const isCorrect = option.id === word.id;
          const isSelected = selectedAnswer?.id === option.id;
          let buttonClass = 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5';

          if (selectedAnswer !== null) {
            if (isCorrect) {
              buttonClass = 'border-primary/35 bg-primary/10 text-primary';
            } else if (isSelected) {
              buttonClass = 'border-destructive/35 bg-destructive/10 text-destructive';
            } else {
              buttonClass = 'border-border bg-card text-muted-foreground opacity-60';
            }
          }

          return (
            <button
              key={`${option.id}-${index}`}
              onClick={() => handleAnswer(option)}
              className={`flex min-h-14 items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm font-bold pressable ${buttonClass}`}
              disabled={selectedAnswer !== null}
            >
              <span className="leading-6">
                <span className="mr-3 font-mono text-xs text-muted-foreground">{index + 1}</span>
                {option.meaning}
              </span>
              {selectedAnswer !== null && isCorrect && <CheckCircle className="h-5 w-5 shrink-0 text-primary" />}
              {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
            </button>
          );
        })}
      </div>

      {onMaster && selectedAnswer === null && (
        <button
          onClick={onMaster}
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground pressable hover:border-primary/40 hover:text-primary"
        >
          <Crown className="h-4 w-4" />
          Đánh dấu đã thuộc
        </button>
      )}
    </div>
  );
};

export default MultipleChoiceStudy;
