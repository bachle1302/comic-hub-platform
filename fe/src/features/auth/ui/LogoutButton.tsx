"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../model/auth-store";

type LogoutButtonProps = {
  variant?: "default" | "outline" | "ghost";
};

export function LogoutButton({ variant = "outline" }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Đang thoát..." : "Đăng xuất"}
    </Button>
  );
}

