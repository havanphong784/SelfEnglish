import { cn } from '../../lib/utils';

const buttonSizes = {
  sm: 'se-button-sm',
  md: 'se-button-md',
  lg: 'se-button-lg',
  icon: 'se-button-icon',
};

const buttonVariants = {
  primary: 'se-button-primary',
  secondary: 'se-button-secondary',
  soft: 'se-button-soft',
  ghost: 'se-button-ghost',
  danger: 'se-button-danger',
  warning: 'se-button-warning',
};

const buttonClass = ({ variant = 'primary', size = 'md', className = '' } = {}) => (
  cn('se-button', buttonVariants[variant], buttonSizes[size], className)
);

export const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type,
  ...props
}) => (
  <Component
    className={buttonClass({ variant, size, className })}
    type={Component === 'button' ? (type || 'button') : undefined}
    {...props}
  />
);

export const Panel = ({ as: Component = 'section', className, children, ...props }) => (
  <Component className={cn('se-panel', className)} {...props}>
    {children}
  </Component>
);

export const Badge = ({ children, tone = 'muted', className }) => {
  const tones = {
    muted: 'border-border bg-card text-muted-foreground',
    green: 'border-primary bg-storybook-green text-foreground',
    blue: 'border-accent bg-white text-accent',
    warning: 'border-[#f2d15b] bg-[#fff9da] text-[#8a6200]',
    danger: 'border-[#ffc9c9] bg-[#fff2f2] text-danger',
    ink: 'border-night-ink bg-night-ink text-white',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1 text-xs font-black uppercase tracking-[0.08em]', tones[tone], className)}>
      {children}
    </span>
  );
};

export const IconSticker = ({ icon: Icon, className, children }) => (
  <span className={cn('se-icon-sticker', className)}>
    {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : children}
  </span>
);

export const PageHeader = ({ eyebrow, icon: Icon, title, highlight, description, action, className }) => (
  <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
    <div className="min-w-0">
      {eyebrow && (
        <div className="se-eyebrow mb-3">
          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
          {eyebrow}
        </div>
      )}
      <h1 className="se-page-title">
        {title}
        {highlight && <span className="text-primary"> {highlight}</span>}
      </h1>
      {description && <p className="se-body mt-3 max-w-2xl">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const StatCard = ({ label, value, detail, icon: Icon, tone = 'default', className }) => {
  const tones = {
    default: 'bg-card text-foreground',
    green: 'bg-storybook-green text-foreground border-primary',
    blue: 'bg-white text-accent border-accent',
    warning: 'bg-[#fff9da] text-[#8a6200] border-[#f2d15b]',
    danger: 'bg-[#fff2f2] text-danger border-[#ffc9c9]',
    ink: 'bg-night-ink text-white border-night-ink',
  };

  return (
    <div className={cn('se-panel flex min-h-[148px] flex-col justify-between', tones[tone], className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="se-label opacity-80">{label}</div>
        {Icon && <IconSticker icon={Icon} className={tone === 'ink' ? 'border-white/60 bg-white text-night-ink' : ''} />}
      </div>
      <div>
        <div className={cn('se-stat-value mt-5', tone === 'ink' && 'text-white')}>{value}</div>
        {detail && <div className="mt-2 text-sm font-extrabold opacity-75">{detail}</div>}
      </div>
    </div>
  );
};

export const ProgressBar = ({ value = 0, className, barClassName, title }) => {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={cn('se-progress', className)} title={title}>
      <div className={cn('se-progress-fill', barClassName)} style={{ width: `${safeValue}%` }} />
    </div>
  );
};

export const Kbd = ({ children, className }) => (
  <kbd className={cn('inline-flex h-6 min-w-6 items-center justify-center rounded-md border-2 border-border bg-white px-1.5 font-mono text-[11px] font-black leading-none text-muted-foreground', className)}>
    {children}
  </kbd>
);
