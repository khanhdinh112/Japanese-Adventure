# Đăng nhập & lưu tiến trình (Supabase)

Mô hình: **một tài khoản phụ huynh** (email + mật khẩu, tuỳ chọn Google) quản lý **nhiều hồ sơ bé**.
Tiến trình của từng bé lưu trên cloud, mở được từ nhiều thiết bị. Chưa cấu hình Supabase thì game chạy ở
**chế độ khách** như trước (tiến trình chỉ lưu trong trình duyệt).

## Thiết lập (khoảng 10 phút)

1. Tạo project miễn phí tại https://supabase.com.
2. **SQL Editor** → dán toàn bộ `supabase/schema.sql` → Run. File tạo bảng `children`, bật Row Level Security
   (phụ huynh chỉ đọc/ghi được hồ sơ của chính mình) và giới hạn 6 bé mỗi tài khoản.
3. **Project Settings → API**: lấy *Project URL* và khoá *anon public*.
4. Khai báo biến môi trường (local: `.env.local`; Vercel: *Project → Settings → Environment Variables*, rồi Redeploy):

   | Biến | Giá trị |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | khoá anon public (không phải `service_role`) |
   | `NEXT_PUBLIC_AUTH_GOOGLE` | `true` nếu đã bật Google (tuỳ chọn) |

5. **Authentication → URL Configuration**: đặt *Site URL* là địa chỉ Vercel của bạn
   (ví dụ `https://japanese-adventure.vercel.app`) và thêm vào *Redirect URLs* cả địa chỉ đó lẫn
   `http://localhost:3000`. Bước này cần cho thư xác nhận email, đặt lại mật khẩu và Google.
6. (Tuỳ chọn) **Authentication → Providers → Google**: bật và dán Client ID/Secret.
7. (Tuỳ chọn) **Authentication → Sign In / Providers → Email**: tắt *Confirm email* nếu muốn đăng ký xong vào chơi ngay.
   Khi bật, game sẽ nhắc phụ huynh mở thư xác nhận.

Khoá `anon` được phép công khai trong mã trình duyệt; an toàn nhờ Row Level Security. **Không** đưa khoá `service_role` vào dự án.

## Luồng người dùng

- **Màn chào**: chưa đăng nhập → "Đăng nhập / Tạo tài khoản" hoặc "Chơi thử không cần tài khoản".
- **Đăng nhập** (`AuthScreen`): đăng nhập, tạo tài khoản, quên mật khẩu, đặt mật khẩu mới (từ liên kết trong thư).
- **Ai đang chơi?** (`ProfilesScreen`): chọn bé, thêm bé (tối đa 6) → tạo nhân vật. Hồ sơ chỉ được tạo trên cloud
  khi nhân vật đã được tạo, nên bấm Quay lại giữa chừng không để lại hồ sơ trống.
- **Chuyển tiến trình khách**: nếu máy này có tiến trình chơi thử, màn chọn bé sẽ đề nghị chuyển nó vào tài khoản.
- **Màn phụ huynh** (có cổng phép nhân): xem email, trạng thái đồng bộ, đổi bé, đăng xuất, xoá hồ sơ bé.

## Đồng bộ

- Mỗi thay đổi được ghi ngay vào bản lưu tạm trên máy, rồi đẩy lên cloud sau ~1,5 giây (gộp nhiều thay đổi).
- Đẩy ngay khi ẩn tab/đóng trang, khi đổi bé và khi đăng xuất. Lỗi mạng → thử lại sau 15 giây, tiến trình vẫn còn trên máy.
- Mở lại bé: nếu bản tạm trên máy có thay đổi chưa đẩy và bản cloud chưa đổi kể từ đó, dùng bản tạm; còn lại dùng bản cloud.
- Hai thiết bị chơi cùng một bé cùng lúc: bản lưu sau cùng thắng (chưa có trộn xung đột).

## Mã nguồn

| File | Vai trò |
|---|---|
| `lib/supabase.ts` | Tạo client, cờ `authEnabled`, Việt hoá lỗi |
| `lib/cloud.ts` | Truy vấn bảng `children` |
| `lib/storage.ts` | localStorage: chế độ khách, bản lưu tạm từng bé |
| `components/AuthProvider.tsx` | Phiên đăng nhập, đăng ký/đăng nhập/quên mật khẩu |
| `components/GameProvider.tsx` | Chế độ chơi (`guest`/`account`/`none`), chọn bé, đồng bộ |
| `components/screens/AuthScreen.tsx`, `ProfilesScreen.tsx` | Giao diện |
| `app/page.tsx` | Bảo vệ điều hướng theo trạng thái đăng nhập |
