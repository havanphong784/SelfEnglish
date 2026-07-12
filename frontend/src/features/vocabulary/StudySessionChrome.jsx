import { AlertTriangle, ArrowLeft, BookOpen, RotateCcw, Target, Trophy } from 'lucide-react';
import { Button, IconSticker, Kbd, Panel, ProgressBar } from '../../components/ui/Primitives';

export const ResumeSessionPrompt = ({ session, onResume, onDiscard, onBack }) => {
  const answeredCount = Object.keys(session?.outcomes || {}).length;
  const totalWords = session?.words?.length || 0;

  return (
    <Panel className="mx-auto mt-20 max-w-xl space-y-6 text-center">
      <IconSticker icon={RotateCcw} className="mx-auto border-primary bg-storybook-green text-primary" />
      <div>
        <h2 className="text-2xl font-black text-foreground">Tiếp tục phiên đang học?</h2>
        <p className="mx-auto mt-3 max-w-md font-bold leading-relaxed text-muted-foreground">
          Bạn còn phiên học dở với {totalWords} từ, đã làm {answeredCount} từ.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={onResume}>
          <RotateCcw className="h-4 w-4" />
          Tiếp tục
        </Button>
        <Button onClick={onDiscard} variant="secondary">
          Bắt đầu lại
        </Button>
      </div>
      <Button onClick={onBack} variant="ghost" className="mx-auto">
        <BookOpen className="h-4 w-4" />
        Kho từ
      </Button>
    </Panel>
  );
};

export const StudyLoading = () => (
  <div className="py-12 text-center font-bold text-muted-foreground">Đang chuẩn bị phiên học...</div>
);

export const StudyLoadError = ({ error, onRetry, onBack }) => (
  <Panel className="mx-auto mt-20 max-w-xl space-y-6 text-center">
    <h2 className="text-2xl font-black text-foreground">Chưa mở được phiên học</h2>
    <p className="font-bold text-muted-foreground">{error}</p>
    <div className="flex justify-center gap-3">
      <Button
        onClick={onRetry}
      >
        <RotateCcw className="h-4 w-4" />
        Thử lại
      </Button>
      <Button
        onClick={onBack}
        variant="secondary"
      >
        <BookOpen className="h-4 w-4" />
        Kho từ
      </Button>
    </div>
  </Panel>
);

export const EmptyStudyState = ({ onBack }) => (
  <Panel className="mx-auto mt-20 max-w-xl space-y-6 text-center">
    <IconSticker icon={BookOpen} className="mx-auto" />
    <h2 className="text-2xl font-black text-foreground">Không có từ nào để học</h2>
    <p className="font-bold text-muted-foreground">Có thể bạn đã học hết gói này, hoặc hôm nay chưa có từ nào cần ôn. Nice!</p>
    <Button
      onClick={onBack}
    >
      <BookOpen className="h-4 w-4" />
      Kho từ
    </Button>
  </Panel>
);

const SummaryTile = ({ label, value, detail, tone = 'default' }) => {
  const toneClass = {
    default: 'bg-card text-foreground',
    success: 'bg-storybook-green text-foreground border-primary',
    warning: 'bg-[#fff9da] text-[#8a6200] border-[#f2d15b]',
    muted: 'bg-muted text-muted-foreground border-border',
  }[tone];

  return (
    <div className={`rounded-xl border-2 p-4 ${toneClass}`}>
      <div className="se-label text-[12px] opacity-80">{label}</div>
      <div className="se-stat-value mt-2 text-[36px]">{value}</div>
      {detail && <div className="mt-1 text-xs font-semibold opacity-70">{detail}</div>}
    </div>
  );
};

export const FinishedStudy = ({ error, summary, retryCount, onRetryMissed, onPracticeAgain, onBack }) => (
  <div className="mx-auto mt-10 max-w-4xl space-y-6">
    <Panel className="text-center">
      <IconSticker icon={Trophy} className="mx-auto mb-6 h-20 w-20 border-primary bg-storybook-green text-primary" />
      <h2 className="text-3xl font-black tracking-tight text-foreground">Xong phiên học!</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
        {retryCount > 0
          ? 'Có vài từ bạn chưa chắc. Ôn lại ngay một vòng nữa là nhớ chắc hơn.'
          : 'Ổn áp. Phiên này không còn từ nào cần ôn lại.'}
      </p>
      {error && (
        <p className="mx-auto mt-5 max-w-xl rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] px-4 py-3 text-sm font-bold text-[#8a6200]">
          {error}
        </p>
      )}
    </Panel>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <SummaryTile label="Đã làm" value={summary.answered} detail={`${summary.score}% đúng nhịp`} />
      <SummaryTile label="Nhớ được" value={summary.remembered + summary.mastered} tone="success" />
      <SummaryTile label="Cần ôn lại" value={summary.needsReview} tone="warning" />
      <SummaryTile label="Bỏ qua" value={summary.skipped} tone="muted" />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      {retryCount > 0 && (
        <Button
          onClick={onRetryMissed}
        >
          <RotateCcw className="h-5 w-5" />
          Ôn lại {retryCount} từ chưa chắc
        </Button>
      )}
      {onPracticeAgain && (
        <Button
          onClick={onPracticeAgain}
          variant={retryCount > 0 ? 'secondary' : 'primary'}
        >
          <RotateCcw className="h-5 w-5" />
          Ôn tiếp 20 từ khác
        </Button>
      )}
      <Button
        onClick={onBack}
        variant="secondary"
      >
        <BookOpen className="h-5 w-5" />
        Về kho từ
      </Button>
    </div>
  </div>
);

export const StudyHeader = ({ currentIndex, totalWords, modeLabel, summary, onBack }) => {
  const progressPercent = (currentIndex / totalWords) * 100;

  return (
    <div className="mb-3 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            onClick={onBack}
            variant="secondary"
            size="icon"
            aria-label="Quay lại kho từ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="se-label text-[11px]">{modeLabel}</div>
            <h1 className="truncate text-xl font-black tracking-tight text-foreground md:text-2xl">Học từ vựng</h1>
          </div>
        </div>
        <div className="rounded-xl border-2 border-border bg-card px-4 py-1.5 text-right">
          <div className="font-secondary text-lg font-black tabular-nums text-foreground">{currentIndex + 1}/{totalWords}</div>
          <div className="se-label text-[10px]">Từ</div>
        </div>
      </div>

      <ProgressBar value={progressPercent} />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border-2 border-border bg-card px-3 py-1.5">
          <div className="font-secondary text-lg font-black tabular-nums text-foreground">{summary.remembered + summary.mastered}</div>
          <div className="se-label text-[10px]">Nhớ</div>
        </div>
        <div className="rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] px-3 py-1.5 text-[#8a6200]">
          <div className="font-secondary text-lg font-black tabular-nums">{summary.needsReview}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Ôn</div>
        </div>
        <div className="rounded-xl border-2 border-border bg-muted px-3 py-1.5 text-muted-foreground">
          <div className="font-secondary text-lg font-black tabular-nums">{summary.skipped}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Bỏ</div>
        </div>
      </div>
    </div>
  );
};

export const LevelPanel = ({ level }) => (
  <Panel className="p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="se-label text-[12px]">Mức nhớ</div>
        <div className="se-stat-value mt-1 text-[32px]">{level}</div>
      </div>
      <Target className="h-8 w-8 text-primary" />
    </div>
    <div className="mt-4 grid grid-cols-6 gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((lvl) => (
        <div
          key={lvl}
          className={`h-2 rounded-full border border-border ${lvl <= level ? 'bg-primary' : 'bg-muted'}`}
          title={`Mức ${lvl}`}
        />
      ))}
    </div>
  </Panel>
);

export const SessionLedger = ({ summary, totalWords }) => (
  <Panel className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="se-label text-[12px]">Phiên học</div>
        <div className="se-stat-value mt-1 text-[32px]">{summary.answered}</div>
      </div>
      <BookOpen className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="mt-3 space-y-2.5 text-sm font-semibold">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Đã làm</span>
        <span className="font-secondary tabular-nums">{summary.answered}/{totalWords}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Độ ổn</span>
        <span className="font-secondary tabular-nums">{summary.score}%</span>
      </div>
      <div className="flex items-center justify-between text-[#8a6200]">
        <span>Cần ôn</span>
        <span className="font-secondary tabular-nums">{summary.needsReview}</span>
      </div>
    </div>
  </Panel>
);

export const InlineError = ({ error }) => (
  <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] px-5 py-4 text-sm font-bold text-[#8a6200]">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{error}</span>
  </div>
);

export const ShortcutsPanel = () => (
  <Panel className="p-4">
    <div className="se-label mb-3 text-[12px]">Phím tắt</div>
    <div className="space-y-2.5 text-sm font-semibold text-muted-foreground">
      <div className="flex items-center justify-between">
        <span>Lật thẻ</span>
        <Kbd>Space</Kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Nhớ / Bỏ qua</span>
        <Kbd>2 / →</Kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Quên / Lùi</span>
        <Kbd>1 / ←</Kbd>
      </div>
    </div>
  </Panel>
);
