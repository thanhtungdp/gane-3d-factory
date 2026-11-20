import { useId } from "react";

/** Ngôi sao 4 cánh cam–đỏ — hình khối nhận diện chính, không cần 3D. */
export function StarGem({
  size = 220,
  className,
  glow = true,
  opacity = 1,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
  opacity?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      style={{ opacity, overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`star-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd08a" />
          <stop offset="35%" stopColor="#faa634" />
          <stop offset="72%" stopColor="#ef4123" />
          <stop offset="100%" stopColor="#b71f10" />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#faa634" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#ef4123" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ef4123" stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {glow ? <circle cx="100" cy="100" r="96" fill={`url(#halo-${uid})`} className="pulse-soft" /> : null}
      <path
        d="M100 6 C106 62 138 94 194 100 C138 106 106 138 100 194 C94 138 62 106 6 100 C62 94 94 62 100 6 Z"
        fill={`url(#star-${uid})`}
        filter={`url(#blur-${uid})`}
        opacity="0.55"
      />
      <path
        d="M100 6 C106 62 138 94 194 100 C138 106 106 138 100 194 C94 138 62 106 6 100 C62 94 94 62 100 6 Z"
        fill={`url(#star-${uid})`}
      />
      <path
        d="M100 34 C103 74 126 97 166 100 C126 103 103 126 100 166 C97 126 74 103 34 100 C74 97 97 74 100 34 Z"
        fill="#fff"
        opacity="0.2"
      />
    </svg>
  );
}
