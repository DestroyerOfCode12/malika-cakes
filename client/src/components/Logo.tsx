import React from 'react';

// SVG recreation of the Malika's Cake Boutique logo mark:
// pastel-pink ring, charcoal "M", cupcake perched on the M.
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'h-10 w-10' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    {/* White disc + pink ring (disc keeps the charcoal M legible on dark headers) */}
    <circle cx="60" cy="60" r="46" fill="#FFFFFF" stroke="#F7C8D3" strokeWidth="11" />
    {/* M */}
    <text
      x="57"
      y="82"
      textAnchor="middle"
      fontFamily="Poppins, Arial, sans-serif"
      fontWeight="800"
      fontSize="58"
      fill="#3F3F46"
    >
      M
    </text>
    {/* Cupcake perched on the M's right shoulder, like the logo */}
    <g transform="translate(76, 31) scale(1.15)" className="logo-cupcake">
      {/* cherry */}
      <circle cx="0" cy="-15" r="2.4" fill="#3F3F46" />
      {/* frosting swirl (white gap keeps it distinct from the cherry) */}
      <path
        d="M -9.5 -2 Q -9.5 -8 -5 -8 Q -5 -12 0 -12 Q 5 -12 5 -8 Q 9.5 -8 9.5 -2 Z"
        fill="#3F3F46"
        stroke="#FFFFFF"
        strokeWidth="1"
      />
      {/* liner */}
      <path d="M -8.5 -1 L 8.5 -1 L 5.5 10 L -5.5 10 Z" fill="#3F3F46" stroke="#FFFFFF" strokeWidth="1" />
      {/* liner stripes */}
      <line x1="-3.8" y1="0" x2="-2.6" y2="9" stroke="#FFFFFF" strokeWidth="1.4" />
      <line x1="3.8" y1="0" x2="2.6" y2="9" stroke="#FFFFFF" strokeWidth="1.4" />
      <line x1="0" y1="0" x2="0" y2="9.5" stroke="#FFFFFF" strokeWidth="1.4" />
    </g>
  </svg>
);

interface LogoProps {
  /** horizontal: mark + stacked text (headers). stacked: big centered lockup (hero). */
  variant?: 'horizontal' | 'stacked';
  /** invert text colors for dark backgrounds */
  onDark?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'horizontal', onDark = false, className = '' }) => {
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <LogoMark className="h-24 w-24 mb-3" />
        <span
          className={`font-script text-5xl leading-tight ${onDark ? 'text-white' : 'text-charcoal'}`}
        >
          Malika's
        </span>
        <span className="uppercase tracking-[0.45em] text-sm mt-2 text-[#EFA3B8] font-medium pl-[0.45em]">
          Cake Boutique
        </span>
        <span className="block w-16 border-t-2 border-[#F7C8D3] mt-3" />
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-script text-2xl ${onDark ? 'text-white' : 'text-charcoal'}`}>
          Malika's
        </span>
        <span className="uppercase tracking-[0.28em] text-[9px] mt-1 text-[#EFA3B8] font-medium">
          Cake Boutique
        </span>
      </span>
    </span>
  );
};

export default Logo;
