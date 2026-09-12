"use client";

import React from "react";

interface InkLoaderProps {
  message?: string;
  submessage?: string;
  variant?: "default" | "compact" | "fullscreen";
}

export const InkLoader: React.FC<InkLoaderProps> = ({
  message = "Opening board...",
  submessage = "Preparing your infinite canvas...",
  variant = "default",
}) => {
  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-4">
        {/* Compact ink ripple animation */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-slate-400/30 animate-ping" />
          <span className="absolute inline-flex h-8 w-8 rounded-full bg-slate-600/40 animate-pulse" />
          <div className="relative w-3 h-3 rounded-full bg-slate-900 shadow-xs" />
        </div>
        {message && (
          <p className="text-xs font-medium text-neutral-600 animate-pulse tracking-wide">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        variant === "fullscreen" ? "fixed inset-0 z-50 bg-white/95 backdrop-blur-md" : "w-full py-12"
      }`}
    >
      <style>{`
        @keyframes penDipAndTap {
          0% {
            transform: translate(38px, -18px) rotate(-28deg);
          }
          18% {
            /* dipping into ink bottle */
            transform: translate(24px, 4px) rotate(-12deg);
          }
          28% {
            /* lifting up with ink */
            transform: translate(28px, -24px) rotate(-22deg);
          }
          48% {
            /* hovering over tap point */
            transform: translate(84px, -14px) rotate(-35deg);
          }
          58% {
            /* tap down */
            transform: translate(90px, 12px) rotate(-42deg);
          }
          66% {
            /* stay on tap point */
            transform: translate(90px, 11px) rotate(-42deg);
          }
          78% {
            /* lift off */
            transform: translate(82px, -18px) rotate(-32deg);
          }
          100% {
            transform: translate(38px, -18px) rotate(-28deg);
          }
        }

        @keyframes inkBlotExpand {
          0%, 54% {
            transform: scale(0);
            opacity: 0;
          }
          59% {
            transform: scale(1.1);
            opacity: 0.95;
          }
          85% {
            transform: scale(1);
            opacity: 0.85;
          }
          100% {
            transform: scale(0.6);
            opacity: 0;
          }
        }

        @keyframes rippleWave1 {
          0%, 57% {
            transform: scale(0.1);
            opacity: 0;
          }
          60% {
            opacity: 0.7;
          }
          88% {
            transform: scale(2.8);
            opacity: 0;
          }
          100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }

        @keyframes rippleWave2 {
          0%, 63% {
            transform: scale(0.1);
            opacity: 0;
          }
          67% {
            opacity: 0.55;
          }
          94% {
            transform: scale(3.8);
            opacity: 0;
          }
          100% {
            transform: scale(4.2);
            opacity: 0;
          }
        }

        @keyframes rippleWave3 {
          0%, 69% {
            transform: scale(0.1);
            opacity: 0;
          }
          73% {
            opacity: 0.35;
          }
          98% {
            transform: scale(4.8);
            opacity: 0;
          }
          100% {
            transform: scale(5.2);
            opacity: 0;
          }
        }

        @keyframes inkLevelBob {
          0%, 100% {
            transform: translateY(0);
          }
          20% {
            transform: translateY(2px);
          }
          30% {
            transform: translateY(-1px);
          }
        }

        .animate-pen-dip {
          animation: penDipAndTap 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center bottom;
        }

        .animate-ink-blot {
          animation: inkBlotExpand 3.4s ease-out infinite;
          transform-origin: center center;
        }

        .animate-ripple-1 {
          animation: rippleWave1 3.4s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
          transform-origin: center center;
        }

        .animate-ripple-2 {
          animation: rippleWave2 3.4s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
          transform-origin: center center;
        }

        .animate-ripple-3 {
          animation: rippleWave3 3.4s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
          transform-origin: center center;
        }

        .animate-ink-level {
          animation: inkLevelBob 3.4s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Canvas for Pen, Bottle, Tap Point and Expanding Ripples */}
      <div className="relative w-72 h-44 flex items-center justify-center">
        <svg
          viewBox="0 0 240 140"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ink bottle gradient */}
            <linearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#cbd5e1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="inkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="60%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="penBodyGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="nibGoldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Soft shadow filter for ink ripples */}
            <filter id="inkSpreadFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
            </filter>
          </defs>

          {/* 1. Paper baseline surface line */}
          <line
            x1="20"
            y1="116"
            x2="220"
            y2="116"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 2. Ink ripples at the tap point (center: x=142, y=116) */}
          <g transform="translate(142, 116)">
            {/* Ripple Wave 3 (outermost) */}
            <circle
              r="24"
              className="animate-ripple-3"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            {/* Ripple Wave 2 (middle) */}
            <circle
              r="17"
              className="animate-ripple-2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.6"
              strokeOpacity="0.6"
            />
            {/* Ripple Wave 1 (inner) */}
            <circle
              r="10"
              className="animate-ripple-1"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Central Ink Blot */}
            <circle
              r="4.5"
              className="animate-ink-blot"
              fill="#0f172a"
              filter="url(#inkSpreadFilter)"
            />
            <circle
              r="3"
              className="animate-ink-blot"
              fill="#1e1b4b"
            />
          </g>

          {/* 3. Ink Bottle on the left (x: 24 to 64, y: 74 to 116) */}
          <g id="ink-bottle">
            {/* Bottle shadow */}
            <ellipse cx="44" cy="116" rx="20" ry="4" fill="#cbd5e1" opacity="0.6" />

            {/* Glass body */}
            <path
              d="M 28 88 C 28 82, 36 80, 36 78 L 36 74 L 52 74 L 52 78 C 52 80, 60 82, 60 88 L 60 112 C 60 115, 56 116, 44 116 C 32 116, 28 115, 28 112 Z"
              fill="url(#glassGradient)"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />

            {/* Ink inside bottle */}
            <path
              className="animate-ink-level"
              d="M 29.5 93 C 33 92, 55 92, 58.5 93 L 58.5 112 C 58.5 114.5, 54 115, 44 115 C 34 115, 29.5 114.5, 29.5 112 Z"
              fill="url(#inkGradient)"
            />

            {/* Bottle Neck & Collar */}
            <rect
              x="35"
              y="71"
              width="18"
              height="4"
              rx="1.5"
              fill="#64748b"
              stroke="#475569"
              strokeWidth="0.8"
            />

            {/* Subtle glass reflection highlight */}
            <path
              d="M 32 90 L 32 110"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* 4. Animated Fountain Pen dipping and tapping */}
          <g className="animate-pen-dip">
            {/* Pen Shaft / Body */}
            <rect
              x="44"
              y="32"
              width="8"
              height="60"
              rx="2.5"
              fill="url(#penBodyGradient)"
              stroke="#334155"
              strokeWidth="0.8"
            />

            {/* Pen Gold Band */}
            <rect x="43.5" y="88" width="9" height="3" rx="0.5" fill="url(#nibGoldGradient)" />

            {/* Pen Section / Grip */}
            <polygon
              points="45,91 51,91 49.5,99 46.5,99"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="0.5"
            />

            {/* Gold Nib */}
            <polygon
              points="46.5,99 49.5,99 50,105 48,111 46,105"
              fill="url(#nibGoldGradient)"
              stroke="#b45309"
              strokeWidth="0.6"
            />

            {/* Nib breathing hole & slit */}
            <circle cx="48" cy="104" r="0.7" fill="#1e1b4b" />
            <line x1="48" y1="104" x2="48" y2="111" stroke="#1e1b4b" strokeWidth="0.4" />

            {/* Ink drop ready at tip */}
            <circle cx="48" cy="111" r="1.1" fill="#1e1b4b" />
          </g>
        </svg>
      </div>

      {/* Elegant Message Typography */}
      <div className="flex flex-col items-center gap-1.5 mt-2 text-center px-4 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-800 animate-ping" />
          <h3 className="text-base font-semibold tracking-tight text-neutral-800">
            {message}
          </h3>
        </div>
        {submessage && (
          <p className="text-xs text-neutral-500 font-normal">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
};
