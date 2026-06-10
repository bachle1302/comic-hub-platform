"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AdminCoinPackageForm,
  createAdminCoinPackage,
  type CreateAdminCoinPackageInput,
} from "@/features/admin/coin-packages";
import { AdminLink } from "@/shared/ui/AdminLink";

export default function NewAdminCoinPackagePage() {
  const router = useRouter();

  async function handleSubmit(input: CreateAdminCoinPackageInput) {
    await createAdminCoinPackage(input);
    router.push("/admin/coin-packages");
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tạo gói coin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo gói nạp mới cho trang ví người dùng.
          </p>
        </div>
        <Button asChild>
          <AdminLink href="/admin/coin-packages">Quay lại</AdminLink>
        </Button>
      </div>

      <AdminCoinPackageForm submitLabel="Tạo gói coin" onSubmit={handleSubmit} />
    </section>
  );
}
