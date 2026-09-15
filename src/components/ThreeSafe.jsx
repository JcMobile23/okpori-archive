import React, { Suspense } from 'react';
import ErrorBoundary, { BoundaryFallback } from './ErrorBoundary';

const Spinner = ({ label }) => (
  <div className="relative w-full min-h-[300px] flex items-center justify-center bg-charcoal overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)] pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border border-gold/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        <div className="absolute inset-2 rounded-full border border-transparent border-b-gold/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
        </div>
      </div>
      <div className="text-gold/70 uppercase tracking-[0.35em] text-[10px] font-sans font-light animate-pulse">
        {label ?? 'Conjuring the Ancestral Realm'}
      </div>
      <div className="flex gap-1.5 opacity-70">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gold/60"
            style={{ animation: `okp-bounce 1.1s ${i * 0.18}s infinite ease-in-out` }}
          />
        ))}
      </div>
      <style>
        {`@keyframes okp-bounce { 0%,80%,100% { transform: scale(0.4); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }`}
      </style>
    </div>
  </div>
);

const ThreeSafe = ({
  children,
  boundaryTitle,
  boundaryDetail,
  onRetry,
  onDegrade,
  degradeLabel,
  suspenseLabel,
}) => {
  return (
    <ErrorBoundary
      fallbackTitle={boundaryTitle}
      fallbackDetail={boundaryDetail}
      onRetry={onRetry}
      onDegrade={onDegrade}
      degradeLabel={degradeLabel}
      fallback={onDegrade
        ? ({ error, retry, degrade }) => {
            void error;
            void retry;
            return (
              <BoundaryFallback
                title={boundaryTitle ?? '3D unavailable on this device'}
                detail={boundaryDetail ?? 'Switching to the lightweight 2D experience.'}
                onDegrade={degrade ?? onDegrade}
                degradeLabel={degradeLabel ?? 'Use 2D Mode'}
                onRetry={retry ?? onRetry}
              />
            );
          }
        : undefined}
    >
      <Suspense fallback={<Spinner label={suspenseLabel} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ThreeSafe;
