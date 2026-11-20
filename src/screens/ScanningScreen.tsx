import { useEffect, useState } from "react";
import { Button } from "@/ui/Controls";
import { BrandMark } from "@/ui/Brand";
import { IconArrowLeft, IconCheck, IconRefresh, IconScan } from "@/ui/Icons";

const STEPS = [
  "Kết nối website",
  "Tìm logo & bảng màu",
  "Đọc câu chuyện thương hiệu",
  "Đối chiếu SAOKIM Framework",
];

export function ScanningScreen({
  error,
  demo,
  onRetry,
  onOpenManual,
  onBack,
}: {
  error: string | null;
  demo: boolean;
  onRetry: () => void;
  onOpenManual: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 820);
    return () => clearInterval(t);
  }, [error]);

  if (error) {
    return (
      <div className="screen screen--center">
        <div className="content content--narrow">
          <div className="glass panel text-center" data-testid="scan-error">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#ef4123]/30 bg-[#ef4123]/10 text-[#ffb39f]">
              <IconScan size={24} />
            </div>
            <p className="eyebrow mt-4 justify-center">Tín hiệu bị nhiễu</p>
            <h1 className="h2 mt-2">Chúng tôi chưa đọc được website này</h1>
            <p className="body mt-3">{error}</p>
            <div className="mt-6 grid gap-2">
              <Button variant="primary" block onClick={onRetry}>
                <IconRefresh size={18} /> Thử quét lại
              </Button>
              <Button variant="ghost" block onClick={onOpenManual}>
                Nhập tên doanh nghiệp thay thế
              </Button>
              <Button variant="plain" block size="sm" onClick={onBack}>
                Quay lại
              </Button>
            </div>
            <p className="small mt-4">
              Website chặn bot hoặc dùng logo quá mờ là chuyện bình thường. Bạn vẫn có thể đi tiếp bằng
              tên và logo của mình.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--center" data-testid="scanning-screen">
      <div className="content content--narrow">
        <div className="flex items-center justify-between">
          <button className="icon-btn" onClick={onBack} aria-label="Quay lại">
            <IconArrowLeft size={18} />
          </button>
          <BrandMark height={20} className="opacity-60" />
          <span className="w-11" />
        </div>

        <div className="mt-8 text-center">
          <div className="eyebrow justify-center">
            <span className="dot animate-pulse text-[#4fd1c5]" /> Đang quét
          </div>
          <h1 className="h2 mt-2">{demo ? "Đang nạp dữ liệu mẫu" : "Đang quét tín hiệu thương hiệu"}</h1>
          <p className="body mt-2">Giữ nguyên màn hình này. Thường mất 3–8 giây.</p>
        </div>

        <div className="mx-auto mt-7 w-[min(72vw,280px)]" aria-hidden>
          <div className="radar" data-testid="radar">
            <div className="radar-ring radar-ring--1" />
            <div className="radar-ring radar-ring--2" />
            <div className="radar-ring radar-ring--3" />
            <div className="radar-cross" />
            <div className="radar-sweep" />
            <div className="radar-core">
              <IconScan size={22} />
            </div>
            <span className="radar-blip" style={{ left: "68%", top: "28%", animationDelay: "0.2s" }} />
            <span className="radar-blip" style={{ left: "30%", top: "62%", animationDelay: "1.1s" }} />
            <span className="radar-blip" style={{ left: "74%", top: "70%", animationDelay: "1.9s" }} />
            <span className="radar-blip" style={{ left: "42%", top: "22%", animationDelay: "2.5s" }} />
          </div>
        </div>

        <ul className="mx-auto mt-8 w-full max-w-[340px] space-y-3" aria-live="polite">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex items-center gap-3 text-[13px]">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                    done
                      ? "border-[#4fd1c5]/40 bg-[#4fd1c5]/15 text-[#a9fff2]"
                      : active
                        ? "border-amber/50 bg-amber/10 text-amber"
                        : "border-white/10 bg-white/[.03] text-muted"
                  }`}
                >
                  {done ? <IconCheck size={13} /> : active ? <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" /> : i + 1}
                </span>
                <span className={done ? "text-silver-dim" : active ? "text-silver" : "text-muted"}>{label}</span>
                {active ? <span className="ml-auto text-[10px] text-muted">đang đọc…</span> : null}
              </li>
            );
          })}
        </ul>

        <p className="small mt-8 text-center">
          Chúng tôi không đăng nhập, không tải toàn bộ website — chỉ đọc những gì công khai.
        </p>
      </div>
    </div>
  );
}
