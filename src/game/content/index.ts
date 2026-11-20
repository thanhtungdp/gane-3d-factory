/**
 * Nội dung 5 trạm — 18 quyết định (S 4, A 3, O 3, K 4, IM 4).
 *
 * Quy ước:
 * - Mỗi quyết định 3 lựa chọn, điểm 2 / 1 / 0.
 * - `evidenceKey` chỉ dùng cho diagnosis và phải khớp pre-scan:
 *   S → slogan, A → logo, O → color, K → social, IM → không có.
 * - Không có ký hiệu `%`, không nhắc tên gói dịch vụ, không số liệu bịa.
 * - Quyết định không nằm trong màn quiz riêng: chúng được gắn vào hành động
 *   của từng mini-game (vùng sương, ngôi sao, mockup, bệ phóng, mốc tháng).
 */
import type { Decision, DecisionKind, PlanetContent, PlanetId } from "@/shared/types";
import { PLANET_SLUGS } from "@/shared/planets";

const S: PlanetContent = {
  planet: "S",
  slug: PLANET_SLUGS.S,
  intro: [
    "KIM đây. Trước khi tin vào cảm giác của mình về thương hiệu, hãy cùng quét lớp sương đang che {brand}.",
    "Bốn vùng sương, bốn tín hiệu. Chạm hoặc rê ngón tay để mở từng vùng.",
  ],
  outro: [
    "Bạn vừa thấy chỗ nào đang bị sương che. Không quan trọng là có lỗi, quan trọng là chọn đúng chỗ sửa trước.",
    "Rời Tinh cầu Sương Mù, {brand} mang theo một lớp khí quyển mỏng nhưng thật.",
  ],
  insight:
    "Bạn có biết… khách thường không nhớ tên công ty, nhưng nhớ cảm giác khi được hiểu đúng. Một câu định vị rõ giúp cả đội nói cùng một điều.",
  badge: {
    id: "badge-scan",
    name: "Người Quét Sương",
    blurb: "Bạn nhìn thấy tín hiệu trước khi nó thành vấn đề.",
  },
  decisions: [
    // Quyết định 1 — vùng Nội tại.
    {
      id: "s-team-one-line",
      planet: "S",
      kind: "knowledge",
      prompt: "Ba người trong đội cùng giới thiệu công ty. Họ nên nói thế nào?",
      hint: "Định vị tốt là câu mà sales, kỹ thuật và chủ doanh nghiệp có thể nói giống nhau.",
      options: [
        {
          id: "s-team-one-line-a",
          label: "Cùng một câu: giúp ai, đạt kết quả gì, bằng cách riêng nào.",
          points: 2,
          feedback: "Đúng. Khi cả đội nói cùng một câu, khách nghe thấy sự chắc chắn thay vì nhiều phiên bản.",
        },
        {
          id: "s-team-one-line-b",
          label: "Mỗi người nói theo cách hiểu của mình, miễn khách hiểu.",
          points: 1,
          feedback: "Khách hiểu, nhưng mỗi người đang bán một phiên bản hơi khác nhau của bạn.",
        },
        {
          id: "s-team-one-line-c",
          label: "Uy tín, chất lượng, giá tốt — câu nào cũng dùng được.",
          points: 0,
          feedback: "Ba cụm từ mà đối thủ nào cũng dùng. Khách không có gì để nhớ hay để kể lại.",
        },
      ],
      explain:
        "Một câu định vị không phải khẩu hiệu treo tường. Nó là bộ lọc: giúp cả đội biết việc nào đúng, việc nào nên từ chối.",
    },
    // Quyết định 2 — vùng Thị trường.
    {
      id: "s-customer-words",
      planet: "S",
      kind: "knowledge",
      prompt: "Khi khách giới thiệu bạn với đồng nghiệp, họ thường nói câu nào?",
      hint: "Hỏi ba khách quen xem họ sẽ giới thiệu bạn bằng câu gì. Câu họ nói chính là thương hiệu thật của bạn.",
      options: [
        {
          id: "s-customer-words-a",
          label: "Một câu cụ thể về việc bạn giúp họ, họ có thể lặp lại.",
          points: 2,
          feedback: "Tốt. Lặp lại nhất quán là cách duy nhất để một câu đi vào trí nhớ người khác.",
        },
        {
          id: "s-customer-words-b",
          label: "Tên công ty và giá.",
          points: 1,
          feedback: "Được. Nhưng khi chỉ còn tên và giá, khách sẽ so sánh bằng giá.",
        },
        {
          id: "s-customer-words-c",
          label: "Một lời khen chung chung: “cũng được”.",
          points: 0,
          feedback: "Lời khen chung chung là dấu hiệu thương hiệu chưa để lại dấu vết.",
        },
      ],
      explain:
        "Khách không cần hiểu chiến lược của bạn. Họ chỉ cần có sẵn một câu để kể lại. Nếu bạn không đưa, họ sẽ tự ghép từ giá và cảm giác.",
    },
    // Quyết định 3 — vùng Đối thủ.
    {
      id: "s-premium-reason",
      planet: "S",
      kind: "knowledge",
      prompt: "Khách hỏi vì sao bạn đắt hơn. Câu trả lời nào đứng vững?",
      hint: "Câu trả lời tốt không phải “chất lượng hơn”, mà là một việc cụ thể chỉ bạn làm được.",
      options: [
        {
          id: "s-premium-reason-a",
          label: "Một lợi ích cụ thể chỉ mình làm được, kèm bằng chứng.",
          points: 2,
          feedback: "Đúng. Khách trả thêm cho một lợi ích họ tin, không trả thêm cho lời khen chính mình.",
        },
        {
          id: "s-premium-reason-b",
          label: "Chất lượng hơn, dịch vụ tốt hơn.",
          points: 1,
          feedback: "Nghe hợp lý nhưng đối thủ rẻ hơn cũng nói y vậy.",
        },
        {
          id: "s-premium-reason-c",
          label: "Giảm giá để giữ khách lần này.",
          points: 0,
          feedback: "Một lần giảm giá dạy khách chờ lần giảm giá tiếp theo.",
        },
      ],
      explain:
        "Giá cao chỉ đứng được khi khác biệt rõ và nhìn thấy được. Nếu khác biệt chỉ nằm trong cảm nhận của bạn, khách sẽ chọn nơi rẻ hơn.",
    },
    // Quyết định 4 — vùng Nhận diện, diagnosis tự soi (reality check theo slogan).
    {
      id: "s-slogan-reality",
      planet: "S",
      kind: "diagnosis",
      prompt: "Website có một câu nêu rõ bạn khác biệt ở đâu không?",
      hint: "Mở website trên điện thoại, xem trong vài giây đầu có câu nào nói về khác biệt không.",
      evidenceKey: "slogan",
      evidenceLabel: "Câu định vị trên website",
      options: [
        {
          id: "s-slogan-reality-a",
          label: "Có, ở ngay màn hình đầu và lặp lại ở các trang chính.",
          points: 2,
          feedback: "Tốt. Khách chỉ cần vài giây đầu để biết đây có phải chỗ dành cho mình.",
        },
        {
          id: "s-slogan-reality-b",
          label: "Có, nhưng bị chôn sâu hoặc mỗi trang nói một kiểu.",
          points: 1,
          feedback: "Câu đúng đang bị giấu. Mỗi trang nói một kiểu thì câu nào cũng yếu.",
        },
        {
          id: "s-slogan-reality-c",
          label: "Chưa có; chỉ có tên và mô tả chung.",
          points: 0,
          feedback: "Website đang đứng tên bạn nhưng chưa nói hộ bạn.",
        },
      ],
      explain:
        "Đây là câu tự soi, không phải để trách. Nếu website chưa có câu định vị, mọi kênh khác cũng đang thiếu điểm tựa.",
    },
  ],
};

const A: PlanetContent = {
  planet: "A",
  slug: PLANET_SLUGS.A,
  intro: [
    "{brand} cần một trục quay. KIM cùng bạn nối ba ngôi sao: Sứ mệnh, Tầm nhìn, Giá trị.",
    "Sau đó đặt logo lên bản đồ định vị và chọn hai tính cách bạn dám sống cùng.",
  ],
  outro: [
    "Ba ngôi sao đã nối. {brand} giờ có một trục để quay, không phải một danh sách điều hay.",
    "Rời Đài Thiên Văn, hãy nhớ: chiến lược là thứ bạn dám từ chối, không chỉ là thứ bạn muốn.",
  ],
  insight:
    "Bạn có biết… thương hiệu mạnh thường từ chối được những khách không thuộc về mình. Từ chối đúng giúp lời hứa còn nguyên vẹn.",
  badge: {
    id: "badge-align",
    name: "Người Đặt Trục",
    blurb: "Bạn chọn được một hướng và dám để thứ khác ở lại.",
  },
  decisions: [
    // Ngôi sao 1 — Sứ mệnh.
    {
      id: "a-mission",
      planet: "A",
      kind: "knowledge",
      prompt: "Câu nào nói đúng lý do công ty bạn tồn tại?",
      hint: "Sứ mệnh nói bạn giúp ai và vì sao; doanh thu là kết quả, không phải lý do.",
      options: [
        {
          id: "a-mission-a",
          label: "Giúp một nhóm khách cụ thể giải quyết vấn đề theo cách riêng, để họ đạt kết quả.",
          points: 2,
          feedback: "Đúng. Sứ mệnh phải chỉ được việc làm hằng ngày, không chỉ để in trên tường.",
        },
        {
          id: "a-mission-b",
          label: "Trở thành công ty số một Việt Nam.",
          points: 1,
          feedback: "Đó là mục tiêu, không phải lý do tồn tại. Khách không thấy mình trong đó.",
        },
        {
          id: "a-mission-c",
          label: "Tối đa hóa lợi nhuận cho cổ đông.",
          points: 0,
          feedback: "Khách không mua vì lợi nhuận của bạn. Đây là mục tiêu tài chính, không phải sứ mệnh.",
        },
      ],
      explain:
        "Sứ mệnh đúng khi một nhân viên mới đọc xong biết mình nên làm gì và nên từ chối gì.",
    },
    // Ngôi sao 3 — Giá trị.
    {
      id: "a-values",
      planet: "A",
      kind: "knowledge",
      prompt: "Điều gì bạn sẵn sàng từ chối một hợp đồng để giữ?",
      hint: "Giá trị thật có giá của nó: một hợp đồng bị từ chối, một lần chậm tiến độ vì không chịu làm ẩu.",
      options: [
        {
          id: "a-values-a",
          label: "Một nguyên tắc cụ thể, ví dụ: không nói sai về sản phẩm để có đơn.",
          points: 2,
          feedback: "Đúng. Giá trị phải nhìn thấy được trong một quyết định, không chỉ trong một tính từ.",
        },
        {
          id: "a-values-b",
          label: "Nhiệt tình, trung thực, chuyên nghiệp.",
          points: 1,
          feedback: "Đúng nhưng ai cũng nói. Chưa đủ để hướng dẫn một quyết định khó.",
        },
        {
          id: "a-values-c",
          label: "Không có điều nào đủ rõ để từ chối.",
          points: 0,
          feedback: "Nếu không có gì để từ chối, mọi khách hàng đều có thể kéo thương hiệu đi theo hướng khác.",
        },
      ],
      explain:
        "Giá trị không phải lời hứa với khách. Đó là luật chơi nội bộ để đội biết khi nào phải dừng.",
    },
    // Sau khi đặt logo — diagnosis tự soi (reality check theo logo).
    {
      id: "a-logo-premium",
      planet: "A",
      kind: "diagnosis",
      prompt: "Nhìn logo vừa đặt: nó có khớp với mức định vị bạn chọn không?",
      hint: "Mức định vị không chỉ nằm ở giá. Nó nằm ở kiểu chữ, khoảng trống, màu và cách logo được đặt.",
      evidenceKey: "logo",
      evidenceLabel: "Logo trên website",
      options: [
        {
          id: "a-logo-premium-a",
          label: "Khớp: logo, màu và kiểu chữ cùng nói một mức.",
          points: 2,
          feedback: "Tốt. Nhận diện và định vị đang đồng thanh, không đánh nhau.",
        },
        {
          id: "a-logo-premium-b",
          label: "Khớp một phần: logo đúng nhưng cách dùng còn lẫn mức khác.",
          points: 1,
          feedback: "Khách nhận ra sự lẫn lộn dù không gọi tên được. Hãy thống nhất cách dùng trước khi mở rộng.",
        },
        {
          id: "a-logo-premium-c",
          label: "Chưa khớp: logo giống một thương hiệu ở mức khác.",
          points: 0,
          feedback: "Định vị là một chuyện, nhìn vào lại là chuyện khác. Khách tin mắt họ hơn tin lời bạn.",
        },
      ],
      explain:
        "Đây là câu tự soi: bạn vừa kiểm tra xem hình ảnh có khớp với vị trí trên bản đồ không. Không có đáp án nào bị trừ oan.",
    },
  ],
};

const O: PlanetContent = {
  planet: "O",
  slug: PLANET_SLUGS.O,
  intro: [
    "Xưởng Chế Tác đang bày sáu bề mặt của {brand}.",
    "Hai trong số đó lệch màu hoặc font so với phần còn lại. Tìm chúng trong 15 giây, rồi kiểm tra trí nhớ màu.",
  ],
  outro: [
    "Bề mặt là nơi khách chạm vào thương hiệu trước khi nghe bạn giải thích.",
    "{brand} rời Xưởng với một lớp sáng đều hơn, không chỉ ở logo.",
  ],
  insight:
    "Bạn có biết… bộ não nhận ra màu trước khi đọc chữ. Vì vậy một màu sai trên tấm biển có thể làm khách ngờ ngợ dù logo vẫn đúng.",
  badge: {
    id: "badge-craft",
    name: "Người Giữ Bề Mặt",
    blurb: "Bạn biết nhận diện không nằm gọn trong logo.",
  },
  decisions: [
    // Sau khi tìm ra 2 mockup lệch.
    {
      id: "o-why-mismatch",
      planet: "O",
      kind: "knowledge",
      prompt: "Hai mockup lệch màu và font. Nguyên nhân gốc là gì?",
      hint: "Lỗi in chỉ là triệu chứng. Hỏi xem có gì quy định màu, font và khoảng cách cho từng chất liệu không.",
      options: [
        {
          id: "o-why-mismatch-a",
          label: "Thiếu bộ quy định màu, font và khoảng cách cho từng chất liệu.",
          points: 2,
          feedback: "Đúng. Khi thiếu quy chuẩn, mỗi nhà in và mỗi người thiết kế tự quyết.",
        },
        {
          id: "o-why-mismatch-b",
          label: "File logo chưa đủ nét.",
          points: 1,
          feedback: "Có thể, nhưng file nét hơn không sửa được một màu bị in sai.",
        },
        {
          id: "o-why-mismatch-c",
          label: "Nhà in làm ẩu.",
          points: 0,
          feedback: "Đổ lỗi cho nhà in không giúp lần sau khác đi. Họ chỉ làm theo thứ được gửi.",
        },
      ],
      explain:
        "Hệ thống nhận diện không chỉ là logo. Nó là bộ luật cho màu, font, khoảng cách và cách dùng trên mọi chất liệu.",
    },
    // Sau test ghi nhớ màu.
    {
      id: "o-color-memory",
      planet: "O",
      kind: "knowledge",
      prompt: "Vì sao màu thương hiệu thường được nhận ra trước tên và logo?",
      hint: "Nghĩ đến lúc bạn nhìn một tấm biển từ xa: bạn thấy màu trước hay đọc được chữ trước?",
      options: [
        {
          id: "o-color-memory-a",
          label: "Màu được xử lý trước khi đọc chữ và lặp lại ở mọi nơi khách gặp.",
          points: 2,
          feedback: "Đúng. Màu là tín hiệu nhanh nhất, nhưng chỉ mạnh khi dùng giống nhau ở mọi nơi.",
        },
        {
          id: "o-color-memory-b",
          label: "Vì màu sáng hơn.",
          points: 1,
          feedback: "Độ sáng chỉ giúp thấy trước. Điều giữ màu trong trí nhớ là sự lặp lại nhất quán.",
        },
        {
          id: "o-color-memory-c",
          label: "Vì màu là chi tiết quan trọng nhất.",
          points: 0,
          feedback: "Màu quan trọng, nhưng nếu mỗi nơi một sắc thì khách nhớ một mớ màu, không nhớ thương hiệu.",
        },
      ],
      explain:
        "Trí nhớ thị giác cần điểm neo. Màu là điểm neo rẻ nhất, nhanh nhất — với điều kiện nó không đổi.",
    },
    // Diagnosis tự soi (reality check theo màu).
    {
      id: "o-guideline-reality",
      planet: "O",
      kind: "diagnosis",
      prompt: "Bạn đã có bản quy định nhận diện chính thức (màu, font, cách đặt logo) chưa?",
      hint: "Không cần quyển sách dày. Một trang đúng mã màu và font, cả đội dùng chung, đã là bắt đầu.",
      evidenceKey: "color",
      evidenceLabel: "Màu thương hiệu trên website",
      options: [
        {
          id: "o-guideline-reality-a",
          label: "Có, bản chính thức và cả đội dùng chung.",
          points: 2,
          feedback: "Tốt. Có bản chung nghĩa là tranh cãi về sau ít hơn.",
        },
        {
          id: "o-guideline-reality-b",
          label: "Có, nhưng chỉ một người giữ hoặc bản đã cũ.",
          points: 1,
          feedback: "Tri thức nằm trong một người là rủi ro. Người đó nghỉ việc, quy chuẩn đi theo.",
        },
        {
          id: "o-guideline-reality-c",
          label: "Chưa có; mỗi người tự xử lý.",
          points: 0,
          feedback: "Chưa có quy chuẩn là lý do hai mockup kia lệch nhau ngay trước mắt bạn.",
        },
      ],
      explain:
        "Đây là câu tự soi để dung hoà giữa điều bạn vừa học và điều đang có. Không phải bài kiểm tra để phán xét.",
    },
  ],
};

const K: PlanetContent = {
  planet: "K",
  slug: PLANET_SLUGS.K,
  intro: [
    "Bệ Phóng đã mở. {brand} chỉ có một lần ra mắt trước khách hàng.",
    "Sắp đúng thứ tự, nạp năng lượng, và trả lời khi bình luận xấu bắt đầu bay.",
  ],
  outro: [
    "Ra mắt không phải một buổi tối. Đó là một thứ tự đúng và một người dám nói thay cả đội.",
    "{brand} rời Bệ Phóng với tín hiệu đã bật, không phải với một bài đăng.",
  ],
  insight:
    "Bạn có biết… trong khủng hoảng, sự im lặng cũng là một câu trả lời — và thường là câu trả lời khách nghe thấy rõ nhất.",
  badge: {
    id: "badge-launch",
    name: "Người Cất Tiếng",
    blurb: "Bạn ra mắt bằng kịch bản, không bằng may mắn.",
  },
  decisions: [
    // Sau khi sắp 5 card ra mắt.
    {
      id: "k-order",
      planet: "K",
      kind: "knowledge",
      prompt: "Trước khi ra mắt, việc nào phải xong đầu tiên?",
      hint: "Kế hoạch ra mắt không bắt đầu bằng quảng cáo. Nó bắt đầu bằng một câu mà cả đội thuộc.",
      options: [
        {
          id: "k-order-a",
          label: "Một thông điệp duy nhất và kịch bản để cả đội nói giống nhau.",
          points: 2,
          feedback: "Đúng. Ra mắt là lúc cả đội cùng nói một câu, không phải cùng đăng nhiều câu.",
        },
        {
          id: "k-order-b",
          label: "Bộ ảnh và video thật đẹp.",
          points: 1,
          feedback: "Đẹp giúp lần đầu được chú ý, nhưng không giữ được nếu thông điệp mỗi người một kiểu.",
        },
        {
          id: "k-order-c",
          label: "Ngân sách chạy quảng cáo.",
          points: 0,
          feedback: "Tiền chạy quảng cáo khuếch đại điều đang có. Nếu thông điệp còn mơ hồ, nó khuếch đại sự mơ hồ.",
        },
      ],
      explain:
        "Thứ tự đúng là: mục tiêu và thông điệp, nội dung, kích hoạt nội bộ, ra mắt, đo lường. Sai thứ tự thì mỗi bước sau đều phải làm lại.",
    },
    // Trước khi nạp & phóng.
    {
      id: "k-one-line",
      planet: "K",
      kind: "knowledge",
      prompt: "Trên màn hình ra mắt, một câu duy nhất nên nói gì?",
      hint: "Một câu duy nhất phải nói được lợi ích khách nhận, bằng lời khách dùng.",
      options: [
        {
          id: "k-one-line-a",
          label: "Một lợi ích khách nhận được, nói bằng lời khách.",
          points: 2,
          feedback: "Đúng. Một câu đúng khách có thể nhắc lại ngay khi rời màn hình.",
        },
        {
          id: "k-one-line-b",
          label: "Tên công ty và năm thành lập.",
          points: 1,
          feedback: "Khách cần biết bạn là ai, nhưng tên và tuổi không phải lý do để nhớ.",
        },
        {
          id: "k-one-line-c",
          label: "Tất cả ưu đãi trong tháng.",
          points: 0,
          feedback: "Ưu đãi thu hút người săn giá. Họ đến vì giá và đi khi giá hết.",
        },
      ],
      explain:
        "Ra mắt không phải lúc kể hết. Đó là lúc chọn đúng một điều khách phải nhớ.",
    },
    // Diagnosis tự soi trước khi mở bình luận (reality check theo social).
    {
      id: "k-spokesperson",
      planet: "K",
      kind: "diagnosis",
      prompt: "Nếu bình luận xấu xuất hiện, ai sẽ nói thay bạn?",
      hint: "Người phát ngôn không phải người giỏi nhất, mà là người được chuẩn bị trước và có thẩm quyền.",
      evidenceKey: "social",
      evidenceLabel: "Kênh mạng xã hội của bạn",
      options: [
        {
          id: "k-spokesperson-a",
          label: "Một người có thẩm quyền, đã tập nói trước.",
          points: 2,
          feedback: "Tốt. Khủng hoảng không chờ bạn tìm người. Có người sẵn là có bước đầu.",
        },
        {
          id: "k-spokesperson-b",
          label: "Người rảnh nhất lúc đó.",
          points: 1,
          feedback: "Có thể xoay được, nhưng một câu trả lời vội dễ tạo thêm một cuộc khủng hoảng.",
        },
        {
          id: "k-spokesperson-c",
          label: "Chưa ai; mỗi người tự trả lời.",
          points: 0,
          feedback: "Nhiều giọng nói trong khủng hoảng nghe như đang cãi nhau, không phải đang giải thích.",
        },
      ],
      explain:
        "Câu tự soi này dùng kênh mạng xã hội làm bằng chứng: nơi công khai đã có, thì người chịu trách nhiệm công khai phải có trước.",
    },
    // Sau khủng hoảng.
    {
      id: "k-debrief",
      planet: "K",
      kind: "knowledge",
      prompt: "Sau khủng hoảng, việc nào giúp lần sau xử lý tốt hơn?",
      hint: "Kinh nghiệm chỉ có giá trị khi được ghi lại thành thứ người sau dùng được.",
      options: [
        {
          id: "k-debrief-a",
          label: "Ghi lại kịch bản, người phát ngôn và bằng chứng đã dùng.",
          points: 2,
          feedback: "Đúng. Một lần xử lý tốt chỉ là may mắn cho tới khi nó thành quy trình.",
        },
        {
          id: "k-debrief-b",
          label: "Họp nhắc nhau rút kinh nghiệm.",
          points: 1,
          feedback: "Ký ức sẽ phai. Không có bản ghi, bài học đi cùng người rời đi.",
        },
        {
          id: "k-debrief-c",
          label: "Bỏ qua vì chuyện hiếm khi lặp lại.",
          points: 0,
          feedback: "Khủng hoảng hiếm khi lặp y hệt, nhưng dạng chuyện thì lặp hoài.",
        },
      ],
      explain:
        "Mỗi khủng hoảng là một lần tập. Ghi lại để lần sau đội không phải học lại từ đầu.",
    },
  ],
};

const IM: PlanetContent = {
  planet: "IM",
  slug: PLANET_SLUGS.IM,
  intro: [
    "Trạm Vận Hành tua nhanh 12 tháng của {brand}.",
    "Bốn sự kiện sẽ xuất hiện. Độ nhất quán bắt đầu từ 10 và tụt dần nếu bạn chọn nhanh cho xong.",
  ],
  outro: [
    "Thương hiệu không phai trong một ngày. Nó phai vì mỗi tháng lệch một chút, mỗi người làm một kiểu.",
    "{brand} rời Trạm Vận Hành với những vệ tinh đủ sáng để giữ lửa khi bạn không có mặt.",
  ],
  insight:
    "Bạn có biết… người ta giữ được thói quen tốt khi có luật ngắn, dễ làm và có người nhắc. Thương hiệu nhất quán cũng vậy.",
  badge: {
    id: "badge-keep",
    name: "Người Giữ Lửa",
    blurb: "Bạn biến thương hiệu thành thói quen của cả đội.",
  },
  decisions: [
    // Sự kiện tháng 2.
    {
      id: "im-new-hire",
      planet: "IM",
      kind: "knowledge",
      prompt: "Nhân viên mới đăng bài với logo cũ. Bạn xử lý thế nào?",
      hint: "Cách xử lý tốt sửa được bài đăng và sửa được lần sau, không làm người mới sợ.",
      options: [
        {
          id: "im-new-hire-a",
          label: "Gửi lại file đúng kèm quy tắc để bạn ấy tự kiểm tra.",
          points: 2,
          feedback: "Đúng. Sửa nhanh và sửa dễ hiểu giúp lần sau bạn ấy tự kiểm tra được.",
        },
        {
          id: "im-new-hire-b",
          label: "Nhắn riêng để bạn ấy tự sửa.",
          points: 1,
          feedback: "Giữ được thể diện, nhưng nếu thiếu file và quy tắc, lần sau sẽ lặp lại.",
        },
        {
          id: "im-new-hire-c",
          label: "Bỏ qua, không ai để ý đâu.",
          points: 0,
          feedback: "Một bài lệch nhỏ không sao. Một năm nhiều bài lệch nhỏ tạo thành một thương hiệu khác.",
        },
      ],
      explain:
        "Nhất quán được giữ bằng những lần sửa nhỏ, lặp đi lặp lại. Không phải bằng một buổi họp lớn.",
    },
    // Sự kiện tháng 5 — diagnosis tự soi, không evidenceKey theo spec.
    {
      id: "im-dealer",
      planet: "IM",
      kind: "diagnosis",
      prompt: "Đại lý in biển hiệu lệch màu. Bạn đã chuẩn bị gì cho họ?",
      hint: "Đại lý không cố làm sai. Họ làm theo thứ duy nhất họ có: file trong nhóm chung.",
      options: [
        {
          id: "im-dealer-a",
          label: "Bộ file chuẩn, hướng dẫn màu/font và quy trình duyệt mẫu.",
          points: 2,
          feedback: "Tốt. Đại lý cần một bộ vật liệu dễ dùng, không chỉ một logo.",
        },
        {
          id: "im-dealer-b",
          label: "File logo trong thư mục chung.",
          points: 1,
          feedback: "Có file là bước đầu, nhưng thiếu hướng dẫn màu và font thì vẫn lệch.",
        },
        {
          id: "im-dealer-c",
          label: "Chưa có gì; đại lý tự làm.",
          points: 0,
          feedback: "Không có gì để theo, nên mỗi đại lý tạo một phiên bản thương hiệu riêng.",
        },
      ],
      explain:
        "Câu tự soi này không có tiêu chí website tương ứng, nên không bị trừ điểm vì bằng chứng bên ngoài.",
    },
    // Sự kiện tháng 8.
    {
      id: "im-freelancer",
      planet: "IM",
      kind: "knowledge",
      prompt: "Freelancer mới thiết kế theo gu riêng. Bạn chọn cách nào?",
      hint: "Người ngoài không biết luật của bạn. Đưa luật ngắn kèm ví dụ đúng hiệu quả hơn sửa từng bài.",
      options: [
        {
          id: "im-freelancer-a",
          label: "Đưa quy định ngắn kèm mẫu đã duyệt; duyệt bài trước khi đăng.",
          points: 2,
          feedback: "Đúng. Freelancer làm tốt hơn khi biết giới hạn, không phải khi được thả tự do hoàn toàn.",
        },
        {
          id: "im-freelancer-b",
          label: "Góp ý trực tiếp từng bài.",
          points: 1,
          feedback: "Bạn đang làm việc của một quy chuẩn bằng miệng. Sớm muộn cũng quá tải.",
        },
        {
          id: "im-freelancer-c",
          label: "Để họ sáng tạo tự do cho đỡ tốn thời gian.",
          points: 0,
          feedback: "Tự do sáng tạo trong khuôn khổ là tốt. Tự do không khuôn khổ tạo ra thương hiệu thứ hai.",
        },
      ],
      explain:
        "Người ngoài không biết luật của bạn. Đưa luật ngắn, rõ, kèm ví dụ đúng là cách nhân bản sự nhất quán.",
    },
    // Sự kiện tháng 11 — diagnosis tự soi, không evidenceKey.
    {
      id: "im-scale",
      planet: "IM",
      kind: "diagnosis",
      prompt: "Mở chi nhánh mới. Bạn giữ thương hiệu nhất quán bằng cách nào?",
      hint: "Chi nhánh không đọc được chiến lược trong đầu bạn. Họ chỉ dùng được thứ được bàn giao.",
      options: [
        {
          id: "im-scale-a",
          label: "Chỉ định một người phụ trách nhận diện, đào tạo và bộ mẫu cho chi nhánh.",
          points: 2,
          feedback: "Tốt. Mở rộng bền vững là mở rộng hệ thống, không chỉ mở thêm địa điểm.",
        },
        {
          id: "im-scale-b",
          label: "Gửi bộ file rồi tin tưởng.",
          points: 1,
          feedback: "Thiện chí không thay được hướng dẫn. Người mới sẽ tự đoán những chỗ bạn cho là hiển nhiên.",
        },
        {
          id: "im-scale-c",
          label: "Mỗi chi nhánh tự làm theo cách hiểu của mình.",
          points: 0,
          feedback: "Đó là cách một thương hiệu trở thành nhiều thương hiệu nhỏ, cùng tên.",
        },
      ],
      explain:
        "Câu tự soi về hệ thống vận hành. Không có tiêu chí website tương ứng, nên không bị trừ điểm.",
    },
  ],
};

/** Toàn bộ nội dung 5 trạm, tra theo PlanetId. */
export const PLANET_CONTENT: Record<PlanetId, PlanetContent> = {
  S,
  A,
  O,
  K,
  IM,
};

/** Toàn bộ quyết định theo thứ tự trạm — tiện cho test và docs. */
export const ALL_DECISIONS: Decision[] = [
  ...S.decisions,
  ...A.decisions,
  ...O.decisions,
  ...K.decisions,
  ...IM.decisions,
];

const BY_ID = new Map(ALL_DECISIONS.map((d) => [d.id, d]));

export function decisionById(id: string): Decision | undefined {
  return BY_ID.get(id);
}

export function decisionsFor(planet: PlanetId): Decision[] {
  return PLANET_CONTENT[planet].decisions;
}

export function decisionsOfKind(planet: PlanetId, kind: DecisionKind): Decision[] {
  return PLANET_CONTENT[planet].decisions.filter((d) => d.kind === kind);
}
