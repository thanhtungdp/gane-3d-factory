import { PRIVACY } from "@/config/legal";
import { site } from "@/config/site";
import { Sheet } from "./Sheet";

export function PrivacySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={`Cập nhật ${PRIVACY.updatedAt}`}
      title={PRIVACY.title}
      testId="privacy-sheet"
    >
      <p className="body">{PRIVACY.intro}</p>
      <div className="mt-5 space-y-4">
        {PRIVACY.sections.map((s) => (
          <section key={s.title}>
            <h3 className="h3 mb-1.5">{s.title}</h3>
            <p className="body">{s.body}</p>
          </section>
        ))}
      </div>
      <div className="panel--flat mt-5 p-4">
        <p className="small">
          Dữ liệu được kiểm soát bởi {site.brandFull}. Yêu cầu về dữ liệu: {site.contact.email}. Bạn có
          thể rút lại sự đồng ý bất kỳ lúc nào; việc rút lại không ảnh hưởng đến tính hợp pháp của việc
          xử lý trước đó.
        </p>
      </div>
      <button className="btn btn-silver btn-block mt-5" onClick={onClose}>
        Tôi đã hiểu
      </button>
    </Sheet>
  );
}
