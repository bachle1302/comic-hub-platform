"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AdminCoinPackageForm,
  createAdminCoinPackage,
  type CreateAdminCoinPackageInput,
} from "@/features/admin/coin-packages";

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
          <h1 className="text-2xl font-bold">Tao goi coin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tao goi nap moi cho trang vi user.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/coin-packages">Quay lai</Link>
        </Button>
      </div>

      <AdminCoinPackageForm submitLabel="Tao goi coin" onSubmit={handleSubmit} />
    </section>
  );
}
