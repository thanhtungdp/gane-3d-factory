import { useEffect, useRef, useState } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { shareReportCard } from "@/lib/shareCard";
import { submitLeaderboard } from "@/lib/api";
import { ReportView } from "./ReportView";
import { LeadSheet, type LeadIntent } from "./LeadSheet";
import { PrivacySheet } from "@/ui/PrivacySheet";
import { Button, CheckRow, TextField } from "@/ui/Controls";
import { IconArrowRight, IconCheck, IconClose, IconShare, IconSparkle } from "@/ui/Icons";

function LeaderboardOptIn({ report, sessionId }: { report: NonNullable<ReturnType<typeof useRun.getState>["report"]>; sessionId: string | null }) {
  const [alias, setAlias] = useState(report.brand.name);
  const [anonymous, setAnonymous] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!sessionId) {
      setError("Phiên chơi chưa kết nối máy chủ.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitLeaderboard({
        sessionId,
        alias: alias.trim() || "Một CEO",
        anonymous,
        industry: report.brand.industry,
        visible: true,
      });
      setDone(true);
      track("leaderboard_submit", { anonymous });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa ghi được tên.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass panel mt-7" data-testid="leaderboard-optin">
      <div className="row-between">
        <div>
          <div className="eyebrow">
            <IconSparkle size={12} className="text-amber" /> Bảng xếp hạng CEO
          </div>
          <h2 className="h3 mt-1">Ghi tên vào bảng xếp hạng ngành {report.brand.industry ?? "của bạn"}</h2>
        </div>
        <a href="/bang-xep-hang" className="pill shrink-0" aria-label="Xem bảng xếp hạng">
          Xem <IconArrowRight size={12} />
        </a>
      </div>
      {done ? (
        <p className="mt-3 flex items-center gap-2 text-[12px] text-[#a9fff2]">
          <IconCheck size={14} /> Đã ghi tên. Bạn có thể ẩn bất kỳ lúc nào bằng cách chơi lại.
        </p>
      ) : (
        <div className="mt-3 grid gap-2.5">
          <div className="flex gap-2">
            <div className="flex-1">
              <TextField
                label="Tên hiển thị"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                maxLength={60}
                disabled={anonymous}
              />
            </div>
            <div className="flex-1">
              <span className="label">Chế độ</span>
              <div className="field min-h-[56px] px-3">
                <span className="text-[11.5px] text-muted">{anonymous ? "Ẩn danh" : "Công khai"}</span>
              </div>
            </div>
          </div>
          <CheckRow checked={anonymous} onChange={setAnonymous}>
            Ẩn danh — chỉ hiện ngành và điểm, không hiện tên doanh nghiệp
          </CheckRow>
          {error ? <p className="error-text">{error}</p> : null}
          <Button variant="ghost" size="sm" onClick={submit} loading={busy}>
            Ghi tên <IconArrowRight size={15} />
          </Button>
        </div>
      )}
    </section>
  );
}

export function ReportScreen() {
  const report = useRun((s) => s.report);
  const sessionId = useRun((s) => s.sessionId);
  const leadUnlocked = useRun((s) => s.leadUnlocked);
  const unlockLead = useRun((s) => s.unlockLead);
  const setScreen = useRun((s) => s.setScreen);
  const [leadOpen, setLeadOpen] = useState(false);
  const [intent, setIntent] = useState<LeadIntent>("full");
  const [pdf, setPdf] = useState<string | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [sharing, setSharing] = useState(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (report && !viewed.current) {
      viewed.current = true;
      track("report_view", { unlocked: leadUnlocked, reportId: report.id });
    }
  }, [report, leadUnlocked]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5200);
    return () => clearTimeout(t);
  }, [notice]);

  if (!report) {
    return (
      <div className="screen screen--center">
        <div className="content content--narrow glass panel text-center">
          <h1 className="h2">Chưa có báo cáo</h1>
          <p className="body mt-2">Hoàn thành 5 trạm để mở bản đồ thương hiệu của bạn.</p>
          <Button variant="primary" className="mt-5" block onClick={() => setScreen("map")}>
            Về bản đồ
          </Button>
        </div>
      </div>
    );
  }

  function openLead(nextIntent: LeadIntent) {
    setIntent(nextIntent);
    setLeadOpen(true);
    track("gate_view", { intent: nextIntent });
  }

  function handleLeadSuccess(result: { pdfUrl: string }, usedIntent: LeadIntent) {
    unlockLead();
    setPdf(result.pdfUrl);
    setLeadOpen(false);
    track("lead_submit", { intent: usedIntent, reportId: report?.id ?? "" });
    track("lead_success", { intent: usedIntent, reportId: report?.id ?? "" });
    if (usedIntent === "booking") setNotice("Đã nhận yêu cầu đặt lịch. Đội Sao Kim sẽ liên hệ trong 1 ngày làm việc.");
    else if (usedIntent === "quote") setNotice("Đã nhận yêu cầu báo giá. Báo cáo đầy đủ đã mở bên dưới.");
    else setNotice("Đã mở báo cáo đầy đủ. Cảm ơn bạn đã đi hết hành trình.");
    setTimeout(() => {
      document.getElementById("insights")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  function handleBooking() {
    track("cta_click", { type: "booking" });
    track("booking_click");
    if (site.bookingUrl) {
      window.open(site.bookingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    openLead("booking");
  }

  function openPdf() {
    if (!pdf) return;
    track("cta_click", { type: "pdf" });
    track("pdf_download");
    const a = document.createElement("a");
    a.href = pdf;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    setNotice("Đang dựng thẻ chia sẻ 9:16…");
    const current = useRun.getState().report;
    if (!current) return;
    track("share_click", { reportId: current.id });
    const result = await shareReportCard(current);
    setSharing(false);
    if (result === "shared") setNotice("Đã mở bảng chia sẻ.");
    else if (result === "downloaded") setNotice("Thẻ 9:16 đã được tải về (hoặc mở tab mới để lưu).");
    else setNotice("Chưa tạo được ảnh trên trình duyệt này. Bạn thử trên Safari/Chrome nhé.");
  }

  return (
    <>
      <ReportView
        report={report}
        mode="private"
        unlocked={leadUnlocked}
        onBack={() => {
          setScreen("map");
          useScene.getState().setMode("landing");
        }}
        onOpenLead={() => openLead("full")}
        onShare={() => void handleShare()}
        onPdf={openPdf}
        pdfUrl={pdf}
        onBook={handleBooking}
        onQuote={() => openLead("quote")}
        leaderboard={
          leadUnlocked && site.flags.leaderboard ? (
            <LeaderboardOptIn report={report} sessionId={sessionId} />
          ) : null
        }
      />

      {notice ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+10px)] z-[80]">
          <div className="glass mx-auto flex max-w-[520px] items-start gap-2 rounded-2xl px-3 py-2.5">
            <IconShare size={14} className="mt-0.5 shrink-0 text-amber" />
            <p className="flex-1 text-[11.5px] leading-relaxed text-silver-dim">{notice}</p>
            <button className="tap shrink-0 text-muted" onClick={() => setNotice("")} aria-label="Đóng thông báo">
              <IconClose size={13} />
            </button>
          </div>
        </div>
      ) : null}

      <LeadSheet
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        report={report}
        intent={intent}
        sessionId={sessionId}
        onSuccess={handleLeadSuccess}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />
      <PrivacySheet open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
