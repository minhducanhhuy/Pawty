import React, { useEffect, useState } from 'react';
import { PawtyAnimatedLogo } from './PawtyAnimatedLogo';

export interface AppSplashScreenProps {
  /** Called when the splash screen finishes its intro animation and fades out */
  onFinish: () => void;
  /** Duration in milliseconds before initiating fade-out (default: 2300ms) */
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  durationMs = 2300,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar update over duration
    const intervalTime = 40;
    const step = 100 / (durationMs / intervalTime);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Trigger fade-out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs);

    // Complete after fade-out transition
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs + 450);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 250);
  };

  return (
    <div
      onClick={handleSkip}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-between p-8 select-none transition-all duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#FDFBF7',
        backgroundImage:
          'radial-gradient(circle at 50% 35%, rgba(255, 111, 97, 0.08) 0%, rgba(163, 228, 215, 0.12) 60%, transparent 100%)',
      }}
    >
      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
        >
          Bỏ qua
        </button>
      </div>

      {/* Center: Animated Hero Logo with Watercolor Reveal */}
      <div className="flex flex-col items-center justify-center -mt-8">
        <PawtyAnimatedLogo
          size="xl"
          withReveal
          withAura
          withFloat
          withTagline
        />
      </div>

      {/* Bottom: Warm Loading Indicator */}
      <div className="w-full max-w-[220px] flex flex-col items-center gap-3 pb-6">
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${Math.min(100, progress)}%`,
              backgroundColor: '#FF6F61',
            }}
          />
        </div>
        <p className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">
          Đang kết nối cộng đồng Boss...
        </p>
      </div>
    </div>
  );
};

