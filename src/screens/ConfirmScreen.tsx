import { useEffect, useRef, useState } from "react";
import { useRun } from "@/state/run";
import { useScene } from "@/state/scene";
import { BrandMark, LogoImage } from "@/ui/Brand";
import { Button, Segmented, TextField } from "@/ui/Controls";
import { Sheet } from "@/ui/Sheet";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconDownload,
  IconLock,
  IconSparkle,
} from "@/ui/Icons";
import { uploadLogo } from "@/lib/api";
import {
  COMPANY_SIZE_OPTIONS,
  ROLE_OPTIONS,
  type BrandColor,
  type BrandLogo,
} from "@/shared/types";
import { prettyDomain } from "@/lib/urls";
import { track } from "@/lib/analytics";

export function ConfirmScreen({
  onBegin,
  onBack,
  onOpenManual,
}: {
  onBegin: () => void;
  onBack: () => void;
  onOpenManual: () => void;
}) {
  const brand = useRun((s) => s.brand);
  const preScan = useRun((s) => s.preScan);
  const scan = useRun((s) => s.scan);
  const answers = useRun((s) => s.answers);
  const setAnswers = useRun((s) => s.setAnswers);
  const updateBrand = useRun((s) => s.updateBrand);
  const [logoOpen, setLogoOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    track("confirm_view");
  }, []);

  if (!brand || !preScan) {
    return (
      <div className="screen screen--center">
        <div className="content content--narrow glass panel text-center">
          <h1 className="h2">Chưa có tín hiệu nào</h1>
          <p className="body mt-2">Hãy quét website hoặc nhập tên doanh nghiệp trước.</p>
          <Button variant="primary" className="mt-5" block onClick={onOpenManual}>
            Nhập tên doanh nghiệp
          </Button>
          <Button variant="plain" className="mt-2" block onClick={onBack}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const palette = brand.palette;
  const scenePalette = palette.map((c) => c.hex);

  function setPaletteColor(index: number, hex: string) {
    if (!brand) return;
    const next: BrandColor[] = palette.map((c, i) => (i === index ? { ...c, hex, source: "manual" } : c));
    updateBrand({ palette: next });
    useScene.getState().setBrand(brand.name, brand.logo?.url ?? null, next.map((c) => c.hex));
  }

  function setLogo(logo: BrandLogo | null) {
    if (!brand) return;
    const alternatives = logo
      ? brand.logoAlternatives.filter((l) => l.id !== logo.id)
      : brand.logoAlternatives;
    updateBrand({ logo, logoAlternatives: alternatives });
    useScene.getState().setBrand(brand.name, logo?.url ?? null, scenePalette);
    setLogoOpen(false);
  }

  async function handleUpload(file?: File | null) {
    if (!file || !brand) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ảnh logo cần nhỏ hơn 2MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const logo = await uploadLogo(file);
      updateBrand({
        logo,
        logoAlternatives: [logo, ...brand.logoAlternatives].slice(0, 8),
      });
      useScene.getState().setBrand(brand.name, logo.url, scenePalette);
      setLogoOpen(false);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === "string" ? reader.result : "";
        if (!url) return;
        const logo: BrandLogo = {
          id: `local-${Date.now()}`,
          url,
          width: 512,
          height: 512,
          source: "Bạn tải lên",
          quality: "high",
        };
        updateBrand({ logo, logoAlternatives: [logo, ...brand.logoAlternatives].slice(0, 8) });
        useScene.getState().setBrand(brand.name, logo.url, scenePalette);
        setLogoOpen(false);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }

  const signals = preScan.signals.slice(0, 3);

  return (
    <div className="screen">
      <div className="content content--narrow">
        <div className="flex items-center justify-between">
          <button className="icon-btn" onClick={onBack} aria-label="Quay lại">
            <IconArrowLeft size={18} />
          </button>
          <BrandMark height={20} className="opacity-60" />
          <span className="w-11" />
        </div>

        <div className="mt-6">
          <div className="eyebrow">
            <IconCheck size={12} className="text-[#4fd1c5]" /> Tín hiệu đã rõ
          </div>
          <h1 className="headline headline--sm mt-2">Đây có phải thương hiệu của bạn?</h1>
          <p className="body mt-2">Sửa lại nếu cần. Mọi thứ ở đây sẽ theo bạn suốt hành trình.</p>
        </div>

        <div className="glass panel mt-5" data-testid="brand-confirm">
          <div className="flex items-start gap-4">
            <button onClick={() => setLogoOpen(true)} className="relative shrink-0" aria-label="Đổi logo">
              <LogoImage brand={brand} size={84} pad />
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-navy-800 text-[10px] font-semibold text-silver">
                Sửa
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <TextField
                label="Tên thương hiệu"
                value={brand.name}
                onChange={(e) => {
                  updateBrand({ name: e.target.value });
                  useScene.getState().setBrand(e.target.value, brand.logo?.url ?? null, scenePalette);
                }}
                maxLength={80}
                data-testid="brand-name-input"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="pill">{prettyDomain(brand.domain)}</span>
                {brand.industry ? <span className="pill pill--amber">{brand.industry}</span> : null}
                <span className="pill">
                  <IconSparkle size={11} /> {brand.logo ? "Logo đã nhận" : "Logo chữ cái"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <TextField
              label="Ngành"
              value={brand.industry ?? ""}
              onChange={(e) => updateBrand({ industry: e.target.value })}
              placeholder="F&B, BĐS…"
              maxLength={60}
            />
            <TextField
              label="Slogan / câu định vị"
              value={brand.tagline ?? ""}
              onChange={(e) => updateBrand({ tagline: e.target.value })}
              placeholder={preScan.hasSlogan ? "Đã tìm thấy" : "Chưa thấy trên web"}
              maxLength={120}
            />
          </div>

          <div className="mt-4">
            <span className="label">Màu thương hiệu</span>
            <div className="flex flex-wrap gap-2.5">
              {palette.map((c, i) => (
                <label
                  key={`${c.hex}-${i}`}
                  className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20"
                  style={{ background: c.hex }}
                  title={`${c.hex} · ${c.source}`}
                >
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => setPaletteColor(i, e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`Màu ${i + 1}: ${c.hex}`}
                  />
                  <span
                    className="pointer-events-none rounded bg-black/45 px-1 py-0.5 text-[8.5px] font-semibold tracking-wide text-white"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}
                  >
                    {c.hex.replace("#", "").toUpperCase()}
                  </span>
                </label>
              ))}
              <div className="flex h-11 items-center rounded-xl border border-dashed border-white/15 px-3 text-[10.5px] text-muted">
                {palette.length} màu đã nhận
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="row-between">
            <span className="label mb-0">Tín hiệu ban đầu từ website</span>
            <button className="text-[11px] text-muted underline underline-offset-2" onClick={onOpenManual}>
              Quét lại
            </button>
          </div>
          <div className="snap-x mt-2">
            {signals.map((s) => (
              <div key={s.id} className="panel--flat w-[78%] shrink-0 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`dot ${
                      s.severity === "gap" ? "text-[#ef4123]" : s.severity === "watch" ? "text-amber" : "text-[#4fd1c5]"
                    }`}
                  />
                  <span className="text-[12px] font-semibold text-silver">{s.title}</span>
                </div>
                <p className="small mt-1.5 line-clamp-2">{s.evidence}</p>
              </div>
            ))}
          </div>
          {scan?.warnings?.length ? (
            <p className="small mt-2 flex items-start gap-1.5">
              <IconLock size={12} className="mt-0.5 shrink-0" /> {scan.warnings[0]}
            </p>
          ) : null}
        </div>

        <div className="glass panel mt-4" data-testid="profile-questions">
          <p className="eyebrow">Hai câu cuối</p>
          <p className="body mt-1.5">Để báo cáo nói đúng bối cảnh của bạn.</p>
          <div className="mt-4">
            <Segmented
              label="Quy mô nhân sự"
              options={COMPANY_SIZE_OPTIONS}
              value={answers.companySize}
              onChange={(companySize) => setAnswers({ companySize })}
              columns={3}
            />
          </div>
          <div className="mt-4">
            <Segmented
              label="Vai trò của bạn"
              options={ROLE_OPTIONS}
              value={answers.role}
              onChange={(role) => setAnswers({ role })}
              columns={2}
            />
          </div>
        </div>

        <div className="mt-5 pb-4">
          <Button variant="primary" block onClick={onBegin} data-testid="begin-button">
            Cất cánh <IconArrowRight size={18} className="arrow" />
          </Button>
          <p className="small mt-3 text-center">
            Bằng việc tiếp tục, bạn đồng ý để chúng tôi xử lý brand kit cho phiên chơi này. Báo cáo đầy
            đủ sẽ cần thêm xác nhận ở cuối hành trình.
          </p>
        </div>
      </div>

      <Sheet
        open={logoOpen}
        onClose={() => setLogoOpen(false)}
        eyebrow="Nhận diện"
        title="Chọn logo cho hành tinh"
        testId="logo-sheet"
      >
        <div className="grid grid-cols-3 gap-2.5">
          <button
            className="panel--flat grid aspect-square place-items-center p-2 hover:bg-white/[.06]"
            onClick={() => setLogo(null)}
          >
            <span className="text-center text-[10.5px] text-muted">
              <span className="block text-[22px] font-bold text-silver">
                {brand.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
              Logo chữ cái
            </span>
          </button>
          {brand.logoAlternatives.map((l) => (
            <button
              key={l.id}
              className="panel--flat grid aspect-square place-items-center p-2 hover:bg-white/[.06]"
              onClick={() => setLogo(l)}
            >
              <img src={l.url} alt={l.source} className="max-h-[70%] max-w-[80%] object-contain" />
              <span className="mt-1 block truncate text-[9px] text-muted">{l.source}</span>
            </button>
          ))}
          <button
            className="panel--flat grid aspect-square place-items-center border-dashed p-2"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <span className="text-center text-[10.5px] text-muted">
              <IconDownload size={18} className="mx-auto mb-1" />
              {uploading ? "Đang xử lý…" : "Tải logo khác"}
            </span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => void handleUpload(e.target.files?.[0])}
        />
        {uploadError ? <p className="error-text">{uploadError}</p> : null}
        <p className="small mt-4">
          Logo sẽ xuất hiện trên thân tàu, mockup và hành tinh của bạn. Bạn có thể đổi bất kỳ lúc nào.
        </p>
        <Button variant="ghost" block className="mt-4" onClick={() => setLogoOpen(false)}>
          <IconClose size={16} /> Đóng
        </Button>
      </Sheet>
    </div>
  );
}
