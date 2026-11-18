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
  mottainai: {
    id: 'mottainai',
    title: 'もったいない — bỏ đi thì uổng quá',
    titleJp: 'もったいない',
    icon: '♻️',
    body:
      'もったいない là tiếng thốt lên khi thấy thứ gì còn dùng được mà bị bỏ phí: một cái nón cũ, một hạt cơm thừa, một tờ giấy mới viết một mặt. Người Nhật không chỉ tiếc đồ, mà còn biết ơn người làm ra nó, nên luôn tìm cách dùng lại cho đến khi hết tuổi thọ.',
    fact: 'Bà Wangari Maathai, người Kenya đoạt giải Nobel Hòa bình, đã đem từ もったいない đi giới thiệu khắp thế giới.',
    phrase: { jp: 'もったいない!', romaji: 'mottainai!', vi: 'Bỏ đi thì uổng quá!' },
  },
  kome: {
    id: 'kome',
    title: 'こめ — một hạt cơm, tám mươi tám công sức',
    titleJp: 'こめ',
    icon: '🍚',
    body:
      'Người Nhật hay nói để làm ra hạt gạo cần tới tám mươi tám bước công việc, từ gieo mạ, cấy lúa, tát nước, gặt đến xay xát. Chữ 米 (gạo) còn được tách thành ba phần 八 十 八, nghĩa là "tám mươi tám". Vì vậy ăn cơm phải ăn sạch, không bỏ thừa hạt nào.',
    fact: 'Đồng bằng Saga là một vùng trồng lúa nổi tiếng của đảo Kyushu, nơi bà Hana sống.',
    phrase: { jp: 'ごはんは おいしいです。', romaji: 'gohan wa oishii desu.', vi: 'Cơm ngon quá.' },
  },
  teruterubouzu: {
    id: 'teruterubouzu',
    title: 'てるてるぼうず — búp bê cầu nắng',
    titleJp: 'てるてるぼうず',
    icon: '🧸',
    body:
      'Mùa mưa ở Nhật gọi là つゆ, kéo dài vào khoảng tháng sáu đến giữa tháng bảy. Trẻ em làm てるてるぼうず bằng vải hoặc giấy trắng, treo ở cửa sổ để cầu ngày mai nắng đẹp. Tuy vậy mưa không xấu: cơn mưa này giúp ruộng lúa có đủ nước.',
    fact: 'Theo tục xưa, chỉ khi trời nắng thật thì mới vẽ mặt cho búp bê. Nhiều nhà ngày nay vẽ luôn cho vui.',
    phrase: { jp: 'あめが ふります。', romaji: 'ame ga furimasu.', vi: 'Trời mưa.' },
  },
  tanabata: {
    id: 'tanabata',
    title: 'たなばた — đêm ngôi sao và điều ước',
    titleJp: 'たなばた',
    icon: '🎋',
    body:
      'Ngày bảy tháng bảy là lễ たなばた. Truyền thuyết kể có hai vì sao, nàng Orihime và chàng Hikoboshi, bị dòng sông Ngân Hà chia cách và mỗi năm chỉ gặp nhau một đêm. Mọi người viết điều ước lên たんざく (dải giấy màu) rồi treo trên cành tre ささ.',
    fact: 'Người ta thường trang trí cành tre bằng giấy gấp, nên đây là lúc おりがみ tỏa sáng.',
    phrase: { jp: 'ほしが みっつ あります。', romaji: 'hoshi ga mittsu arimasu.', vi: 'Có ba ngôi sao.' },
  },
  yubikiri: {
    id: 'yubikiri',
    title: 'ゆびきり — ngoéo tay hứa nhé',
    titleJp: 'ゆびきり',
    icon: '🤙',
    body:
      'Khi muốn giữ một lời hứa thật chắc, trẻ em Nhật ngoéo ngón út vào nhau và hát bài ゆびきりげんまん. Ngoéo tay nghĩa là hứa rồi thì phải làm, dù chỉ là một hẹn nhỏ như mai cùng đi ra ruộng.',
    fact: 'Bài hát ゆびきりげんまん là một bài đồng dao rất xưa, ông bà cháu nào ở Nhật cũng thuộc.',
    phrase: { jp: 'また あした!', romaji: 'mata ashita!', vi: 'Mai gặp lại nhé!' },
  },
};
