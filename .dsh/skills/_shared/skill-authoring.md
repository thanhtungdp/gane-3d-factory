# Skill authoring contract

Mọi skill trong `.dsh/skills/` phải theo contract này để DSH discover được và để `scripts/validate-skills.mjs` kiểm tra.

## Frontmatter

```yaml
---
name: kebab-case-name
description: Use when ...
---
```

- `name` trùng tên thư mục, kebab-case.
- `description` bắt đầu bằng `Use when`, nêu **khi nào dùng**, không nhồi toàn bộ quy trình.
- Body viết tiếng Việt; thuật ngữ kỹ thuật có thể giữ tiếng Anh.
- Không đặt `disable-model-invocation` trừ khi skill chỉ dành cho người đọc.

## Heading bắt buộc

```markdown
## When to use
## Inputs
## Steps
## Outputs
## Quality gates
## Handoff
```

Có thể thêm `## References`, `## Examples`, `## Anti-patterns` sau các heading trên.

## Kích thước & context

- `SKILL.md` ≤ 7500 ký tự.
- Chi tiết dài đưa vào `references/`, `templates/`, `scripts/`, `assets/`.
- Không lặp lại kiến thức đã có trong skill khác; handoff bằng tên skill.
- `brand-game-factory` chỉ tải 2–6 skill cần cho mode hiện tại, không đọc cả bộ.

## Tính phổ quát

- Dùng placeholder: `{{brand}}`, `{{audience}}`, `{{world}}`, `{{guide}}`, `{{acts}}`, `{{duration}}`.
- Không hardcode tên game hiện tại, nhân vật hiện tại, số act cố định, hành tinh, màu, câu chuyện.
- Ví dụ điền sẵn đặt ngoài `.dsh/skills/` trong `playbooks/`.
- Case study hiện tại chỉ ở `playbooks/case-saokim.md`.

## Link & resource

- Link markdown tương đối phải trỏ file tồn tại.
- Từ `.dsh/skills/<skill>/` tới root dùng `../../../`.
- Kit nằm ở `kits/<kit>/`; playbook ở `playbooks/`.

## Handoff

Mỗi skill kết thúc bằng:

- Artifact đã tạo.
- Skill nào chạy tiếp.
- Điều kiện dừng nếu thiếu input.
