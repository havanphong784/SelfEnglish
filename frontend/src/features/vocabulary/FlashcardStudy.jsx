import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Crown, Lightbulb, Repeat, Volume2, X } from 'lucide-react';
import { Button, Kbd } from '../../components/ui/Primitives';

const ratings = [
  {
    value: false,
    label: 'Quên',
    effect: 'Cần ôn lại',
    shortcuts: ['1', '←'],
    icon: X,
    classes: 'border-[#ffc9c9] bg-[#fff2f2] text-danger hover:border-danger',
  },
  {
    value: true,
    label: 'Nhớ',
    effect: 'Tăng cấp',
    shortcuts: ['2', '→'],
    icon: Check,
    classes: 'border-primary bg-storybook-green text-foreground hover:bg-fresh-leaf',
  },
];

const ShortcutKey = ({ children, dark = false }) => (
  <Kbd className={dark ? 'border-white bg-white text-night-ink' : ''}>{children}</Kbd>
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
      className={`absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-transform hover:scale-105 active:scale-95 md:right-8 md:top-8 ${
        dark ? 'border-white bg-white text-night-ink' : 'border-primary bg-storybook-green text-primary'
      }`}
      title="Nghe phát âm"
      type="button"
    >
      <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );

  const englishCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-border bg-card p-8 [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      {audioButton()}

      {word.partOfSpeech && (
        <span className="mb-6 rounded-xl border-2 border-primary bg-primary px-4 py-1.5 text-xs font-bold tracking-wider text-primary-foreground md:text-sm">
          {word.partOfSpeech.toUpperCase()}
        </span>
      )}

      <h2 className="mb-6 text-center font-secondary text-4xl font-black tracking-tight text-foreground md:text-7xl">
        {word.word}
      </h2>

      {word.ipa && (
        <p className="rounded-xl border-2 border-border bg-muted px-5 py-2 font-mono text-lg font-bold text-muted-foreground md:text-2xl">
          {word.ipa}
        </p>
      )}

      {word.example && back && (
        <div className="mt-8 w-full max-w-xl rounded-xl border-2 border-primary bg-storybook-green p-6 text-center md:p-8">
          <p className="text-lg font-bold italic leading-relaxed text-foreground md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {Array.isArray(word.synonyms) && word.synonyms.length > 0 && !back && (
        <div className="absolute bottom-8 left-8 right-8 rounded-xl border-2 border-border bg-white p-4 text-center">
          <p className="text-sm font-medium text-foreground/80 md:text-base">
            <span className="mr-2 font-bold text-primary">Đồng nghĩa:</span>{word.synonyms.join(', ')}
          </p>
        </div>
      )}
    </div>
  );

  const meaningCard = (back = false) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-primary bg-primary p-8 [backface-visibility:hidden] md:p-12"
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      {!back && reverseMode ? null : audioButton(true)}

      <h3 className="mb-8 text-center text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
        {word.meaning}
      </h3>

      {word.example && !reverseMode && (
        <div className="w-full max-w-xl rounded-xl border-2 border-white bg-white/15 p-6 text-center md:p-8">
          <p className="text-lg font-bold italic leading-relaxed text-white md:text-2xl">"{word.example}"</p>
        </div>
      )}

      {reverseMode && !showHint && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowHint(true);
          }}
          className="mt-6 flex items-center gap-3 rounded-xl border-2 border-white bg-white/15 px-8 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          type="button"
        >
          <Lightbulb className="h-6 w-6 text-[#fff9da]" />
          Gợi ý
        </button>
      )}

      {reverseMode && showHint && (
        <div className="mt-4 rounded-xl border-2 border-white bg-white/15 p-6">
          <p className="font-mono text-3xl font-bold tracking-[0.4em] text-white md:text-4xl">
            {word.word[0].toUpperCase()}{Array(Math.max(word.word.length - 1, 0)).fill('_').join(' ')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center py-4">
      <div className="mb-8 flex w-full items-center justify-between gap-3 px-1 sm:px-4">
        <Button
          onClick={() => setReverseMode((prev) => !prev)}
          variant={reverseMode ? 'primary' : 'secondary'}
          size="sm"
        >
          <Repeat className="h-4 w-4" />
          {reverseMode ? 'Nghĩa -> từ' : 'Từ -> nghĩa'}
        </Button>

        <Button
          onClick={() => setAutoPlay((prev) => !prev)}
          variant={autoPlay ? 'soft' : 'secondary'}
          size="sm"
        >
          <Volume2 className={`h-4 w-4 ${!autoPlay ? 'opacity-50' : ''}`} />
          Tự đọc: {autoPlay ? 'Bật' : 'Tắt'}
        </Button>
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
              className="se-button se-button-secondary se-button-md"
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
                      className={`group flex min-h-[96px] items-center gap-3 rounded-xl border-2 p-3 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${rating.classes}`}
                      type="button"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-current bg-white/60">
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
                  className="se-button se-button-secondary se-button-sm disabled:cursor-wait disabled:opacity-60"
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
                  className="se-button se-button-secondary se-button-sm disabled:cursor-wait disabled:opacity-60"
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
                    className="se-button se-button-soft se-button-sm disabled:cursor-wait disabled:opacity-60"
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
