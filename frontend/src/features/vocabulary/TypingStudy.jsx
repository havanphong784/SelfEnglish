import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Crown } from 'lucide-react';

import { levenshteinDistance } from '../../utils/stringUtils';

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
    <div className="bg-card border-2 border-border rounded-3xl p-10 shadow-sm text-center max-w-2xl mx-auto">
      <p className="text-muted-foreground mb-4 text-xl">Hãy gõ từ tiếng Anh có nghĩa là:</p>
      <h2 className="text-4xl font-bold text-primary mb-12">"{word.meaning}"</h2>

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
          className={`w-full text-center text-3xl p-5 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all shadow-sm
            ${status === 'idle' ? 'border-primary/50 focus:border-primary focus:ring-primary/20 bg-card' :
              status === 'correct' ? 'border-green-500 bg-green-500/10 text-green-700' :
              status === 'typo' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-700 focus:ring-yellow-500/20' :
              'border-red-500 bg-red-500/10 text-red-700'}`}
          placeholder="Gõ từ vào đây..."
        />

        {status === 'correct' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-green-600 animate-in zoom-in">
            <CheckCircle className="w-8 h-8" />
          </div>
        )}
        {status === 'incorrect' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-red-600 animate-in zoom-in">
            <AlertCircle className="w-8 h-8" />
          </div>
        )}

        {(status === 'idle' || status === 'typo') && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-8 w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-md disabled:cursor-wait disabled:opacity-60"
          >
            Kiểm tra
          </button>
        )}

        {status === 'typo' && (
          <div className="mt-8 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-700 font-medium animate-in slide-in-from-bottom-4">
            Gần đúng rồi! Chú ý chính tả nhé.
          </div>
        )}

        {status === 'incorrect' && (
          <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 font-medium animate-in slide-in-from-bottom-4">
            Sai rồi! Đáp án đúng là: <strong className="text-2xl ml-2 tracking-wide font-black">{word.word}</strong>
          </div>
        )}
        {status === 'correct' && (
          <div className="mt-8 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-700 font-medium animate-in slide-in-from-bottom-4 text-xl">
            Tuyệt vời!
          </div>
        )}
      </form>

      {(status === 'idle' || status === 'typo') && onMaster && (
        <button
          onClick={onMaster}
          disabled={disabled}
          className="mt-8 flex items-center justify-center gap-2 mx-auto px-6 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-full font-bold transition-colors text-sm hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          type="button"
        >
          <Crown className="w-4 h-4" />
          Đã thuộc
        </button>
      )}
    </div>
  );
};

export default TypingStudy;
