"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminCoinPackageForm,
  getAdminCoinPackage,
  type AdminCoinPackage,
  type CreateAdminCoinPackageInput,
  updateAdminCoinPackage,
} from "@/features/admin/coin-packages";

export default function EditAdminCoinPackagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const coinPackageId = Number(params.id);
  const [coinPackage, setCoinPackage] = useState<AdminCoinPackage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCoinPackage = useCallback(async () => {
    if (!Number.isFinite(coinPackageId) || coinPackageId <= 0) {
      setErrorMessage("Coin package ID khong hop le");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setCoinPackage(await getAdminCoinPackage(coinPackageId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc goi coin",
      );
    } finally {
      setIsLoading(false);
    }
  }, [coinPackageId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadCoinPackage();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadCoinPackage]);

  async function handleSubmit(input: CreateAdminCoinPackageInput) {
    await updateAdminCoinPackage(coinPackageId, input);
    router.push("/admin/coin-packages");
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sua goi coin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cap nhat coin, gia, sortOrder va trang thai active.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/coin-packages">Quay lai</Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai goi coin...
        </div>
      ) : coinPackage ? (
        <AdminCoinPackageForm
          initialCoinPackage={coinPackage}
          submitLabel="Luu thay doi"
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
