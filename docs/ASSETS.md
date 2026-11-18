# Hướng dẫn thay tranh (Asset Guide)

Toàn bộ hình trong game hiện là **placeholder vẽ bằng SVG gốc** (phong cách màu nước, có bộ lọc `wc-paint`/`wc-soft`
trong `components/art/paint.tsx`). Chúng được thiết kế để thay bằng tranh vẽ tay mà **không phải sửa component nào**.

Xem toàn bộ placeholder và bảng thông số tại **http://localhost:3000/art-preview**.

## Cách thay một tranh

1. Xuất tranh đúng kích thước/định dạng ở bảng dưới, đặt vào `public/art/final/`.
2. Mở `data/art.ts`, điền đường dẫn vào `FINAL_ART`:

```ts
export const FINAL_ART = {
  'scene:garden': '/art/final/scene-garden.webp',
  'map:world': '/art/final/map-world.webp',
  'region:countryside': '/art/final/region-countryside.webp',
  'character:momo:happy': '/art/final/character-momo-happy.png',
};
```

3. Khoá nào chưa điền sẽ tự dùng placeholder. Có thể thay từng tranh một.

Khoá hợp lệ: `scene:<id>`, `scene:welcome`, `map:world`, `region:<theme>`, `character:<id>:<emotion>`.

## Bảng thông số

Tất cả tranh nền: **1920×1080**, WebP hoặc PNG, nền đặc (không trong suốt).

| Khoá | File gợi ý | Ghi chú |
|---|---|---|
| `scene:welcome` | `scene-welcome.webp` | Nhà bà Hana từ xa, ruộng, núi. Chừa nửa trái cho tiêu đề. |
| `scene:road` | `scene-road.webp` | Đường làng buổi sáng. Chừa 1/3 dưới yên tĩnh cho hộp thoại. |
| `scene:gate` | `scene-gate.webp` | Cổng gỗ, cẩm tú cầu, đèn đá. |
| `scene:genkan` | `scene-genkan.webp` | Genkan, giày xếp gọn, cửa shoji. |
| `scene:bedroom` | `scene-bedroom.webp` | Phòng tatami buổi sáng, futon. |
| `scene:dining` | `scene-dining.webp` | Bếp/phòng ăn, nồi súp miso. |
| `scene:living` | `scene-living.webp` | **Trò tìm đồ** — vật phẩm phải nằm trong các hộp `LIVING_SPOTS`. |
| `scene:engawa` | `scene-engawa.webp` | Hiên nhìn ra vườn. |
| `scene:garden` | `scene-garden.webp` | **Trò tìm đồ** — vật phẩm phải nằm trong các hộp `GARDEN_SPOTS`. |
| `map:world` | `map-world.webp` | Bản đồ thế giới 8 vùng, **dạng dọc 1920 × `WORLD_H`** (xem bên dưới). Saga ở đáy, Núi Phú Sĩ ở đỉnh. |
| `region:<theme>` | `region-<theme>.webp` | 8 theme: `countryside`, `lightForest`, `catTown`, `school`, `railway`, `market`, `festival`, `fuji`. Đường uốn qua 10 điểm `STAGE_POSITIONS`. |
| `character:<id>:<emotion>` | `character-<id>-<emotion>.png` | **800×1520**, PNG/WebP có alpha. Chân chạm đáy ảnh, đầu cách mép trên ~8%. |
| (icon từ) | `words/<id>.png` | 512×512, PNG trong suốt. Hiện dùng emoji ở `data/words.ts` (trường `icon`). |

- Nhân vật: `id` ∈ `player`, `hana`, `momo`; `emotion` ∈ `neutral`, `happy`, `laugh`, `surprised`, `worried`, `thinking` (18 file).
  Bé (`player`) có tuỳ chỉnh da/tóc/áo nên nên giữ SVG, hoặc vẽ đủ biến thể.
- **Không vẽ chữ vào tranh**: mọi nhãn, nút, tên vùng đều là HTML để dễ dịch và dễ truy cập.

## Toạ độ phải khớp (canvas 1920×1080)

**Vật phẩm trò tìm đồ** — `data/spots.ts` (`x`,`y` là góc trái-trên, `w`,`h` là kích thước hộp bấm).
Đặt đồ vật trong tranh đúng vào các hộp này, hoặc chỉnh số trong file để khớp tranh mới.

**Bản đồ thế giới (dọc, kiểu Candy Crush)** — `components/art/worldPath.tsx`: rộng 1920, cao `WORLD_H` (= đệm trên + `BAND` × 7 + đệm dưới, hiện khoảng 5 000 px).
Vùng thứ i (0 = Saga) có tâm ở `regionPos(i)`: x lần lượt trái/phải/giữa theo `ZIG`, y cách nhau `BAND` = 560 px, Saga ở dưới cùng.
Nếu thay bằng tranh thật cho `map:world`, hãy xuất ảnh đúng 1920 × `WORLD_H` và vẽ đường đi qua các tâm đó
(hoặc sửa `ZIG`/`BAND` cho khớp tranh). Màn hình cuộn dọc, tự cuộn tới vùng bé đang đứng.

**10 điểm dừng trên bản đồ vùng** — `STAGE_POSITIONS` trong `components/art/maps.tsx`:
(200,880) (470,820) (760,880) (1040,810) (1250,690) (1010,590) (730,560) (440,500) (700,385) (1010,330).
Vẽ con đường đi qua các điểm này, hoặc sửa mảng để khớp tranh.

## Gợi ý phong cách

Màu nước, nét bút mềm, ánh sáng tự nhiên, làng quê Nhật ấm cúng, phép màu nhẹ nhàng. Chỉ dùng tranh gốc của bạn;
không dùng nhân vật hay phong cách của phim/trò chơi có bản quyền.

## Nhạc nền (tuỳ chọn)

Mặc định nhạc không lời được tạo bằng Web Audio, không cần file. Muốn dùng bản thu của riêng bạn, đặt các file
(mp3, vòng lặp mượt, ~60–120 giây) vào `public/audio/`: `bgm-home.mp3` (chào mừng, tạo nhân vật, hồ sơ),
`bgm-adventure.mp3` (bản đồ, vùng), `bgm-calm.mp3` (chặng học, nhật ký, phụ huynh, góc luyện chữ). File nào có thì dùng, thiếu thì rơi về nhạc tạo sẵn.
Chỉ dùng nhạc bạn có bản quyền.
