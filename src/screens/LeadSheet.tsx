import { useEffect, useState } from "react";
import type { LeadResult, Report } from "@/shared/types";
import { Button, CheckRow, TextField } from "@/ui/Controls";
import { Sheet } from "@/ui/Sheet";
import { PRIVACY } from "@/config/legal";
import { submitLead } from "@/lib/api";
import { track } from "@/lib/analytics";
import { IconArrowRight, IconLock, IconShield } from "@/ui/Icons";

export type LeadIntent = "full" | "booking" | "quote";

const COPY: Record<LeadIntent, { title: string; eyebrow: string; cta: string; body: string }> = {
  full: {
    eyebrow: "Báo cáo đầy đủ",
    title: "Nhận bản đồ thương hiệu của bạn",
    cta: "Mở báo cáo đầy đủ",
    body: "3 nhận định riêng, gói đề xuất và bản PDF. Chúng tôi chỉ liên hệ khi bạn đồng ý.",
  },
  booking: {
    eyebrow: "Tư vấn 1-1",
    title: "Đặt 30 phút với đội Sao Kim",
    cta: "Gửi yêu cầu đặt lịch",
    body: "Một buổi trao đổi miễn phí, tập trung vào 2 vùng tối trong báo cáo của bạn.",
  },
  quote: {
    eyebrow: "Báo giá",
    title: "Nhận báo giá gói đề xuất",
    cta: "Gửi yêu cầu báo giá",
    body: "Chúng tôi gửi báo giá chi tiết theo đúng gói gợi ý và quy mô doanh nghiệp của bạn.",
  },
};

export function LeadSheet({
  open,
  onClose,
  report,
  intent,
  sessionId,
  onSuccess,
  onOpenPrivacy,
}: {
  open: boolean;
  onClose: () => void;
  report: Report;
  intent: LeadIntent;
  sessionId: string | null;
  onSuccess: (result: LeadResult, intent: LeadIntent) => void;
  onOpenPrivacy: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [representative, setRepresentative] = useState(false);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = COPY[intent];

  useEffect(() => {
    if (!open) return;
    setError("");
    setBusy(false);
  }, [open, intent]);

  async function submit() {
    if (busy) return;
    if (name.trim().length < 2) {
      setError("Bạn nhập tên giúp mình nhé.");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError("Cần số điện thoại hoặc email để gửi báo cáo.");
      return;
    }
    if (phone && !/^(0|\+84)(\d[\s.-]?){9,10}$/.test(phone.trim())) {
      setError("Số điện thoại chưa đúng. Ví dụ: 0901 234 567.");
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Email chưa đúng.");
      return;
    }
    if (!representative) {
      setError("Vui lòng xác nhận bạn là đại diện của thương hiệu này.");
      return;
    }
    if (!consent) {
      setError("Vui lòng đồng ý để chúng tôi xử lý dữ liệu liên hệ.");
      return;
    }
    if (!sessionId) {
      setError("Phiên chơi chưa kết nối máy chủ. Bạn thử tải lại trang rồi gửi lại nhé.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitLead({
        sessionId,
        reportId: report.id,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        isRepresentative: true,
        consent: true,
        marketingOptIn: marketing,
      });
      onSuccess(result, intent);
    } catch (err) {
      track("lead_fail", { intent });
      setError(err instanceof Error ? err.message : "Chưa gửi được. Bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={copy.eyebrow}
      title={copy.title}
      testId="lead-sheet"
      footer={
        <Button variant="primary" block onClick={submit} loading={busy} data-testid="lead-submit">
          {copy.cta} <IconArrowRight size={17} className="arrow" />
        </Button>
      }
    >
      <p className="body">{copy.body}</p>

      <div className="mt-4 grid gap-3">
        <TextField
          label="Tên của bạn"
          placeholder="Nguyễn Minh Anh"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          data-testid="lead-name"
        />
        <TextField
          label="Số điện thoại"
          placeholder="0901 234 567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          data-testid="lead-phone"
        />
        <TextField
          label="Email (nếu muốn nhận PDF)"
          placeholder="ban@congty.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          autoComplete="email"
          maxLength={160}
          data-testid="lead-email"
        />
      </div>

      <div className="mt-4 space-y-1">
        <CheckRow checked={representative} onChange={setRepresentative} testId="lead-representative">
          {PRIVACY.representativeLabel}
        </CheckRow>
        <CheckRow checked={consent} onChange={setConsent} testId="lead-consent">
          {PRIVACY.consentLabel}{" "}
          <button type="button" className="underline underline-offset-2" onClick={onOpenPrivacy}>
            Xem thông báo
          </button>
        </CheckRow>
        <CheckRow checked={marketing} onChange={setMarketing}>
          {PRIVACY.marketingLabel}
        </CheckRow>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/8 bg-white/[.03] p-3">
        <IconShield size={15} className="mt-0.5 shrink-0 text-[#4fd1c5]" />
        <p className="text-[10.5px] leading-relaxed text-muted">
          Dữ liệu của bạn được xử lý theo Nghị định 13/2023/NĐ-CP. Chúng tôi không bán dữ liệu và không
          chia sẻ cho bên thứ ba vì mục đích quảng cáo.
        </p>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
        <IconLock size={11} /> Gói đề xuất và khoảng giá chỉ hiển thị sau bước này.
      </p>
    </Sheet>
  );
}
