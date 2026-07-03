import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, Gauge, Lightbulb, Repeat, Volume2, X, Zap } from 'lucide-react';

const ratings = [
  {
    value: 'again',
    label: 'Lại',
    hint: '1 / ←',
    icon: X,
    classes: 'border-destructive/20 bg-destructive/10 text-destructive hover:border-destructive/35',
    iconClasses: 'bg-destructive/12',
  },
  {
    value: 'hard',
    label: 'Khó',
    hint: '2',
    icon: Gauge,
    classes: 'border-warning/20 bg-warning/10 text-warning hover:border-warning/35',
    iconClasses: 'bg-warning/12',
  },
  {
    value: 'good',
    label: 'Ổn',
    hint: '3 / →',
    icon: Check,
    classes: 'border-primary/20 bg-primary/10 text-primary hover:border-primary/35',
    iconClasses: 'bg-primary/12',
  },
  {
    value: 'easy',
    label: 'Dễ',
    hint: '4',
    icon: Zap,
    classes: 'border-foreground/10 bg-card text-foreground hover:border-primary/35',
    iconClasses: 'bg-muted',
  },
];

const FlashcardStudy = ({ word, onNext, onMaster }) => {
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

  const handleAction = useCallback((rating) => {
    onNext({ rating });
  }, [onNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.code === 'Space') {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (!isFlipped) return;

      if (event.code === 'ArrowLeft' || event.code === 'Digit1') handleAction('again');
      if (event.code === 'Digit2') handleAction('hard');
      if (event.code === 'ArrowRight' || event.code === 'Digit3') handleAction('good');
      if (event.code === 'Digit4') handleAction('easy');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleAction]);

  if (!word) return null;

  const audioButton = (dark = false) => (
    <button
      onClick={(event) => playAudio(event, word.word)}
      className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-lg pressable md:right-6 md:top-6 ${
        dark ? 'bg-white/12 text-white hover:bg-white/20' : 'bg-primary/10 text-primary hover:bg-primary/15'
      }`}
      title="Nghe phát âm"
      aria-label="Nghe phát âm"
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );

  const englishCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl surface-panel p-8 text-center [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="absolute inset-0 -z-10 learning-lines opacity-60" />
      {audioButton()}

      {word.partOfSpeech && (
        <span className="mb-6 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {word.partOfSpeech}
        </span>
      )}

      <h2 className="mb-5 max-w-full text-balance text-4xl font-bold tracking-tight text-foreground md:text-7xl">
        {word.word}
      </h2>

      {word.ipa && (
        <p className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-base font-semibold text-muted-foreground md:text-xl">
          {word.ipa}
        </p>
      )}

      {word.example && back && (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-pretty text-lg font-medium italic leading-8 text-foreground md:text-2xl">
            "{word.example}"
          </p>
        </div>
      )}

      {word.synonyms && !back && (
        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-border bg-card/80 p-4 text-sm font-medium text-muted-foreground backdrop-blur">
          <span className="font-bold text-primary">Synonyms:</span> {word.synonyms}
        </div>
      )}
    </div>
  );

  const meaningCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-foreground bg-foreground p-8 text-center text-background shadow-[0_18px_50px_-30px_rgba(29,33,31,0.7)] [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.07] learning-lines" />
      {!back && reverseMode ? null : audioButton(true)}

      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-background/55">Nghĩa</p>
      <h3 className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-background md:text-5xl">
        {word.meaning}
      </h3>

      {word.example && !reverseMode && (
        <div className="mt-8 max-w-2xl border-t border-background/15 pt-6">
          <p className="text-pretty text-lg font-medium italic leading-8 text-background/85 md:text-2xl">
            "{word.example}"
          </p>
        </div>
      )}

      {reverseMode && !showHint && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowHint(true);
          }}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-background/20 bg-background/10 px-5 text-sm font-bold text-background pressable hover:bg-background/15"
        >
          <Lightbulb className="h-4 w-4" />
          Gợi ý
        </button>
      )}

      {reverseMode && showHint && (
        <div className="mt-6 rounded-lg border border-background/20 bg-background/10 px-5 py-4">
          <p className="font-mono text-2xl font-bold tracking-[0.28em] text-background md:text-4xl">
            {word.word[0].toUpperCase()}{Array(word.word.length - 1).fill('_').join(' ')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="mb-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setReverseMode((prev) => !prev)}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold pressable ${
            reverseMode ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground hover:border-primary/40'
          }`}
        >
          <Repeat className="h-4 w-4" />
          {reverseMode ? 'Nghĩa sang từ' : 'Từ sang nghĩa'}
        </button>

        <button
          onClick={() => setAutoPlay((prev) => !prev)}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold pressable ${
            autoPlay ? 'bg-primary/10 text-primary' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <Volume2 className="h-4 w-4" />
          Tự phát âm: {autoPlay ? 'Bật' : 'Tắt'}
        </button>
      </div>

      <div
        className="group relative mb-8 aspect-[4/3] w-full cursor-pointer [perspective:1200px] md:aspect-[16/9]"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <motion.div
          className="h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.58, type: 'spring', stiffness: 180, damping: 22 }}
        >
          {reverseMode ? meaningCard(false) : englishCard(false)}
          {reverseMode ? englishCard(true) : meaningCard(true)}
        </motion.div>
      </div>

      <div className="flex min-h-[112px] w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="flip-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              Nhấn <kbd className="mx-1 rounded-md border border-border bg-card px-2 py-1 font-mono text-xs font-bold text-foreground">Space</kbd>
              hoặc chạm vào thẻ để lật.
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-5"
            >
              <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
                {ratings.map((rating) => {
                  const Icon = rating.icon;
                  return (
                    <button
                      key={rating.value}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAction(rating.value);
                      }}
                      className={`group flex min-h-[88px] items-center gap-3 rounded-lg border p-3 text-left font-bold pressable ${rating.classes}`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${rating.iconClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-base">{rating.label}</span>
                        <span className="text-xs font-medium opacity-70">{rating.hint}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onMaster && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onMaster();
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground pressable hover:border-primary/40 hover:text-primary"
                >
                  <Crown className="h-4 w-4" />
                  Đánh dấu đã thuộc
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlashcardStudy;
