import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng dịch vụ đọc truyện tranh online.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Điều khoản sử dụng"
      description="Các quy định cơ bản khi sử dụng nền tảng đọc truyện tranh online."
      updatedAt="04/06/2026"
    >
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Chấp nhận điều khoản</h2>
        <p>
          Khi truy cập hoặc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản
          này và các chính sách liên quan được công bố trên website.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Tài khoản người dùng</h2>
        <p>
          Người dùng chịu trách nhiệm bảo mật tài khoản, mật khẩu và các hoạt
          động phát sinh từ tài khoản của mình. Nếu phát hiện truy cập bất
          thường, vui lòng liên hệ bộ phận hỗ trợ.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Quy định sử dụng nội dung</h2>
        <p>
          Nội dung trên nền tảng chỉ phục vụ mục đích đọc và trải nghiệm cá
          nhân. Người dùng không được sao chép, phát tán, trích xuất hoặc khai
          thác nội dung trái phép.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Coin và chương trả phí</h2>
        <p>
          Một số chương có thể yêu cầu coin để mở khóa. Sau khi mở khóa thành
          công, quyền truy cập được gắn với tài khoản đã mua theo chính sách vận
          hành hiện hành.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          5. Bình luận và nội dung do người dùng tạo
        </h2>
        <p>
          Người dùng chịu trách nhiệm với bình luận, báo cáo và nội dung mình
          đăng tải. Nền tảng có thể ẩn, xóa hoặc xử lý nội dung vi phạm quy
          định cộng đồng.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Hành vi bị cấm</h2>
        <p>
          Không spam, tấn công hệ thống, lạm dụng API, đăng nội dung vi phạm
          pháp luật, xúc phạm người khác, chia sẻ tài khoản trái phép hoặc tìm
          cách vượt qua cơ chế trả phí.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          7. Quyền khóa tài khoản hoặc ban user
        </h2>
        <p>
          Nền tảng có thể tạm khóa hoặc chấm dứt quyền truy cập của tài khoản
          nếu phát hiện vi phạm điều khoản, gian lận thanh toán, phá hoại hệ
          thống hoặc hành vi gây hại cho cộng đồng.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Thay đổi dịch vụ</h2>
        <p>
          Dịch vụ, giá coin, tính năng hoặc chính sách có thể được cập nhật để
          phù hợp với vận hành sản phẩm. Các thay đổi quan trọng sẽ được thông
          báo khi cần thiết.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Miễn trừ trách nhiệm</h2>
        <p>
          Nền tảng cố gắng duy trì dịch vụ ổn định nhưng không cam kết hệ thống
          luôn không gián đoạn hoặc không có lỗi. Các giới hạn trách nhiệm cụ
          thể cần được chủ site rà soát pháp lý trước khi public.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">10. Liên hệ</h2>
        <p>
          Nếu có câu hỏi về điều khoản, vui lòng xem trang{" "}
          <Link href="/lien-he" className="font-medium underline">
            Liên hệ
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}

