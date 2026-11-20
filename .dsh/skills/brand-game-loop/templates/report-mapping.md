# Report mapping

Report chỉ hiển thị **sau khi chơi xong** (hoặc sau act cuối), không xuất hiện trong loop và không bán hàng trong lúc chơi. Offer/giá chỉ sau lead gate.

## Bảng map act → report

| actId | Tên trên report | Weight | Điểm raw | Chuẩn hoá | Evidence | Ngưỡng yếu | Hệ quả viết cho report |
|---|---|---|---:|---|---|---|---|
| {{actId}} | {{actName}} | 0.00 | | X/10 | {{evidenceSource}} | <6 | {{consequence}} |
| {{actId}} | {{actName}} | 0.00 | | X/10 | {{evidenceSource}} | <6 | {{consequence}} |
| … | | | | | | | |

- Weight các act cộng **1.0**; nếu không chia đều, ghi lý do.
- Điểm raw có thể theo knowledge/diagnosis/action; chuẩn hoá về 0–10 trước khi map.
- Evidence chỉ lấy từ decision/`evidenceKey` hoặc dữ liệu thật; không suy diễn, không bịa.
- Act bị skip: vẫn hiện trong report với nhãn “đã bỏ qua” và điểm 0; không giả vờ đã chơi.

## Cấu trúc report tối thiểu

1. **Tổng:** điểm X/10, danh hiệu, sao (n/5), thời lượng.
2. **Từng act:** điểm + 1 câu trạng thái + evidence ngắn.
3. **2 vùng yếu nhất:** act, điểm, evidence, hệ quả kinh doanh/brand; tie-break theo thứ tự act.
4. **Điểm mạnh / huy hiệu:** ghi nhận act ≥ ngưỡng; không phóng đại.
5. **Insight / đề xuất:** chỉ mở sau lead gate; mỗi đề xuất gắn evidence.
6. **Offer:** chỉ sau lead gate, không xuất hiện trong loop; không hứa KPI.
7. **Share/PDF:** bản rút gọn 1 trang; không lộ dữ liệu cá nhân.

## Test IDs gợi ý

| Thành phần | Test id |
|---|---|
| Trang report | `report` |
| Điểm act | `report-act-{{actId}}` |
| Vùng yếu | `report-weak-1`, `report-weak-2` |
| Insight | `report-insight` |
| Offer (post-gate) | `report-offer` |
| Share/PDF | `report-share`, `report-pdf` |

## Gate

- Report chỉ render khi `completed` hoặc có `skipped` rõ ràng.
- Không có offer/giá trong DOM khi chưa qua lead gate.
- Điểm/weak step tính lại được từ decision + scoring, không hardcode.
- Không dùng `%`; hiển thị X/10, n/5, x/100 cho KPI.
- Copy hệ quả nói điều xảy ra với brand, không phán xét người chơi.
