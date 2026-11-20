import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function svgProps({ size = 20, ...props }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const IconArrowRight = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconLock = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14.5v2" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="m5 12.5 4.5 4.5L19 6.5" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconVolume = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4Z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
);

export const IconVolumeOff = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4Z" />
    <path d="m16.5 9.5 5 5M21.5 9.5l-5 5" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3v12M7 10.5l5 5 5-5M5 20h14" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="3.5" y="5" width="17" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M14 14h2M8 17.5h2" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3l7.5 3v6c0 4.6-3 7.6-7.5 9C7.5 19.6 4.5 16.6 4.5 12V6L12 3Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 2.5c.6 5.3 3.2 7.9 8.5 8.5-5.3.6-7.9 3.2-8.5 8.5-.6-5.3-3.2-7.9-8.5-8.5 5.3-.6 7.9-3.2 8.5-8.5Z" />
    <path d="M19 16.5c.2 1.7 1 2.5 2.7 2.7-1.7.2-2.5 1-2.7 2.7-.2-1.7-1-2.5-2.7-2.7 1.7-.2 2.5-1 2.7-2.7Z" />
  </svg>
);

export const IconScan = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16" />
  </svg>
);

export const IconRocket = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M12 3c3.5 2 5 5.5 5 9.5L12 18l-5-5.5C7 8.5 8.5 5 12 3Z" />
    <circle cx="12" cy="9.5" r="1.7" />
    <path d="M9 16c-1.6.8-2.4 2.1-2.5 4.5 2.4-.1 3.7-.9 4.5-2.5M15 16c1.6.8 2.4 2.1 2.5 4.5-2.4-.1-3.7-.9-4.5-2.5" />
  </svg>
);

export const IconMap = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2" />
    <circle cx="12" cy="12" r="8.7" strokeDasharray="2 4" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M20 11a8 8 0 1 0-2.3 6.3M20 4.5V11h-6.5" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M19 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5H10" />
  </svg>
);

export const IconFile = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9l-6-6Z" />
    <path d="M13 3v6h6M8.5 13h7M8.5 17h5" />
  </svg>
);

export const IconStar = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.6l6.7-.9L12 2.6Z" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconInfo = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </svg>
);

export const IconLoader = (p: P) => (
  <svg {...svgProps(p)} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...svgProps(p)}>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.7" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z" />
  </svg>
);
