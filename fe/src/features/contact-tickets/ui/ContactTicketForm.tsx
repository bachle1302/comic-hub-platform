"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  createContactTicketInputSchema,
  type ContactTicketType,
  type CreateContactTicketInput,
} from "../api/contact-tickets.schema";
import { createContactTicket } from "../api/contact-tickets.api";

const ticketTypeOptions: Array<{ label: string; value: ContactTicketType }> = [
  { value: "TECHNICAL", label: "Báo lỗi kỹ thuật" },
  { value: "PAYMENT", label: "Khiếu nại thanh toán" },
  { value: "COPYRIGHT", label: "Bản quyền / nội dung" },
  { value: "ACCOUNT", label: "Tài khoản" },
  { value: "OTHER", label: "Khác" },
];

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function ContactTicketForm() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<CreateContactTicketInput>({
    resolver: zodResolver(createContactTicketInputSchema),
    defaultValues: {
      type: "TECHNICAL",
      name: "",
      email: "",
      subject: "",
      message: "",
      relatedUrl: "",
      orderCode: "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }

    if (user?.name) {
      setValue("name", user.name);
    }
  }, [setValue, user?.email, user?.name]);

  async function submit(input: CreateContactTicketInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await createContactTicket({
        type: input.type,
        name: optionalText(input.name),
        email: input.email.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
        relatedUrl: optionalText(input.relatedUrl),
        orderCode: optionalText(input.orderCode),
      });
      setSuccessMessage(
        "Yêu cầu của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất có thể.",
      );
      reset({
        type: "TECHNICAL",
        name: user?.name ?? "",
        email: user?.email ?? "",
        subject: "",
        message: "",
        relatedUrl: "",
        orderCode: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gửi yêu cầu hỗ trợ thất bại",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-4 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-xl font-semibold">Gửi yêu cầu hỗ trợ</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Điền thông tin bên dưới để gửi báo lỗi, khiếu nại thanh toán hoặc báo
          cáo nội dung.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Loại yêu cầu</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("type")}
          >
            {ticketTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type ? (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Họ tên</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="Tên của bạn"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Mã đơn hàng</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="Nếu liên quan thanh toán"
            {...register("orderCode")}
          />
          {errors.orderCode ? (
            <p className="text-sm text-destructive">
              {errors.orderCode.message}
            </p>
          ) : null}
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Tiêu đề</span>
        <input
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="Tóm tắt vấn đề"
          {...register("subject")}
        />
        {errors.subject ? (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        ) : null}
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Link liên quan</span>
        <input
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          placeholder="/truyen/one-piece-demo/chapter/1 hoặc URL liên quan"
          {...register("relatedUrl")}
        />
        {errors.relatedUrl ? (
          <p className="text-sm text-destructive">
            {errors.relatedUrl.message}
          </p>
        ) : null}
      </label>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Nội dung</span>
        <textarea
          rows={6}
          className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
          placeholder="Mô tả vấn đề, thời điểm xảy ra, trình duyệt/thiết bị và thông tin cần thiết."
          {...register("message")}
        />
        {errors.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </label>

      <div className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
        <p>Khiếu nại thanh toán: nhập mã đơn hàng nếu có.</p>
        <p>Báo cáo nội dung: nhập link truyện, chapter hoặc comment liên quan.</p>
      </div>

      {successMessage ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
      </Button>
    </form>
  );
}
