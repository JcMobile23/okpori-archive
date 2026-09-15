import React from 'react';
import { TriangleAlert, RefreshCw, Monitor } from 'lucide-react';

export const BoundaryFallback = ({
  title,
  detail,
  onRetry,
  onDegrade,
  degradeLabel,
  icon,
}) => {
  return (
    <div className="relative w-full min-h-[300px] flex items-center justify-center bg-charcoal border border-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-lg mx-auto px-8 py-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
            {icon ?? <TriangleAlert className="w-8 h-8 text-gold" strokeWidth={1.5} />}
          </div>
        </div>
        <h3 className="text-gold font-serif text-2xl md:text-3xl tracking-wider mb-4">
          {title}
        </h3>
        {detail && (
          <p className="text-parchment/50 font-serif italic text-sm md:text-base leading-relaxed mb-8">
            {detail}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="group relative px-8 py-3 bg-gold/5 border border-gold/40 text-gold uppercase tracking-[0.25em] text-[10px] font-sans font-medium hover:bg-gold hover:text-black transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:animate-spin" />
              Reload
            </button>
          )}
          {onDegrade && (
            <button
              onClick={onDegrade}
              className="group relative px-8 py-3 border border-gold/20 text-parchment/70 uppercase tracking-[0.25em] text-[10px] font-sans font-medium hover:border-gold hover:text-gold transition-all flex items-center gap-2"
            >
              <Monitor className="w-3.5 h-3.5" />
              {degradeLabel ?? 'Use 2D Mode'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Okpori Boundary] Uncaught render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback, fallbackTitle, fallbackDetail, onRetry, onDegrade, degradeLabel } = this.props;

    if (typeof fallback === 'function') {
      return fallback({
        error: this.state.error,
        reset: this.handleReset,
        retry: onRetry,
        degrade: onDegrade,
      });
    }

    return (
      <BoundaryFallback
        title={fallbackTitle ?? 'Something interrupted this view'}
        detail={fallbackDetail ?? 'Your device may lack hardware acceleration for this experience.'}
        onRetry={onRetry ? () => { this.handleReset(); onRetry?.(); } : this.handleReset}
        onDegrade={onDegrade}
        degradeLabel={degradeLabel}
      />
    );
  }
}

export default ErrorBoundary;
