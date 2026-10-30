import React from 'react';

export interface PawtyAnimatedLogoProps {
  /** Size preset or pixel dimension */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Whether to trigger the watercolor brush bloom reveal on mount */
  withReveal?: boolean;
  /** Whether to display the soft pastel watercolor background glow */
  withAura?: boolean;
  /** Whether the entire logo gently breathes/floats */
  withFloat?: boolean;
  /** Whether to show the official slogan underneath */
  withTagline?: boolean;
  /** Optional custom className */
  className?: string;
  /** Optional click event */
  onClick?: () => void;
}

export const PawtyAnimatedLogo: React.FC<PawtyAnimatedLogoProps> = ({
  size = 'md',
  withReveal = false,
  withAura = false,
  withFloat = false,
  withTagline = false,
  className = '',
  onClick,
}) => {
  // Determine width based on size prop (aspect ratio is 1024 / 764 = 1.34)
  const getDimensions = () => {
    if (typeof size === 'number') {
      return { width: size, height: Math.round(size / 1.34) };
    }
    switch (size) {
      case 'sm':
        return { width: 56, height: 42 };
      case 'md':
        return { width: 120, height: 90 };
      case 'lg':
        return { width: 190, height: 142 };
      case 'xl':
        return { width: 260, height: 194 };
      default:
        return { width: 120, height: 90 };
    }
  };

  const { width, height } = getDimensions();

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className={`relative flex items-center justify-center ${
          withFloat ? 'animate-pawty-float' : ''
        } ${withReveal ? 'animate-pawty-reveal' : ''}`}
        style={{
          width,
          height,
        }}
      >
        {/* Soft Watercolor Pastel Aura Glow */}
        {withAura && (
          <div
            className="absolute inset-0 -m-6 rounded-full blur-2xl pointer-events-none animate-pawty-aura"
            style={{
              background:
                'radial-gradient(circle, rgba(255,111,97,0.22) 0%, rgba(163,228,215,0.25) 55%, transparent 75%)',
            }}
          />
        )}

        {/* 1024x764 Canvas Container maintaining perfect alignment */}
        <div
          className="relative w-full h-full"
          style={{ aspectRatio: '1024 / 764' }}
        >
          {/* Layer 1: Pawty Lettering Body (P, a, w, t, and bottom hook of y) */}
          <img
            src="/assets/pawty-logo-body.png"
            alt="Pawty Logo Body"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xs"
            draggable={false}
          />

          {/* Layer 2: Joyful Dog Tail (Right stroke of 'y') with exact natural pivot */}
          <img
            src="/assets/pawty-logo-tail.png"
            alt="Pawty Dog Tail"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pawty-tail drop-shadow-xs"
            draggable={false}
          />

          {/* Layer 3: Left Mint Motion Waves (( */}
          <img
            src="/assets/pawty-logo-waves-left.png"
            alt="Pawty Left Waves"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pawty-waves-left"
            draggable={false}
          />

          {/* Layer 4: Right Mint Motion Waves )) */}
          <img
            src="/assets/pawty-logo-waves-right.png"
            alt="Pawty Right Waves"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pawty-waves-right"
            draggable={false}
          />
        </div>
      </div>

      {/* Official Slogan */}
      {withTagline && (
        <div className="text-center mt-3 animate-fade-in">
          <p
            style={{ color: '#FF6F61' }}
            className="text-sm font-black tracking-tight font-display"
          >
            Những bàn chân nhỏ đang tới
          </p>
          <p
            style={{ color: '#718096' }}
            className="text-[11px] font-semibold mt-0.5 tracking-wide"
          >
            Mạng xã hội và kết nối người nuôi thú cưng
          </p>
        </div>
      )}
    </div>
  );
};

