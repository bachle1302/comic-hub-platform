import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description:
    "Cách nền tảng thu thập, sử dụng và bảo vệ dữ liệu người dùng.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Chính sách quyền riêng tư"
      description="Thông tin về dữ liệu được thu thập và cách dữ liệu được sử dụng trong quá trình vận hành nền tảng."
      updatedAt="04/06/2026"
    >
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Dữ liệu thu thập</h2>
        <p>
          Nền tảng có thể thu thập email, tên hiển thị, avatar, lịch sử đọc,
          giao dịch coin, bình luận, báo cáo vi phạm và thông tin thiết bị hoặc
          IP ở mức log vận hành.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Mục đích sử dụng</h2>
        <p>
          Dữ liệu được dùng để đăng nhập, bảo mật tài khoản, xử lý thanh toán,
          lưu tiến độ đọc, cá nhân hóa trải nghiệm, hỗ trợ người dùng và phát
          hiện hành vi lạm dụng hệ thống.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Google login</h2>
        <p>
          Nếu đăng nhập bằng Google, nền tảng chỉ sử dụng thông tin cơ bản như
          email, tên và avatar để tạo hoặc xác thực tài khoản. Không yêu cầu
          quyền truy cập không cần thiết.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Cookie và token</h2>
        <p>
          Refresh token được lưu trong HttpOnly cookie thông qua Next.js Route
          Handler. Access token chỉ lưu trong bộ nhớ RAM của trình duyệt và
          không được lưu trong bộ nhớ lâu dài phía trình duyệt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Thanh toán</h2>
        <p>
          Nền tảng không lưu thông tin thẻ hoặc tài khoản ngân hàng. Hệ thống
          chỉ lưu trạng thái đơn hàng, giao dịch coin và dữ liệu cần thiết để
          đối soát khi có khiếu nại.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Sentry và logs</h2>
        <p>
          Công cụ theo dõi lỗi và log vận hành có thể được dùng để phát hiện sự
          cố. Hệ thống không cố ý lưu mật khẩu, token hoặc dữ liệu nhạy cảm
          trong log.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Bảo mật dữ liệu</h2>
        <p>
          Nền tảng áp dụng các biện pháp kỹ thuật phù hợp như xác thực token,
          phân quyền quản trị, giới hạn tốc độ và cấu hình CORS. Không có hệ
          thống nào an toàn tuyệt đối, vì vậy người dùng nên bảo vệ tài khoản
          của mình.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Quyền người dùng</h2>
        <p>
          Người dùng có thể yêu cầu hỗ trợ về tài khoản, dữ liệu cá nhân, lịch
          sử giao dịch hoặc nội dung đã đăng bằng cách liên hệ bộ phận hỗ trợ.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Liên hệ</h2>
        <p>
          Mọi yêu cầu liên quan đến quyền riêng tư có thể gửi qua trang{" "}
          <Link href="/lien-he" className="font-medium underline">
            Liên hệ
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
