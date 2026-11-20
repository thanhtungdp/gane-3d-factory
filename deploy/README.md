# Map `game.davidtung.net` → dev server `127.0.0.1:5173`

## Hiện trạng (đã kiểm tra)

- DNS `game.davidtung.net` đi qua Cloudflare.
- Domain đang trả một app **Next.js khác** (`/dashboard` → `/login`), không phải nginx trên máy này.
- Trên máy này **không có** `server_name game.davidtung.net` trong nginx, cũng không có tunnel đang chạy.
- `sudo` trên máy bị hỏng (`/usr/bin/sudo` không còn setuid root), nên không thể tự sửa `/etc/nginx` bằng sudo.

Vì vậy cần **một trong hai** đường dưới đây. Cả hai đều đã chuẩn bị config sẵn.

## Cách A — Cloudflare Tunnel (khuyến nghị, không cần root)

1. Đăng nhập Cloudflare:
   ```bash
   cloudflared tunnel login
   ```
   Làm theo link mở ra, chọn zone `davidtung.net`.

2. Tạo tunnel + route DNS:
   ```bash
   cloudflared tunnel create saokim-game
   cloudflared tunnel route dns saokim-game game.davidtung.net
   ```

3. Sửa `deploy/cloudflared/config.yml`: thay `<TUNNEL_ID>` bằng ID vừa tạo.

4. Chạy tunnel:
   ```bash
   cloudflared tunnel --config deploy/cloudflared/config.yml run
   ```

Hoặc tạo tunnel trên **Cloudflare Dashboard → Zero Trust → Networks → Tunnels**, thêm Public Hostname:

- Hostname: `game.davidtung.net`
- Service: `http://localhost:5173`

rồi chạy connector bằng token của tunnel đó.

Sau khi tunnel lên, mở `https://game.davidtung.net` — Vite đã được khai báo `allowedHosts` cho domain này.

## Cách B — nginx trên máy này (cần root)

Chỉ dùng nếu Cloudflare origin của `game.davidtung.net` trỏ về **máy này** (IP public hoặc tunnel trên máy này).

```bash
sudo cp deploy/nginx/game.davidtung.net.conf /etc/nginx/sites-available/game.davidtung.net
sudo ln -sf /etc/nginx/sites-available/game.davidtung.net /etc/nginx/sites-enabled/game.davidtung.net
sudo certbot --nginx -d game.davidtung.net --redirect
sudo nginx -t && sudo systemctl reload nginx
```

Nếu chưa có cert, chạy certbot trước (webroot `/var/www/html`), rồi mới thêm `listen 443`/`ssl_certificate` (certbot `--nginx` tự làm).

## Kiểm tra sau khi map

```bash
curl -I https://game.davidtung.net
curl -s https://game.davidtung.net/api/health
```

- Trang phải trả HTML của Vite (có `Hành trình Sao Kim`).
- `/api/health` phải trả `{"ok":true,...}` — Vite proxy `/api` sang API 8788.
- Nếu HMR không chạy, thêm vào `vite.config.ts` khi chạy qua domain:
  ```ts
  server: { hmr: { clientPort: 443, protocol: "wss" } }
  ```
  (chỉ bật khi test qua domain; truy cập trực tiếp `:5173` vẫn dùng HMR mặc định).

## Ghi chú

- Không cần đổi API: Vite proxy `/api` → `127.0.0.1:8788`; domain chỉ cần trỏ vào 5173.
- Nếu dùng tunnel, đặt `PUBLIC_ORIGIN=https://game.davidtung.net` khi chạy server production để QR/PDF/share dùng đúng domain.
- Dev server hiện chạy tại `127.0.0.1:5173` và API `127.0.0.1:8788`.
