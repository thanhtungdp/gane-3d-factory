import { describe, expect, it } from "vitest";
import { leadSchema } from "../../src/shared/api";
import { CONSENT_VERSION } from "../../src/shared/types";

const valid = {
  sessionId: "s1",
  reportId: "r1",
  name: "Nguyễn Văn A",
  phone: "0901 234 567",
  email: "a@example.com",
  isRepresentative: true as const,
  consent: true as const,
  marketingOptIn: false,
  website: "",
};

describe("lead validation (zod)", () => {
  it("nhận lead hợp lệ", () => {
    const parsed = leadSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-v\d+$/);
  });

  it("bắt buộc consent + xác nhận người đại diện", () => {
    expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, isRepresentative: false }).success).toBe(false);
  });

  it("cần điện thoại hoặc email", () => {
    expect(leadSchema.safeParse({ ...valid, phone: undefined, email: undefined }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, phone: undefined }).success).toBe(true);
  });

  it("validate số điện thoại Việt Nam", () => {
    for (const phone of ["0901234567", "+84901234567", "091 234 5678", "035.123.4567"]) {
      expect(leadSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
    for (const phone of ["12345", "abc", "999999999999999999999"]) {
      expect(leadSchema.safeParse({ ...valid, phone }).success).toBe(false);
    }
  });

  it("validate email và chặn honeypot", () => {
    expect(leadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, website: "http://spam.example" }).success).toBe(false);
  });

  it("giới hạn độ dài tên", () => {
    expect(leadSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, name: "x".repeat(121) }).success).toBe(false);
  });
});
