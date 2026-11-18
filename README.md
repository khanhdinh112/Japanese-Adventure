# Japanese Adventure (にほんの ぼうけん)

Game học tiếng Nhật cho trẻ em Việt Nam: một cuốn truyện tranh tương tác dạy tiếng Nhật qua cuộc phiêu lưu tới ngôi nhà của bà Hana,
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
- **Chương 1 · Ngôi nhà của bà Hana** (vùng Saga, 5 chặng): Lá thư của bà Hana, Buổi sáng đầu tiên, Tìm đồ vật thất lạc,
  Làm chú mèo giấy, Bí mật khu vườn cũ. Chặng 6–10 và các vùng 2–8 đang khoá ("sắp ra mắt").
- Mỗi chặng: truyện + hội thoại, từ vựng, ngữ pháp, nghe, nhiệm vụ ngoài đời, bài tự làm, khám phá văn hoá.
- Sao: 1 = hoàn thành; 2 = tự làm đúng ≥ 2/3 và dùng ≤ 1 gợi ý; 3 = đúng ≥ 80% và đã lưu nhiệm vụ.
- Tiến trình lưu trong `localStorage` (khoá `japanese-adventure:v1`); phụ huynh có thể xuất hoặc xoá dữ liệu.
- Nghe dùng Web Speech `ja-JP`. Nếu thiết bị không có giọng Nhật, game hiện chữ thay thế và tính bài đó là từ vựng.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/` | Trang Next.js, CSS toàn cục chia nhỏ trong `app/styles/` |
| `components/screens/` | 12 màn hình |
| `components/` | `StoryScene`, `DialogueBox`, `CharacterSprite`, `WorldMap`, `RegionMap`, `StageNode`, `LearningCard`, `QuestPanel`, `MasteryFeedback`, `GameProvider` |
| `components/art/` | Tranh SVG placeholder (cảnh, bản đồ, bộ lọc màu nước) |
| `data/` | Nội dung: chặng, từ vựng, văn hoá, vùng, huy hiệu, nhân vật, bản kê tranh |
| `lib/` | Trạng thái, lưu trữ, định tuyến, giọng đọc, âm thanh |

Thêm chặng mới: thêm file trong `data/stages/` và đăng ký ở `data/stages/index.ts`.

## Thay tranh thật

Xem [docs/ASSETS.md](docs/ASSETS.md) (kích thước, toạ độ, cách khai báo trong `data/art.ts`) và trang `/art-preview`.

## Deploy Vercel

Import repository trên Vercel, chọn **Next.js**, giữ lệnh build mặc định `npm run build`.
