import { useEffect, useRef, useState } from "react";
import { Sheet } from "@/ui/Sheet";
import { Button, TextField } from "@/ui/Controls";
import { IconArrowRight, IconDownload } from "@/ui/Icons";

export interface ManualPayload {
  name: string;
  website?: string;
  industry?: string;
  logoDataUrl?: string;
}

const INDUSTRIES = [
  "Bất động sản",
  "Xây dựng & nội thất",
  "F&B",
  "Bán lẻ",
  "Mỹ phẩm & làm đẹp",
  "Công nghệ",
  "Giáo dục",
  "Y tế & sức khoẻ",
  "Du lịch & khách sạn",
  "Logistics",
  "Tài chính & bảo hiểm",
  "Thời trang",
  "Sản xuất",
  "Dịch vụ B2B",
  "Khác",
];

export function ManualSheet({
  open,
  onClose,
  onSubmit,
  onOpenPrivacy,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ManualPayload) => void;
  onOpenPrivacy: () => void;
}) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [logo, setLogo] = useState<string | undefined>();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError("");
      setBusy(false);
    }
  }, [open]);

  function handleFile(file?: File | null) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Ảnh logo cần nhỏ hơn 2MB.");
      return;
    }
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setError("Chỉ nhận PNG, JPG, WebP hoặc SVG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(typeof reader.result === "string" ? reader.result : undefined);
      setFileName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function submit() {
    if (busy) return;
    if (name.trim().length < 2) {
      setError("Bạn nhập tên doanh nghiệp giúp mình nhé.");
      return;
    }
    setBusy(true);
    onSubmit({
      name: name.trim(),
      website: website.trim() || undefined,
      industry: industry || undefined,
      logoDataUrl: logo,
    });
    setBusy(false);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Không cần website"
      title="Cho chúng tôi biết tên thương hiệu"
      testId="manual-sheet"
      footer={
        <Button variant="primary" block onClick={submit} loading={busy}>
          Tạo hành tinh của tôi <IconArrowRight size={18} className="arrow" />
        </Button>
      }
    >
      <div className="stack" style={{ ["--stack-gap" as string]: "14px" }}>
        <TextField
          label="Tên doanh nghiệp"
          placeholder="Ví dụ: Cà phê Nắng Mai"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          error={error && !name.trim() ? error : undefined}
        />
        <TextField
          label="Website (không bắt buộc)"
          placeholder="nangmai.coffee"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <div>
          <label className="label" htmlFor="manual-industry">
            Ngành (không bắt buộc)
          </label>
          <div className="field">
            <select
              id="manual-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ background: "transparent" }}
            >
              <option value="">Chọn ngành</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} className="text-black">
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="panel--flat p-4">
          <div className="row-between">
            <div>
              <div className="h3">Logo của bạn</div>
              <p className="small mt-1">Không có cũng không sao — chúng tôi tạo logo chữ cái.</p>
            </div>
            <div
              className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15"
              style={{ background: "rgba(255,255,255,.05)" }}
            >
              {logo ? (
                <img src={logo} alt="Logo đã chọn" className="max-h-11 max-w-11 object-contain" />
              ) : (
                <IconDownload size={20} className="text-muted" />
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="mt-3 row gap-2">
            <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
              {logo ? "Đổi ảnh" : "Tải logo lên"}
            </Button>
            {logo ? (
              <Button
                size="sm"
                variant="plain"
                onClick={() => {
                  setLogo(undefined);
                  setFileName("");
                }}
              >
                Bỏ ảnh
              </Button>
            ) : null}
          </div>
          {fileName ? <p className="small mt-2">Đã chọn: {fileName}</p> : null}
          {error && name.trim() ? <p className="error-text">{error}</p> : null}
        </div>

        <p className="small">
          Chúng tôi chỉ đọc thông tin công khai.{" "}
          <button className="underline underline-offset-2" onClick={onOpenPrivacy} type="button">
            Thông báo dữ liệu
          </button>
          .
        </p>
      </div>
    </Sheet>
  );
}
