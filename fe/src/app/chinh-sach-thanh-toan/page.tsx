import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Chính sách thanh toán và hoàn tiền",
  description: "Thông tin về gói coin, thanh toán và xử lý hoàn tiền.",
};

export default function PaymentPolicyPage() {
  return (
    <LegalPageLayout
      title="Chính sách thanh toán và hoàn tiền"
      description="Các nguyên tắc mẫu về mua coin, mở khóa nội dung trả phí và xử lý khiếu nại thanh toán."
      updatedAt="04/06/2026"
    >
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Gói coin</h2>
        <p>
          Người dùng có thể mua các gói coin để sử dụng cho việc mở khóa chương
          trả phí hoặc các tính năng có thu phí khác nếu được cung cấp.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          2. Thanh toán qua cổng thanh toán
        </h2>
        <p>
          Thanh toán được xử lý thông qua cổng thanh toán tích hợp. Người dùng
          cần kiểm tra kỹ số tiền, gói coin và thông tin giao dịch trước khi xác
          nhận.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Cộng coin sau webhook</h2>
        <p>
          Coin chỉ được cộng vào tài khoản sau khi hệ thống nhận được xác nhận
          thanh toán thành công từ webhook hoặc cơ chế đối soát tương đương.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Giao dịch thất bại hoặc hủy</h2>
        <p>
          Nếu giao dịch thất bại hoặc bị hủy, coin sẽ không được cộng. Trường
          hợp người dùng bị trừ tiền nhưng chưa nhận coin, vui lòng liên hệ hỗ
          trợ để kiểm tra.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Hoàn tiền</h2>
        <p>
          Các giao dịch coin đã sử dụng để mở khóa nội dung thường không hoàn
          lại, trừ trường hợp lỗi hệ thống hoặc giao dịch bị ghi nhận sai. Đây
          là chính sách mẫu và cần chủ site rà soát pháp lý trước khi áp dụng
          thật.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Khiếu nại thanh toán</h2>
        <p>
          Khi gửi khiếu nại, vui lòng cung cấp email tài khoản, mã đơn hàng,
          thời gian thanh toán, số tiền và ảnh chụp biên nhận nếu có.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Thời gian xử lý hỗ trợ</h2>
        <p>
          Thời gian phản hồi phụ thuộc vào mức độ phức tạp của giao dịch và thời
          gian đối soát với cổng thanh toán. Các trường hợp thiếu thông tin có
          thể cần bổ sung trước khi xử lý.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Liên hệ</h2>
        <p>
          Gửi yêu cầu qua trang{" "}
          <Link href="/lien-he" className="font-medium underline">
            Liên hệ
          </Link>{" "}
          nếu cần hỗ trợ về thanh toán hoặc hoàn tiền.
        </p>
      </section>
    </LegalPageLayout>
  );
}

