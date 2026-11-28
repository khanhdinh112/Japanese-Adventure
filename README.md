# Japanese Adventure (にほんの ぼうけん)

Game học tiếng Nhật cho trẻ em Việt Nam: một cuốn truyện tranh tương tác dạy tiếng Nhật qua cuộc phiêu lưu tới ngôi nhà của bà Osano,
cùng chú mèo Momo. Giao diện desktop 1920×1080 (tự co theo cửa sổ), tranh nền màu nước vẽ bằng SVG gốc.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
# hoặc bản production
npm run build && npm start
```

Kiểm tra kiểu: `npx tsc --noEmit`.

## Nội dung hiện có

- **12 màn hình**: Chào mừng, Tạo nhân vật, Bản đồ thế giới (8 vùng), Bản đồ vùng (10 chặng), Cảnh truyện, Từ vựng,
  Ngữ pháp, Nghe, Nhiệm vụ ngoài đời, Nhật ký tuần, Kết quả, Bảng phụ huynh (có cổng phép nhân).
- **Chương 1 · Ngôi nhà của bà Osano** (vùng Saga, 10 chặng): Lá thư của bà Osano, Buổi sáng đầu tiên, Tìm đồ vật thất lạc,
  Làm chú mèo giấy, Bí mật khu vườn cũ, Con đường ven ruộng, Bữa cơm tối, Mưa mùa hè, Ngôi sao giấy, Lời hẹn ngày mai.
  Các vùng 2–8 đang khoá ("sắp ra mắt"). Chặng 6–10 lấy cảm hứng từ tinh thần "bà ngoại ở Saga nghèo mà vui" (xem
  [docs/STORY.md](docs/STORY.md)); toàn bộ tình tiết và nhân vật là sáng tác gốc.
- Mỗi chặng: truyện + hội thoại, từ vựng, ngữ pháp, nghe, nhiệm vụ ngoài đời, bài tự làm, khám phá văn hoá.
- Sao: 1 = hoàn thành; 2 = tự làm đúng ≥ 2/3 và dùng ≤ 1 gợi ý; 3 = đúng ≥ 80% và đã lưu nhiệm vụ.
- **Bản đồ dọc kiểu Candy Crush**: bắt đầu ở làng Saga phía dưới, cuộn lên để gặp vùng mới, đỉnh là Núi Phú Sĩ.
- **Nhân vật & tủ đồ**: bé trai / bé gái có khuôn mặt, kiểu tóc, trang phục, mũ, phụ kiện riêng; một số món mở bằng ⭐ đã kiếm hoặc theo cấp.
- **Sao & điểm kinh nghiệm (XP)**: bấm các chip ⭐ ✨ 🔥 trên thanh trên cùng để xem cách kiếm và để làm gì. Cấp độ và danh hiệu theo XP.
- **Góc luyện chữ**: bảng Hiragana, Katakana, 36 Kanji khởi đầu; tập viết trên khung có chữ mờ; trò nhận mặt chữ (đọc, chọn chữ, nghe rồi chọn). Thuộc đủ mỗi 10 chữ nhận 1 ⭐.
- **Hướng dẫn nhanh** cho người mới, nhạc nền không lời (bật/tắt trong Cài đặt), giọng đọc lời thoại.
- **Cốt truyện dài hạn** "Tám chiếc đèn Komorebi": xem [docs/STORY.md](docs/STORY.md).
- **Quản trị**: tài khoản admin (cấp bằng SQL) xem và xoá được tài khoản phụ huynh, xem mục "Quyền admin" trong [docs/AUTH.md](docs/AUTH.md).
- **Đăng nhập (tuỳ chọn):** tài khoản phụ huynh qua Supabase, nhiều hồ sơ bé, đồng bộ nhiều thiết bị — xem [docs/AUTH.md](docs/AUTH.md). Chưa cấu hình thì chạy ở chế độ khách, tiến trình lưu trong `localStorage`; phụ huynh có thể xuất hoặc xoá dữ liệu.
- Nghe dùng Web Speech `ja-JP`. Nếu thiết bị không có giọng Nhật, game hiện chữ thay thế và tính bài đó là từ vựng.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/` | Trang Next.js, CSS toàn cục chia nhỏ trong `app/styles/` |
| `components/screens/` | Các màn hình (cùng `LettersScreen`, `AdminScreen`) |
| `components/` | `StoryScene`, `DialogueBox`, `CharacterSprite`, `WorldMap`, `RegionMap`, `StageNode`, `LearningCard`, `QuestPanel`, `MasteryFeedback`, `GameProvider` |
| `components/art/` | Tranh SVG placeholder (cảnh, bản đồ, bộ lọc màu nước) |
| `data/` | Nội dung: chặng, từ vựng, văn hoá, vùng, huy hiệu, nhân vật, bản kê tranh |
| `lib/` | Trạng thái, lưu trữ, định tuyến, giọng đọc, âm thanh |

Thêm chặng mới: thêm file trong `data/stages/` và đăng ký ở `data/stages/index.ts`.

## Thay tranh thật

Xem [docs/ASSETS.md](docs/ASSETS.md) (kích thước, toạ độ, cách khai báo trong `data/art.ts`) và trang `/art-preview`.

## Hiệu ứng 3D (three.js)

- `components/fx/ThreeAmbient.tsx`: nền 3D (cánh hoa, lá, bụi sáng, đom đóm, mưa), nghiêng nhẹ theo con trỏ. `AmbientLayer` tải động và tự rơi về hiệu ứng CSS khi máy không có WebGL.
- `components/fx/ThreeStars.tsx` và `ThreeCoin.tsx`: sao 3D có pháo giấy và đồng xu huy hiệu ở màn kết quả (qua `RewardFx.tsx`, cũng có dự phòng).
- Tôn trọng `prefers-reduced-motion` (chỉ vẽ một khung tĩnh). Gói three nằm trong chunk riêng, không làm nặng lần tải đầu.
- Xem thử các nền ở trang `/fx-preview`.

## Chạy trên điện thoại

- Điện thoại có **giao diện riêng**, không còn dùng khung 1920×1080 thu nhỏ: cầm ngang dùng khung logic ~1180px (`.is-land`), cầm dọc ~600px (`.is-port`); khung phủ kín màn hình (không viền đen), chữ và nút to hơn. Toàn bộ bố cục riêng nằm ở `app/styles/phone.css`, bản đồ thế giới / vùng dạng danh sách ở `components/screens/PhoneMaps.tsx`. Xem thử trên máy tính: thêm `?phone=1` vào địa chỉ rồi thu nhỏ cửa sổ.
- Có nút vào toàn màn hình và khoá xoay ngang (Android Chrome), cũng có trong Cài đặt.
- Có manifest PWA (`app/manifest.ts`, icon trong `public/icons`): Android Chrome chọn "Cài đặt ứng dụng"; iPhone Safari chọn Chia sẻ → "Thêm vào MH chính". Mở từ biểu tượng sẽ chạy toàn màn hình, xoay ngang.
- Tránh tai thỏ (`safe-area`), tắt zoom/kéo-làm-mới, vùng chạm của nút được mở rộng vô hình trên điện thoại, hiệu ứng nền 3D vẽ nhẹ hơn (nửa độ phân giải, ít hạt).
- Giọng đọc dùng Web Speech API: lần chạm đầu tiên game mở khoá âm thanh và dò giọng tiếng Nhật bằng một câu im lặng (cần cho iPhone và nhiều máy Android báo danh sách giọng rỗng). Nếu máy chưa có giọng Nhật, Cài đặt hiện hướng dẫn cài và nút “Kiểm tra lại”.
- Chưa có service worker nên chưa chơi offline.

## Deploy Vercel

Import repository trên Vercel, chọn **Next.js**, giữ lệnh build mặc định `npm run build`.
Muốn bật đăng nhập: thêm các biến trong `.env.example` vào *Settings → Environment Variables* rồi Redeploy (chi tiết ở docs/AUTH.md).
