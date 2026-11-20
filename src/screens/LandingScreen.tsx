import { useState } from "react";
import { BrandMark, LogoImage } from "@/ui/Brand";
import { Button } from "@/ui/Controls";
import { IconArrowRight, IconClose, IconGlobe, IconRefresh } from "@/ui/Icons";
import { StarGem } from "@/ui/StarGem";
import { PlanetOrb } from "@/ui/PlanetOrb";
import { PLANET_ORDER } from "@/shared/planets";
import type { RunSnapshot } from "@/lib/storage";
import { prettyDomain } from "@/lib/urls";
import { site } from "@/config/site";

export function LandingScreen({
  demo,
  resume,
  onStart,
  onDemo,
  onResume,
  onDiscardResume,
  onOpenManual,
  onOpenPrivacy,
  onReplayIntro,
  scanError,
}: {
  demo: boolean;
  resume: RunSnapshot | null;
  onStart: (url: string) => void;
  onDemo: () => void;
  onResume: () => void;
  onDiscardResume: () => void;
  onOpenManual: () => void;
  onOpenPrivacy: () => void;
  onReplayIntro: () => void;
  scanError: string | null;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Bạn nhập website doanh nghiệp giúp mình nhé.");
      return;
    }
    setError("");
    onStart(url.trim());
  }

  const done = resume ? PLANET_ORDER.filter((p) => resume.results[p]).length : 0;

  return (
    <div className="screen landing-screen">
      <div className="content landing-content flex min-h-full flex-col">
        <header className="flex items-center justify-between gap-3 pr-14">
          <BrandMark height={24} />
          <button
            type="button"
            className="intro-replay-btn"
            onClick={onReplayIntro}
            aria-label="Xem lại intro"
            data-testid="replay-intro"
          >
            <IconRefresh size={14} />
            <span className="hidden min-[380px]:inline">Xem lại intro</span>
            <span className="min-[380px]:hidden">Intro</span>
          </button>
        </header>

        <main className="landing-main">
          <div className="landing-copy relative">
          <div
            className="landing-star-mobile pointer-events-none absolute -right-24 top-12 opacity-45"
            style={{
              maskImage: "linear-gradient(to bottom, #000 42%, transparent 86%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 42%, transparent 86%)",
            }}
          >
            <StarGem size={280} />
          </div>

          <div className="landing-copy__top relative pt-8">
            <div className="eyebrow">
              <span className="dot text-amber" /> 5 trạm · 1 ngôi sao · ~{site.timing.totalMinutes} phút
            </div>
            <h1 className="headline mt-4">
              Doanh nghiệp của bạn{" "}
              <br />
              đang ở <span className="text-amber">hành tinh nào?</span>
            </h1>
            <p className="lead mt-4 max-w-[32ch]">
              Nhập website, nhận hành trình 5 bước và bản đồ thương hiệu của riêng bạn.
            </p>
          </div>

          <form onSubmit={submit} className="glass panel relative mt-7" data-testid="landing-form">
            <label className="label" htmlFor="website">
              Website doanh nghiệp của bạn
            </label>
            <div className="field">
              <span className="text-muted" aria-hidden>
                <IconGlobe size={18} />
              </span>
              <input
                id="website"
                name="website"
                placeholder="saokim.vn"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                data-testid="website-input"
              />
            </div>
            {error || scanError ? <p className="error-text">{error || scanError}</p> : null}
            <p className="small mt-2">Chỉ đọc thông tin công khai · Không cần đăng ký.</p>

            <Button type="submit" variant="primary" block className="mt-4" data-testid="start-button">
              Bắt đầu hành trình <IconArrowRight size={18} className="arrow" />
            </Button>

            <div className="row-between mt-3">
              <button
                type="button"
                className="tap small justify-start underline decoration-white/25 underline-offset-4"
                onClick={onOpenManual}
                data-testid="no-website-link"
              >
                Chưa có website? Dùng tên doanh nghiệp
              </button>
            </div>
          </form>

          {resume ? (
            <div className="glass panel--flat mt-4 p-4" data-testid="resume-card">
              <div className="row-between">
                <div className="row min-w-0">
                  <LogoImage brand={resume.brand ?? { name: resume.domain, logo: null, palette: [] }} size={38} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-silver">
                      Tiếp tục: {resume.brand?.name ?? prettyDomain(resume.domain)}
                    </div>
                    <div className="small">Đã hoàn thành {done}/5 trạm</div>
                  </div>
                </div>
                <div className="row gap-1">
                  <Button size="xs" variant="silver" onClick={onResume} data-testid="resume-button">
                    Tiếp tục
                  </Button>
                  <button
                    className="tap text-muted"
                    onClick={onDiscardResume}
                    aria-label="Bỏ phiên đã lưu"
                  >
                    <IconClose size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {demo ? (
            <div className="mt-4">
              <Button variant="ghost" block onClick={onDemo} data-testid="demo-button">
                Dùng dữ liệu mẫu để xem trước
              </Button>
            </div>
          ) : null}

          </div>

          <aside className="landing-visual" aria-hidden>
            <div className="landing-orbit landing-orbit--outer" />
            <div className="landing-orbit landing-orbit--inner" />
            <div className="landing-visual-star">
              <StarGem size={300} />
            </div>
            <div className="landing-visual-planet">
              <PlanetOrb planet="O" lit={0.58} size={184} />
            </div>
            <span className="landing-visual-label landing-visual-label--top">MỘT HÀNH TINH ĐANG NGỦ</span>
            <span className="landing-visual-label landing-visual-label--bottom">5 TRẠM · 1 NGÔI SAO</span>
          </aside>
        </main>

        <footer className="landing-footer mt-8 flex items-center justify-between gap-3">
          <span className="text-[10.5px] text-white/30">Sao Kim Branding · SAOKIM Framework</span>
          <button className="tap whitespace-nowrap text-[11px] text-muted underline underline-offset-4" onClick={onOpenPrivacy} type="button">
            Dữ liệu cá nhân
          </button>
        </footer>
      </div>
    </div>
  );
}
