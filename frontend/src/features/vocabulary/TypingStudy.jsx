import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Crown } from 'lucide-react';

import { levenshteinDistance } from '../../utils/stringUtils';
import { Button, Panel } from '../../components/ui/Primitives';

const TypingStudy = ({ word, onNext, onMaster, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, incorrect, typo
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setInputValue('');
    setStatus('idle');
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [word]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled || (status !== 'idle' && status !== 'typo')) return;

    const inputLower = inputValue.trim().toLowerCase();
    if (inputLower.length === 0) {
      inputRef.current?.focus();
      return;
    }

    const targetLower = word.word.trim().toLowerCase();
    const distance = levenshteinDistance(inputLower, targetLower);
    const isNearMiss = inputLower.length > 0 && (distance === 1 || (targetLower.length > 5 && distance === 2));

    if (distance === 0) {
      setStatus('correct');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(word.word);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      }
      timeoutRef.current = setTimeout(() => {
        onNext(true);
      }, 2000);
    } else if (isNearMiss) {
      setStatus('typo');
    } else {
      setStatus('incorrect');
      timeoutRef.current = setTimeout(() => {
        onNext(false);
      }, 2000);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    if (status === 'typo') {
      setStatus('idle');
    }
  };

  const inputLocked = disabled || status === 'correct' || status === 'incorrect';
  const canSubmit = !disabled && inputValue.trim().length > 0;

  return (
    <Panel className="mx-auto max-w-2xl text-center">
      <p className="mb-4 text-xl font-bold text-muted-foreground">Hãy gõ từ tiếng Anh có nghĩa là:</p>
      <h2 className="mb-12 text-4xl font-black text-primary">"{word.meaning}"</h2>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={inputLocked}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full rounded-xl border-2 p-5 text-center text-3xl font-black transition-all focus:outline-none
            ${status === 'idle' ? 'border-primary bg-card focus:border-accent' :
              status === 'correct' ? 'border-primary bg-storybook-green text-foreground' :
              status === 'typo' ? 'border-[#f2d15b] bg-[#fff9da] text-[#8a6200]' :
              'border-danger bg-[#fff2f2] text-danger'}`}
          placeholder="Gõ từ vào đây..."
        />

        {status === 'correct' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary animate-in zoom-in">
            <CheckCircle className="w-8 h-8" />
          </div>
        )}
        {status === 'incorrect' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-danger animate-in zoom-in">
            <AlertCircle className="w-8 h-8" />
          </div>
        )}

        {(status === 'idle' || status === 'typo') && (
          <Button
            type="submit"
            disabled={!canSubmit}
            size="lg"
            className="mt-8 w-full"
          >
            Kiểm tra
          </Button>
        )}

        {status === 'typo' && (
          <div className="mt-8 rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] p-5 font-bold text-[#8a6200] animate-in slide-in-from-bottom-4">
            Gần đúng rồi! Chú ý chính tả nhé.
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-8 rounded-xl border-2 border-danger bg-[#fff2f2] p-5 font-bold text-danger animate-in slide-in-from-bottom-4">
            Sai rồi! Đáp án đúng là: <strong className="text-2xl ml-2 tracking-wide font-black">{word.word}</strong>
          </div>
        )}
        {status === 'correct' && (
          <div className="mt-8 rounded-xl border-2 border-primary bg-storybook-green p-5 text-xl font-black text-foreground animate-in slide-in-from-bottom-4">
            Tuyệt vời!
          </div>
        )}
      </form>

      {(status === 'idle' || status === 'typo') && onMaster && (
        <Button
          onClick={onMaster}
          disabled={disabled}
          variant="soft"
          className="mx-auto mt-8"
        >
          <Crown className="w-4 h-4" />
          Đã thuộc
        </Button>
      )}
    </Panel>
  );
};

export default TypingStudy;
