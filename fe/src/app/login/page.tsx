import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

