import type { CultureNote } from './types';

/** Mỗi khám phá văn hoá đủ ngắn để bé đọc trong ~30 giây. */
export const CULTURE: Record<string, CultureNote> = {
  genkan: {
    id: 'genkan',
    title: 'げんかん — nơi cởi giày',
    titleJp: 'げんかん',
    icon: '👟',
    body:
      'Nhà ở Nhật có một khoảng thấp ngay cửa gọi là げんかん. Mọi người cởi giày ở đó rồi mới bước lên sàn gỗ hoặc chiếu tatami, để nhà luôn sạch sẽ. Giày được xoay mũi ra phía cửa cho gọn.',
    fact: 'Khách vào nhà sẽ nói おじゃまします. Khi về nhà mình thì nói ただいま!',
    phrase: { jp: 'おじゃまします。', romaji: 'ojamashimasu.', vi: 'Con xin phép vào nhà ạ.' },
  },
  itadakimasu: {
    id: 'itadakimasu',
    title: 'いただきます và ごちそうさま',
    titleJp: 'いただきます',
    icon: '🙏',
    body:
      'Trước khi ăn, người Nhật chắp tay nói いただきます để cảm ơn thức ăn, người nấu và thiên nhiên. Ăn xong, họ nói ごちそうさま để cảm ơn bữa ăn. Đũa không bao giờ cắm thẳng đứng vào bát cơm nhé!',
    fact: 'ごちそうさま có nghĩa gốc là "đã vất vả chạy đi chuẩn bị món ăn cho con".',
    phrase: { jp: 'ごちそうさま でした。', romaji: 'gochisousama deshita.', vi: 'Cảm ơn bữa ăn ạ.' },
  },
  otoshimono: {
    id: 'otoshimono',
    title: 'おとしもの — đồ rơi sẽ được trả lại',
    titleJp: 'おとしもの',
    icon: '🔎',
    body:
      'Ở Nhật, khi nhặt được đồ rơi, trẻ em được dạy mang đến こうばん (đồn cảnh sát nhỏ ở góc phố). Rất nhiều ví, ô và chìa khóa đã tìm lại được chủ nhờ sự thật thà này.',
    fact: 'Người Nhật tin rằng đồ vật dùng lâu có "tâm hồn", nên họ trân trọng và giữ gìn chúng.',
  },
  origami: {
    id: 'origami',
    title: 'おりがみ và mèo may mắn',
    titleJp: 'おりがみ',
    icon: '🐈',
    body:
      'おりがみ có nghĩa là "gấp giấy". Người Nhật gấp giấy đã hơn một nghìn năm. Tượng mèo vẫy tay まねきねこ đặt trước cửa tiệm để mời khách vào và mang lại may mắn.',
    fact: 'Gấp đủ 1000 con hạc giấy (せんばづる) được tin là sẽ ước gì được nấy.',
    phrase: { jp: 'ねこが できた!', romaji: 'neko ga dekita!', vi: 'Mèo xong rồi!' },
  },
  komorebi: {
    id: 'komorebi',
    title: 'こもれび — nắng xuyên qua kẽ lá',
    titleJp: 'こもれび',
    icon: '🌿',
    body:
      'こもれび (木漏れ日) là ánh nắng len qua những tán lá. Rất ít ngôn ngữ có một từ riêng cho khoảnh khắc ấy. Vườn Nhật thường có ao, đá, đèn đá và cá koi: nước tượng trưng cho sự sống, đá tượng trưng cho sự bền bỉ.',
    fact: 'Tên "Komorebi Village" chính là từ này: ngôi làng của những tia nắng lọt qua lá.',
  },
};
