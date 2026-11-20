// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { hasSeenIntro, markIntroSeen, readIntroPreference } from "@/lib/intro";

describe("intro preference", () => {
  it("?intro=0 bỏ qua, ?intro=1 ép xem, mặc định theo lần đầu", () => {
    localStorage.clear();
    expect(readIntroPreference("?intro=0")).toEqual({ open: false, forced: false });
    expect(readIntroPreference("?intro=1")).toEqual({ open: true, forced: true });
    expect(readIntroPreference("")).toEqual({ open: true, forced: false });
    expect(hasSeenIntro()).toBe(false);
  });

  it("đã xem thì mặc định không mở lại, nhưng ?intro=1 vẫn ép", () => {
    markIntroSeen();
    expect(hasSeenIntro()).toBe(true);
    expect(readIntroPreference("")).toEqual({ open: false, forced: false });
    expect(readIntroPreference("?intro=1")).toEqual({ open: true, forced: true });
    expect(readIntroPreference("?intro=0")).toEqual({ open: false, forced: false });
  });
});
