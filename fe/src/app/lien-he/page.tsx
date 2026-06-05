import type { Metadata } from "next";
import { ContactTicketForm } from "@/features/contact-tickets";
import { getPublicSystemSettingsSafe } from "@/features/system-settings";
import { LegalPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ hỗ trợ, báo lỗi, báo cáo vi phạm hoặc khiếu nại thanh toán.",
};

export default async function ContactPage() {
  const settings = await getPublicSystemSettingsSafe();
  const supportEmail = settings.general?.supportEmail ?? "support@example.com";
  const contactEmail = settings.general?.contactEmail ?? supportEmail;

  return (
    <LegalPageLayout
      title="Liên hệ"
      description="Thông tin liên hệ mẫu cho hỗ trợ kỹ thuật, báo cáo vi phạm và khiếu nại thanh toán."
      updatedAt="04/06/2026"
    >
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Email liên hệ</h2>
        <p>
          Email hỗ trợ:{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium underline">
            {supportEmail}
          </a>
        </p>
        {contactEmail !== supportEmail ? (
          <p>
            Email liên hệ chung:{" "}
            <a href={`mailto:${contactEmail}`} className="font-medium underline">
              {contactEmail}
            </a>
          </p>
        ) : null}
        <p>
          Đây là thông tin liên hệ lấy từ cấu hình hệ thống. Chủ site cần rà
          soát email hỗ trợ trước khi public production.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Báo lỗi kỹ thuật</h2>
        <p>
          Khi báo lỗi, vui lòng mô tả thao tác đã thực hiện, trình duyệt hoặc
          thiết bị đang dùng, thời điểm xảy ra lỗi và ảnh chụp màn hình nếu có.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          3. Báo cáo vi phạm bản quyền hoặc nội dung
        </h2>
        <p>
          Vui lòng gửi link truyện, chapter hoặc bình luận liên quan, kèm mô tả
          lý do báo cáo và thông tin chứng minh quyền sở hữu nếu là khiếu nại
          bản quyền.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Khiếu nại thanh toán</h2>
        <p>
          Với vấn đề thanh toán, vui lòng cung cấp email tài khoản, mã đơn hàng
          nếu có, thời gian giao dịch, số tiền và ảnh chụp biên nhận.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Thông tin nên gửi kèm</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Email tài khoản.</li>
          <li>Mã đơn hàng nếu liên quan đến thanh toán.</li>
          <li>Link truyện, chapter hoặc comment nếu liên quan đến nội dung.</li>
          <li>Mô tả ngắn gọn vấn đề và ảnh chụp màn hình nếu có.</li>
        </ul>
      </section>

      <ContactTicketForm />
    </LegalPageLayout>
  );
}
