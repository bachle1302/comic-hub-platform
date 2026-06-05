import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

