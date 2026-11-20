import { useEffect, useMemo, useState } from "react";
import { fetchLeaderboard } from "@/lib/api";
import { site } from "@/config/site";
import type { LeaderboardEntry } from "@/shared/types";
import { BrandMark } from "@/ui/Brand";
import { Button } from "@/ui/Controls";
import { IconArrowLeft, IconSparkle } from "@/ui/Icons";
import { StarGem } from "@/ui/StarGem";
import { track } from "@/lib/analytics";

export function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [industry, setIndustry] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchLeaderboard()
      .then(({ entries: list }) => alive && setEntries(list))
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Chưa tải được bảng xếp hạng."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(entries.map((e) => e.industry).filter(Boolean))),
    [entries],
  );
  const filtered = industry === "all" ? entries : entries.filter((e) => e.industry === industry);

  useEffect(() => {
    track("leaderboard_view");
  }, []);

  return (
    <div className="app-shell">
      <div className="nebula" aria-hidden />
      <div className="screen">
        <div className="content content--narrow pb-28">
          <header className="flex items-center justify-between">
            <a href="/" className="icon-btn" aria-label="Về trang chủ">
              <IconArrowLeft size={18} />
            </a>
            <BrandMark height={20} className="opacity-60" />
            <span className="w-11" />
          </header>

          <div className="mt-7 flex items-center gap-4">
            <StarGem size={72} />
            <div>
              <div className="eyebrow">
                <IconSparkle size={12} className="text-amber" /> Bảng xếp hạng CEO
              </div>
              <h1 className="h2 mt-1">Những người đã đi đủ 5 trạm</h1>
            </div>
          </div>

          <p className="body mt-3">
            Xếp theo điểm sức khoẻ thương hiệu, trong cùng ngành. Người chơi có thể chọn ẩn danh — chỉ
            ngành và điểm được hiển thị.
          </p>

          {industries.length > 1 ? (
            <div className="snap-x mt-4">
              <button
                className={`pill ${industry === "all" ? "pill--amber" : ""}`}
                onClick={() => setIndustry("all")}
              >
                Tất cả ngành
              </button>
              {industries.map((i) => (
                <button
                  key={i}
                  className={`pill ${industry === i ? "pill--amber" : ""}`}
                  onClick={() => setIndustry(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          ) : null}

          <div className="glass panel mt-4">
            {loading ? (
              <p className="small py-8 text-center">Đang tải bảng xếp hạng…</p>
            ) : error ? (
              <p className="small py-8 text-center">{error}</p>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="body">Chưa có ai trong bảng xếp hạng này.</p>
                <p className="small mt-2">Bạn có thể là người đầu tiên.</p>
                <Button variant="primary" className="mt-4" onClick={() => (location.href = "/")}>
                  Bắt đầu hành trình
                </Button>
              </div>
            ) : (
              <ol className="divide-y divide-white/8">
                {filtered.slice(0, 20).map((e, i) => (
                  <li key={e.id} className="flex items-center gap-3 py-3">
                    <span
                      className={`mono-num grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        i === 0
                          ? "bg-amber/15 text-amber"
                          : i < 3
                            ? "bg-white/10 text-silver"
                            : "bg-white/[.03] text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-silver">{e.alias}</div>
                      <div className="truncate text-[10.5px] text-muted">
                        {e.industry || "Doanh nghiệp"} · {e.title}
                      </div>
                    </div>
                    <div className="mono-num text-right text-[14px] font-bold text-silver">
                      {e.score.toFixed(1)}
                      <span className="text-[9px] font-normal text-muted">/10</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mt-6 text-center">
            <Button variant="primary" onClick={() => (location.href = "/")}>
              Tự đo thương hiệu của bạn
            </Button>
            <p className="small mt-3">
              {site.brandFull} · Bảng xếp hạng chỉ gồm người chơi đồng ý công khai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
