import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Crown, Lightbulb, Repeat, Volume2, X } from 'lucide-react';

const ratings = [
  {
    value: false,
    label: 'Quên',
    effect: 'Cần ôn lại',
    shortcuts: ['1', '←'],
    icon: X,
    classes: 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
  },
  {
    value: true,
    label: 'Nhớ',
    effect: 'Tăng cấp',
    shortcuts: ['2', '→'],
    icon: Check,
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
  },
];

const ShortcutKey = ({ children, dark = false }) => (
  <kbd
    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 font-mono text-[11px] font-black leading-none shadow-sm ${
      dark
        ? 'border-white/20 bg-white/15 text-white'
        : 'border-border bg-white/80 text-muted-foreground'
    }`}
  >
    {children}
  </kbd>
);

const FlashcardStudy = ({ word, onNext, onMaster, disabled = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reverseMode, setReverseMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const playAudio = useCallback((event, textToPlay) => {
    event?.stopPropagation();
    const text = textToPlay || word?.word;
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [word]);

  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    if (autoPlay && !reverseMode) {
      playAudio(null, word?.word);
    }
  }, [word, autoPlay, reverseMode, playAudio]);

  useEffect(() => {
    if (isFlipped && autoPlay && reverseMode) {
      playAudio(null, word?.word);
    }
  }, [isFlipped, autoPlay, reverseMode, word, playAudio]);

  const handleAction = useCallback((payload) => {
    if (disabled) return;
    onNext(payload);
  }, [disabled, onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (!isFlipped) return;

      if (event.code === 'ArrowLeft' || event.code === 'Digit1') {
        event.preventDefault();
        handleAction(false);
      }
      if (event.code === 'ArrowRight' || event.code === 'Digit2') {
        event.preventDefault();
        handleAction(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleAction]);

  if (!word) return null;

  const audioButton = (dark = false) => (
    <button
      onClick={(event) => playAudio(event, word.word)}
      className={`absolute right-6 top-6 rounded-full p-3 transition-transform hover:scale-110 active:scale-95 md:right-8 md:top-8 md:p-4 ${
        dark ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
      title="Nghe phát âm"
      type="button"
    >
      <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );

  const englishCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white to-primary/5 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      {audioButton()}

      {word.partOfSpeech && (
        <span className="mb-6 rounded-full bg-primary px-4 py-1.5 text-xs font-bold tracking-wider text-primary-foreground shadow-md shadow-primary/20 md:text-sm">
          {word.partOfSpeech.toUpperCase()}
        </span>
      )}

      <h2 className="mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-center text-4xl font-black tracking-tight text-transparent md:text-7xl">
        {word.word}
      </h2>

      {word.ipa && (
        <p className="rounded-2xl border border-border/50 bg-white/70 px-5 py-2 font-mono text-lg font-medium text-muted-foreground shadow-sm md:text-2xl">
          {word.ipa}
        </p>
      )}

      {word.example && back && (
        <div className="mt-8 w-full max-w-xl rounded-3xl border border-primary/10 bg-primary/5 p-6 text-center shadow-sm md:p-8">
          <p className="text-lg font-medium italic leading-relaxed text-foreground md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {Array.isArray(word.synonyms) && word.synonyms.length > 0 && !back && (
        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-primary/10 bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground/80 md:text-base">
            <span className="mr-2 font-bold text-primary">Đồng nghĩa:</span>{word.synonyms.join(', ')}
          </p>
        </div>
      )}
    </div>
  );

  const meaningCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary to-indigo-600 p-8 shadow-[0_20px_50px_-12px_rgba(67,24,255,0.35)] [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      {!back && reverseMode ? null : audioButton(true)}

      <h3 className="mb-8 text-center text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
        {word.meaning}
      </h3>

      {word.example && !reverseMode && (
        <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md md:p-8">
          <p className="text-lg font-medium italic leading-relaxed text-white drop-shadow-sm md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {reverseMode && !showHint && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowHint(true);
          }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/20 px-8 py-4 font-bold text-white shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          type="button"
        >
          <Lightbulb className="h-6 w-6 text-yellow-300 drop-shadow-sm" />
          Gợi ý
        </button>
      )}

      {reverseMode && showHint && (
        <div className="mt-4 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-inner backdrop-blur-md">
          <p className="font-mono text-3xl font-bold tracking-[0.4em] text-white drop-shadow-md md:text-4xl">
            {word.word[0].toUpperCase()}{Array(Math.max(word.word.length - 1, 0)).fill('_').join(' ')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center py-4">
      <div className="mb-8 flex w-full items-center justify-between gap-3 px-1 sm:px-4">
        <button
          onClick={() => setReverseMode((prev) => !prev)}
          className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
            reverseMode ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          type="button"
        >
          <Repeat className="h-4 w-4" />
          {reverseMode ? 'Nghĩa -> từ' : 'Từ -> nghĩa'}
        </button>

        <button
          onClick={() => setAutoPlay((prev) => !prev)}
          className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
            autoPlay ? 'border border-primary/20 bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
          type="button"
        >
          <Volume2 className={`h-4 w-4 ${!autoPlay ? 'opacity-50' : ''}`} />
          Tự đọc: {autoPlay ? 'Bật' : 'Tắt'}
        </button>
      </div>

      <div
        className="group relative mb-8 aspect-[4/3] w-full cursor-pointer [perspective:1200px] md:aspect-[16/9]"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <motion.div
          className="h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 220, damping: 22 }}
        >
          {reverseMode ? meaningCard(false) : englishCard(false)}
          {reverseMode ? englishCard(true) : meaningCard(true)}
        </motion.div>
      </div>

      <div className="flex min-h-[120px] w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.button
              key="flip-action"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setIsFlipped(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
              type="button"
            >
              <Repeat className="h-4 w-4" />
              Lật thẻ
              <ShortcutKey>Space</ShortcutKey>
            </motion.button>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-6"
            >
              <div className="grid w-full max-w-2xl grid-cols-2 gap-3 md:gap-4">
                {ratings.map((rating) => {
                  const Icon = rating.icon;
                  return (
                    <button
                      key={String(rating.value)}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAction(rating.value);
                      }}
                      disabled={disabled}
                      className={`group flex min-h-[96px] items-center gap-3 rounded-2xl border-2 p-3 font-bold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${rating.classes}`}
                      type="button"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-col items-start">
                        <span className="text-base md:text-lg">{rating.label}</span>
                        <span className="text-xs font-medium opacity-70">{rating.effect}</span>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-1">
                        {rating.shortcuts.map((shortcut) => (
                          <ShortcutKey key={shortcut}>{shortcut}</ShortcutKey>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAction({ action: 'prev' });
                  }}
                  disabled={disabled}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Lùi
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAction({ action: 'next' });
                  }}
                  disabled={disabled}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                  type="button"
                >
                  Bỏ qua
                  <ChevronRight className="h-4 w-4" />
                </button>

                {onMaster && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onMaster();
                    }}
                    disabled={disabled}
                    className="flex min-h-10 items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-5 py-2.5 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-100 disabled:cursor-wait disabled:opacity-60"
                    type="button"
                  >
                    <Crown className="h-4 w-4" />
                    Đã thuộc
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlashcardStudy;
