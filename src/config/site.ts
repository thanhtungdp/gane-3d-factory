const env = import.meta.env;

export const site = {
  gameName: "Hành trình Sao Kim",
  gameSub: "5 trạm thắp sáng thương hiệu",
  brandName: "SAOKIM",
  brandFull: "Sao Kim Branding",
  tagline: "Thương hiệu không tự sáng. Nó được thắp từng lớp.",
  origin: (env.VITE_SITE_ORIGIN as string | undefined) ?? "http://127.0.0.1:5173",
  bookingUrl: (env.VITE_BOOKING_URL as string | undefined) || "",
  flags: {
    showPrice: (env.VITE_SHOW_PRICE as string | undefined) !== "0",
    leaderboard: (env.VITE_ENABLE_LEADERBOARD as string | undefined) !== "0",
    aiInsights: true,
  },
  contact: {
    email: "hello@saokim.vn",
    hotline: "0900 000 000",
    address: "Sao Kim Branding — TP. Hồ Chí Minh",
    website: "saokim.vn",
  },
  /** Các mốc thời lượng dùng trong copy — giữ khớp với docs/03. */
  timing: {
    totalMinutes: 8,
    landingCinematicMs: 3000,
    /** Intro lần mở đầu: tổng 10s, CTA hiện ở 8,8s. */
    introMs: 10_000,
    introCtaMs: 8800,
    introStepsMs: [0, 1800, 3700, 5600, 7400] as const,
  },
} as const;

export type SiteConfig = typeof site;
