import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

function cx(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function PageShell({ children, className, ...props }: PropsWithChildren<DivProps>) {
  return (
    <div className={cx('ui-page-shell', className)} {...props}>
      {children}
    </div>
  );
}

export function Card({ children, className, ...props }: PropsWithChildren<DivProps>) {
  return (
    <section className={cx('ui-card', className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ children, className, ...props }: PropsWithChildren<DivProps>) {
  return (
    <div className={cx('ui-card-header', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: PropsWithChildren<DivProps>) {
  return (
    <h3 className={cx('ui-card-title', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: PropsWithChildren<DivProps>) {
  return (
    <p className={cx('ui-card-description', className)} {...props}>
      {children}
    </p>
  );
}

export function Button({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx('ui-button', className)} type={type} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx('ui-input', className)} {...props} />;
}

export function Badge({ children, className, tone = 'default' }: PropsWithChildren<{ className?: string; tone?: 'default' | 'success' | 'warning' | 'danger'; }>) {
  return <span className={cx('ui-badge', `ui-badge--${tone}`, className)}>{children}</span>;
}

export function Stat({ label, value, helper }: { label: string; value: ReactNode; helper?: ReactNode }) {
  return (
    <div className="ui-stat">
      <span className="ui-stat-label">{label}</span>
      <strong className="ui-stat-value">{value}</strong>
      {helper ? <span className="ui-stat-helper">{helper}</span> : null}
    </div>
  );
}
