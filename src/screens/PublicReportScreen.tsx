import { useEffect, useState } from "react";
import { fetchReport } from "@/lib/api";
import { shareReportCard } from "@/lib/shareCard";
import { track } from "@/lib/analytics";
import type { Report } from "@/shared/types";
import { ReportView } from "./ReportView";
import { BrandMark } from "@/ui/Brand";
import { IconRefresh } from "@/ui/Icons";

export function PublicReportScreen({ id }: { id: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchReport(id)
      .then(({ report: r }) => {
        if (!alive) return;
        setReport(r);
        track("public_report_view", { reportId: id });
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Không tìm thấy báo cáo.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="nebula" aria-hidden />
        <div className="screen screen--center">
          <div className="content content--narrow text-center">
            <div className="pulse-soft mx-auto w-fit">
              <BrandMark height={26} />
            </div>
            <p className="small mt-6">Đang mở bản đồ thương hiệu…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="app-shell">
        <div className="nebula" aria-hidden />
        <div className="screen screen--center">
          <div className="content content--narrow glass panel text-center">
            <h1 className="h2">Bản đồ này không mở được</h1>
            <p className="body mt-2">{error || "Liên kết có thể đã hết hạn hoặc chưa được công khai."}</p>
            <a href="/" className="btn btn-primary btn-block mt-5">
              Về trang chủ
            </a>
            <button className="btn btn-ghost btn-block mt-2" onClick={() => location.reload()}>
              <IconRefresh size={16} /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function share() {
    const res = await shareReportCard(report!);
    setNotice(
      res === "shared" ? "Đã mở bảng chia sẻ." : res === "downloaded" ? "Đã tải thẻ 9:16." : "Chưa tạo được ảnh trên trình duyệt này.",
    );
  }

  return (
    <div className="app-shell">
      <div className="nebula" aria-hidden />
      {notice ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+64px)] z-[80]">
          <div className="glass mx-auto max-w-[520px] rounded-2xl px-3 py-2 text-center text-[11.5px] text-silver-dim">
            {notice}
          </div>
        </div>
      ) : null}
      <ReportView
        report={report}
        mode="public"
        unlocked
        onOpenLead={() => {
          location.href = "/";
        }}
        onShare={() => void share()}
        onBook={() => {
          location.href = "/";
        }}
        onQuote={() => {
          location.href = "/";
        }}
      />
    </div>
  );
}
