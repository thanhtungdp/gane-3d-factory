import { z } from "zod";
import { CONSENT_VERSION, PLANET_IDS } from "./types";

export const planetIdSchema = z.enum(PLANET_IDS);

export const scanRequestSchema = z
  .object({
    url: z.string().trim().max(300).optional(),
    manual: z
      .object({
        name: z.string().trim().min(1).max(120),
        website: z.string().trim().max(300).optional(),
        industry: z.string().trim().max(80).optional(),
        logoDataUrl: z.string().max(3_000_000).optional(),
      })
      .optional(),
  })
  .refine((v) => Boolean(v.url || v.manual), {
    message: "Cần website hoặc tên doanh nghiệp",
  });

export const profileAnswersSchema = z.object({
  companySize: z.enum(["1-5", "6-20", "21-50", "51-200", "200+"]),
  role: z.enum(["founder", "cmo", "brand", "other"]),
});

export const decisionRecordSchema = z.object({
  decisionId: z.string().min(1).max(80),
  optionId: z.string().min(1).max(80),
  kind: z.enum(["knowledge", "diagnosis"]),
  points: z.number().int().min(0).max(2),
  ms: z.number().int().min(0).max(600_000),
});

export const planetResultSchema = z.object({
  planet: planetIdSchema,
  score: z.number().min(0).max(10),
  knowledge: z.number().min(0).max(10),
  diagnosis: z.number().min(0).max(10),
  meter: z.number().min(0).max(10).optional(),
  decisions: z.array(decisionRecordSchema),
  skipped: z.boolean().optional(),
  completedAt: z.string(),
});

export const createSessionSchema = z.object({
  scanId: z.string().min(1).max(80),
  brand: z.object({
    name: z.string().min(1).max(120),
    domain: z.string().max(300).optional(),
    tagline: z.string().max(300).optional(),
    description: z.string().max(1000).optional(),
    industry: z.string().max(80).optional(),
    socials: z.array(z.object({ type: z.string(), url: z.string() })).max(12),
    logo: z
      .object({
        id: z.string(),
        url: z.string(),
        width: z.number(),
        height: z.number(),
        source: z.string(),
        quality: z.enum(["high", "medium", "low", "none"]),
        isMonogram: z.boolean().optional(),
      })
      .nullable(),
    logoAlternatives: z.array(z.any()).max(8).default([]),
    palette: z
      .array(
        z.object({
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          role: z.enum(["primary", "accent", "neutral"]),
          source: z.enum(["logo", "css", "theme", "manual", "fallback"]),
        }),
      )
      .min(1)
      .max(5),
  }),
  answers: profileAnswersSchema,
  preScan: z.unknown().optional(),
  consent: z.object({ accepted: z.boolean(), version: z.string() }),
});

export const saveProgressSchema = z.object({
  progress: z.object({
    currentPlanet: planetIdSchema.nullable(),
    completed: z.array(planetIdSchema).max(5),
    results: z.record(z.string(), planetResultSchema).optional(),
    decisions: z.record(z.string(), z.array(decisionRecordSchema)).optional(),
  }),
});

export const createReportSchema = z.object({
  sessionId: z.string().min(1).max(80),
  results: z.array(planetResultSchema).min(1).max(5),
  durationMs: z.number().int().min(0).max(3_600_000).optional(),
});

export const leadSchema = z
  .object({
    sessionId: z.string().min(1).max(80),
    reportId: z.string().min(1).max(80),
    name: z.string().trim().min(1, "Cần tên của bạn").max(120),
    phone: z.string().trim().max(20).optional(),
    email: z.string().trim().max(160).optional(),
    isRepresentative: z.literal(true),
    consent: z.literal(true),
    marketingOptIn: z.boolean().optional(),
    website: z.string().max(0).optional(), // honeypot: phải rỗng
  })
  .refine((v) => Boolean(v.phone || v.email), {
    message: "Cần số điện thoại hoặc email",
    path: ["phone"],
  })
  .refine(
    (v) => !v.phone || /^(0|\+84)(\d[\s.-]?){9,10}$/.test(v.phone.replace(/\s+/g, "")),
    { message: "Số điện thoại chưa đúng", path: ["phone"] },
  )
  .refine((v) => !v.email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email), {
    message: "Email chưa đúng",
    path: ["email"],
  });

export const eventBatchSchema = z.object({
  events: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        sessionId: z.string().max(80).optional(),
        planet: planetIdSchema.optional(),
        props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
        ts: z.string().optional(),
      }),
    )
    .max(30),
});

export const leaderboardSubmitSchema = z.object({
  sessionId: z.string().min(1).max(80),
  alias: z.string().trim().min(1).max(60),
  anonymous: z.boolean(),
  industry: z.string().trim().max(80).optional(),
  visible: z.boolean(),
});

export const CONSENT = { version: CONSENT_VERSION };

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type LeadPayload = z.infer<typeof leadSchema>;
export type EventBatch = z.infer<typeof eventBatchSchema>;
export type LeaderboardSubmit = z.infer<typeof leaderboardSubmitSchema>;
