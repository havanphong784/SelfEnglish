import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Crown } from 'lucide-react';

import { levenshteinDistance } from '../../utils/stringUtils';

const TypingStudy = ({ word, onNext, onMaster }) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle');
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue('');
    setStatus('idle');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [word]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (status !== 'idle' && status !== 'typo') return;

    const inputLower = inputValue.trim().toLowerCase();
    const targetLower = word.word.toLowerCase();
    const distance = levenshteinDistance(inputLower, targetLower);

    if (distance === 0) {
      setStatus('correct');
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(word.word);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      }
      setTimeout(() => {
        onNext(true);
      }, 1500);
    } else if (distance === 1 || (targetLower.length > 5 && distance === 2)) {
      setStatus('typo');
    } else {
      setStatus('incorrect');
      setTimeout(() => {
        onNext(false);
      }, 1500);
    }
  };

  const inputStateClass = {
    idle: 'border-primary/35 bg-card text-foreground focus:ring-ring/25',
    typo: 'border-warning/35 bg-warning/10 text-warning focus:ring-warning/20',
    correct: 'border-primary/35 bg-primary/10 text-primary',
    incorrect: 'border-destructive/35 bg-destructive/10 text-destructive',
  }[status];

  return (
    <div className="mx-auto max-w-2xl rounded-xl surface-panel p-6 text-center md:p-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Gõ từ tiếng Anh</p>
      <p className="text-sm font-medium text-muted-foreground">Nghĩa của từ là</p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-primary md:text-5xl">"{word.meaning}"</h2>

      <form onSubmit={handleSubmit} className="relative mx-auto mt-8 max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={status === 'correct' || status === 'incorrect'}
          autoFocus
          autoComplete="off"
          className={`min-h-16 w-full rounded-lg border px-5 pr-14 text-center text-2xl font-bold outline-none transition-all focus:ring-2 md:text-3xl ${inputStateClass}`}
          placeholder="Nhập từ..."
        />

        {status === 'correct' && (
          <div className="absolute right-5 top-8 -translate-y-1/2 text-primary">
            <CheckCircle className="h-7 w-7" />
          </div>
        )}
        {status === 'incorrect' && (
          <div className="absolute right-5 top-8 -translate-y-1/2 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
        )}

        {(status === 'idle' || status === 'typo') && (
          <button
            type="submit"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground pressable hover:bg-primary/90"
          >
            Kiểm tra
          </button>
        )}

        {status === 'typo' && (
          <div className="mt-5 rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm font-bold text-warning">
            Gần đúng rồi. Sửa lại chính tả rồi kiểm tra tiếp.
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive">
            Đáp án đúng là <strong className="ml-1 font-mono text-lg">{word.word}</strong>
          </div>
        )}

        {status === 'correct' && (
          <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-bold text-primary">
            Chính xác. Từ này đã được ghi nhận.
          </div>
        )}
      </form>

      {(status === 'idle' || status === 'typo') && onMaster && (
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

export default TypingStudy;
