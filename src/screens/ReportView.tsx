import type { ReactNode } from "react";
import { site } from "@/config/site";
import { BrandMark, LogoImage } from "@/ui/Brand";
import { Button, ScoreBar, StarRating } from "@/ui/Controls";
import { RadarChart } from "@/ui/RadarChart";
import { PlanetOrb } from "@/ui/PlanetOrb";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconDownload,
  IconFile,
  IconLock,
  IconShare,
  IconSparkle,
} from "@/ui/Icons";
import type { PlanetId, Report } from "@/shared/types";
import { PLANET_META, PLANET_ORDER } from "@/shared/planets";

export function ReportView({
  report,
  mode,
  unlocked,
  onBack,
  onOpenLead,
  onShare,
  onPdf,
  pdfUrl,
  onBook,
  onQuote,
  leaderboard,
}: {
  report: Report;
  mode: "private" | "public";
  unlocked: boolean;
  onBack?: () => void;
  onOpenLead: () => void;
  onShare: () => void;
  onPdf?: () => void;
  pdfUrl?: string | null;
  onBook: () => void;
  onQuote: () => void;
  leaderboard?: ReactNode;
}) {
  const scores: Partial<Record<PlanetId, number>> = {};
  for (const id of PLANET_ORDER) scores[id] = report.result.planets[id]?.score ?? 0;
  const badgeSet = new Set(report.result.badges);
  const weak = report.weaknesses;
  const showPrice = site.flags.showPrice;

  return (
    <div className="screen">
      <div className="content content--narrow report-content pb-36">
        <header className="flex items-center justify-between gap-2">
          {mode === "private" ? (
            <button className="icon-btn" onClick={onBack} aria-label="Về bản đồ">
              <IconArrowLeft size={18} />
            </button>
          ) : (
            <a href="/" className="icon-btn" aria-label="Về trang chủ">
              <IconArrowLeft size={18} />
            </a>
          )}
          <BrandMark height={20} className="opacity-70" />
          <button className="icon-btn" onClick={onShare} aria-label="Chia sẻ bản đồ thương hiệu" data-testid="share-button">
            <IconShare size={18} />
          </button>
        </header>

        <div className="report-grid">
          <div className="report-left">
        <section className="mt-5" data-testid="report-top">
          <div className="eyebrow">
            <IconSparkle size={12} className="text-amber" /> Bản đồ thương hiệu
          </div>
          <div className="mt-3 flex items-center gap-3">
            <LogoImage brand={report.brand} size={52} pad />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-silver">{report.brand.name}</div>
              <div className="text-[11px] text-muted">
                {report.brand.industry ?? "Doanh nghiệp"} · {report.answers.companySize} người ·{" "}
                {new Date(report.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="mono-num text-[62px] font-bold leading-none text-silver-gradient">
                  {report.result.overall.toFixed(1)}
                </span>
                <span className="text-[15px] text-muted">/10</span>
              </div>
              <StarRating value={report.result.stars} size={16} className="mt-2" />
            </div>
            <div className="max-w-[46%] pb-1 text-right">
              <div className="text-[15px] font-semibold leading-tight text-amber">{report.result.title}</div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted">{report.result.titleBlurb}</p>
            </div>
          </div>
        </section>

        <section className="glass panel mt-5">
          <div className="row-between">
            <div>
              <div className="eyebrow">Radar 5 trục</div>
              <p className="small mt-1">Từ chính lựa chọn của bạn trong 5 trạm.</p>
            </div>
            <span className="pill">{report.result.badges.length}/5 huy hiệu</span>
          </div>
          <div className="mt-2 flex justify-center">
            <RadarChart values={scores} size={280} />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {PLANET_ORDER.map((id) => (
              <div key={id} className="text-center">
                <div className="text-[10px] font-bold" style={{ color: PLANET_META[id].color }}>
                  {id}
                </div>
                <div className="mono-num text-[12px] text-silver">{(scores[id] ?? 0).toFixed(1)}</div>
              </div>
            ))}
          </div>
        </section>

                  </div>

          <div className="report-right">
        <section className="mt-7" data-testid="weaknesses">
          <div className="row-between">
            <h2 className="h2">Hai vùng tối nhất</h2>
            <span className="small">Cần quyết trước</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {weak.map((w, i) => (
              <article key={w.planet} className="glass panel">
                <div className="flex items-start gap-3">
                  <PlanetOrb planet={w.planet} lit={Math.max(0.18, w.score / 10)} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-bold tracking-[0.16em] text-muted">
                        #{i + 1} · {PLANET_META[w.planet].letter}
                      </span>
                      <span className="text-[13px] font-semibold text-silver">{PLANET_META[w.planet].stepVi}</span>
                      <span className="ml-auto mono-num text-[13px] font-bold text-[#ffb39f]">
                        {w.score.toFixed(1)}/10
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-silver-dim">{w.consequence}</p>
                    {w.evidence ? (
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                        <span className="text-amber/80">Tín hiệu: </span>
                        {w.evidence}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass panel mt-5">
          <div className="eyebrow">Toàn cảnh 5 trạm</div>
          <div className="mt-3 space-y-2.5">
            {PLANET_ORDER.map((id) => {
              const score = scores[id] ?? 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="w-4 text-[10px] font-bold" style={{ color: PLANET_META[id].color }}>
                    {id}
                  </span>
                  <span className="w-[92px] shrink-0 truncate text-[11.5px] text-silver-dim">
                    {PLANET_META[id].stepVi}
                  </span>
                  <ScoreBar value={score} color={PLANET_META[id].color} className="flex-1" />
                  <span className="mono-num w-9 text-right text-[11px] text-muted">{score.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-7" id="insights" data-testid="insights">
          <div className="row-between">
            <h2 className="h2">Ba điều chúng tôi nhận ra</h2>
            {report.aiSource === "ai" ? <span className="pill pill--live">AI</span> : <span className="pill">Từ dữ liệu của bạn</span>}
          </div>
          {unlocked ? (
            <div className="mt-3 space-y-2.5">
              {report.insights.map((ins, i) => (
                <article key={i} className="glass panel">
                  <div className="flex items-center gap-2">
                    <span className="mono-num grid h-6 w-6 place-items-center rounded-full border border-amber/30 bg-amber/10 text-[10px] font-bold text-amber">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[13px] font-semibold text-silver">{ins.title}</h3>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-silver-dim">{ins.body}</p>
                  <div className="mt-2 rounded-lg border border-white/8 bg-white/[.03] px-2.5 py-2">
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted">NÊN LÀM</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-silver-dim">{ins.action}</p>
                  </div>
                  <p className="mt-2 text-[9.5px] text-white/30">{ins.evidence}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass panel mt-3 overflow-hidden">
              <div className="relative space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.02] px-3 py-3 opacity-60">
                    <span className="h-6 w-6 rounded-full bg-white/10" />
                    <span className="h-2 w-2/5 rounded bg-white/10" />
                    <span className="ml-auto h-2 w-12 rounded bg-white/5" />
                  </div>
                ))}
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-[#071236] via-[#071236]/70 to-transparent">
                  <div className="text-center">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-amber/30 bg-amber/10 text-amber">
                      <IconLock size={17} />
                    </div>
                    <p className="mt-2 text-[11.5px] text-silver-dim">3 nhận định riêng cho {report.brand.name}</p>
                    <Button variant="silver" size="sm" className="mt-2" onClick={onOpenLead}>
                      Mở khoá báo cáo <IconArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-7" data-testid="offers">
          <h2 className="h2">Gói phù hợp với bạn</h2>
          {unlocked ? (
            <div className="mt-3 space-y-2.5">
              {report.offers.map((offer, i) => (
                <article key={offer.code} className={`glass panel ${i === 0 ? "border-amber/35" : ""}`}>
                  <div className="row-between">
                    <div>
                      <div className="eyebrow">{i === 0 ? "Đề xuất chính" : "Kết hợp nếu cần"}</div>
                      <h3 className="h3 mt-1">{offer.name}</h3>
                    </div>
                    {i === 0 ? <span className="pill pill--amber">Phù hợp nhất</span> : null}
                  </div>
                  <p className="mt-1 text-[11px] text-amber/90">{offer.tagline}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-silver-dim">{offer.why}</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {offer.outcomes.map((o) => (
                      <li key={o} className="flex gap-2 text-[11px] leading-relaxed text-muted">
                        <IconCheck size={12} className="mt-0.5 shrink-0 text-[#4fd1c5]" /> {o}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg border border-white/8 bg-white/[.03] p-2.5">
                    <div className="text-[9px] font-bold tracking-[0.14em] text-muted">GÓI THẬT BÊN TRONG</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {offer.packages.map((p) => (
                        <span key={p.key} className="chip">
                          {p.name}
                          {showPrice ? <span className="text-muted"> · {p.price}</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                  {i === 0 ? (
                    <Button variant="primary" block className="mt-3" onClick={onQuote}>
                      Nhận báo giá gói này <IconArrowRight size={16} className="arrow" />
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="glass panel mt-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-amber/30 bg-amber/10 text-amber">
                  <IconLock size={17} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-silver">
                    Gói đề xuất: {report.teaserOffer}
                  </div>
                  <p className="small mt-0.5">Chi tiết gói và khoảng giá mở sau khi bạn xác nhận thông tin.</p>
                </div>
              </div>
              <Button variant="silver" block className="mt-3" onClick={onOpenLead}>
                Xem gói & nhận báo giá
              </Button>
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="row-between">
            <h2 className="h2">Huy hiệu</h2>
            <span className="small">{report.result.badges.length}/5</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {PLANET_ORDER.map((id) => {
              const earned = badgeSet.has(id);
              return (
                <div key={id} className="text-center">
                  <div
                    className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl border ${
                      earned ? "border-amber/40 bg-amber/10" : "border-white/8 bg-white/[.02] opacity-50"
                    }`}
                  >
                    <PlanetOrb planet={id} lit={earned ? 1 : 0.12} size={38} />
                  </div>
                  <div className="mt-1.5 text-[9px] leading-tight text-muted">{PLANET_META[id].letter}</div>
                </div>
              );
            })}
          </div>
        </section>

        {leaderboard}

        <section className="mt-7 grid gap-2">
          <Button variant="primary" block onClick={onBook} data-testid="book-button">
            <IconCalendar size={17} /> Đặt lịch tư vấn 1-1 miễn phí
          </Button>
          <Button variant="ghost" block onClick={onQuote}>
            <IconFile size={16} /> Nhận báo giá gói đề xuất
          </Button>
          {mode === "private" && unlocked && pdfUrl ? (
            <Button variant="ghost" block onClick={onPdf} data-testid="pdf-button">
              <IconDownload size={16} /> Tải báo cáo PDF
            </Button>
          ) : null}
          <Button variant="plain" block onClick={onShare}>
            <IconShare size={16} /> Chia sẻ thẻ 9:16
          </Button>
        </section>

        {mode === "public" ? (
          <section className="glass panel mt-5 text-center">
            <div className="eyebrow justify-center">Bạn muốn bản đồ của riêng mình?</div>
            <p className="body mt-2">Nhập website doanh nghiệp, đi 5 trạm và nhận báo cáo cá nhân hóa.</p>
            <a className="btn btn-primary btn-block mt-3" href="/">
              Bắt đầu hành trình <IconArrowRight size={17} className="arrow" />
            </a>
          </section>
        ) : null}

                  </div>
        </div>

        <footer className="mt-6 space-y-2 text-center">
          <p className="text-[9.5px] leading-relaxed text-white/25">
            Báo cáo được tạo từ thông tin công khai trên website và lựa chọn của bạn trong game. Không phải
            đánh giá tài chính hay pháp lý. Dữ liệu liên hệ chỉ dùng để gửi báo cáo và tư vấn khi bạn đồng ý.
          </p>
          <div className="flex items-center justify-center gap-2 text-[9.5px] text-white/25">
            <BrandMark height={12} className="opacity-40" />
            <span>{site.brandFull}</span>
          </div>
        </footer>
      </div>

      {mode === "private" && !unlocked ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-gradient-to-t from-[#030718] via-[#030718]/96 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3">
          <div className="mx-auto w-full max-w-[560px]">
            <Button variant="primary" block onClick={onOpenLead} data-testid="unlock-report-button">
              Mở báo cáo đầy đủ <IconArrowRight size={17} className="arrow" />
            </Button>
            <p className="mt-1.5 text-center text-[9.5px] text-white/35">
              3 nhận định riêng + gói đề xuất + PDF · Không chặn phần bạn đã thấy
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
