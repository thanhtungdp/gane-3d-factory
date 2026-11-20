# Reference map — audio (case study)

Map khái niệm trong [`contracts/sound-cues.md`](contracts/sound-cues.md) sang dự án tham chiếu. Đây là **ví dụ cấu trúc**, không phải yêu cầu stack: dự án mới thay bằng file/API tương đương. Không copy chord, melody, tên cue hay track.

## Bảng map

| Khái niệm | File/API tham chiếu | Ghi chú |
|---|---|---|
| Audio graph + buses | [`src/lib/audio.ts`](../../src/lib/audio.ts) `ensureGraph` (master/sfx/pad/noise) | 1 master, bus riêng cho ambience và SFX |
| Khởi tạo/unlock | `initAudio`, `enableAudio`, `isAudioUnlocked` | Chỉ resume trong gesture; lần đầu không tiếng |
| Bật/tắt + mute memory | `setSoundEnabled`, [`src/lib/audioPrefs.ts`](../../src/lib/audioPrefs.ts) | Lưu localStorage; khôi phục khi mount |
| Ambience theo mode/act | `setAmbience`, `stopAll` | Case study dùng synth pad + chord tham chiếu; **không copy chord cố định** |
| SFX một lần | `playSfx(name)` | Case study có bộ cue mẫu; dự án mới tự đặt id theo taxonomy |
| Visibility/dispose | `visibilitychange` → suspend/stop; `disposeAudio` | Tab ẩn dừng; unmount dọn node/listener |
| Mix tham chiếu | hằng số master/pad level trong `audio.ts` | Chỉ để calibrate; dự án mới tự đo |
| QA hooks | `isAudioEnabled`, `isAudioUnlocked` | Dùng cho test first-gesture/no-sound |
| Bus/ambience theo beat | [`docs/06-storyboard.md`](../../docs/06-storyboard.md) | Tham chiếu cách đặt cue theo beat, không copy nội dung |

## Mapping taxonomy → cue mẫu trong case study

| Family | Cue mẫu (tham chiếu) |
|---|---|
| ambience | pad theo mode/act (synth) |
| transition | cue chuyến bay/cất cánh/hạ cánh |
| ui | tap |
| answer | đúng / sai nhẹ / quét |
| reward | badge / ignite |
| warn | lỗi nhẹ, không gắt |

Danh sách trên chỉ để đối chiếu **cách phân loại**; không phải cue sheet bắt buộc.

## Nguyên tắc khi tái dùng

- Không copy chord table, melody, âm lượng tuyệt đối hay file audio từ case study.
- Không bê nguyên toàn bộ engine: dự án mới chỉ cần contract + lifecycle + parity.
- Nếu dùng asset bên ngoài, ghi license vào cue sheet; không asset ngoài khi chưa rõ quyền.
- Giữ first-gesture, mute memory, tab-hidden, no-sound và reduced-motion parity — đây là gate, không phải option.
