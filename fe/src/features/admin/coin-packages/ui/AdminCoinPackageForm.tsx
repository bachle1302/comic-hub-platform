"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createAdminCoinPackageInputSchema,
  type AdminCoinPackage,
  type CreateAdminCoinPackageInput,
} from "../api/admin-coin-packages.schema";

type AdminCoinPackageFormProps = {
  initialCoinPackage?: AdminCoinPackage;
  onSubmit: (input: CreateAdminCoinPackageInput) => Promise<void>;
  submitLabel?: string;
};

type FormValues = {
  name: string;
  coin: number;
  bonusCoin: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
};

function toInput(values: FormValues): CreateAdminCoinPackageInput {
  return {
    name: values.name.trim(),
    coin: values.coin,
    bonusCoin: values.bonusCoin,
    price: values.price,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  };
}

export function AdminCoinPackageForm({
  initialCoinPackage,
  onSubmit,
  submitLabel = "Lưu gói coin",
}: AdminCoinPackageFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      name: initialCoinPackage?.name ?? "",
      coin: initialCoinPackage?.coin ?? 100,
      bonusCoin: initialCoinPackage?.bonusCoin ?? 0,
      price: initialCoinPackage?.price ?? 10000,
      isActive: initialCoinPackage?.isActive ?? true,
      sortOrder: initialCoinPackage?.sortOrder ?? 0,
    },
  });

  const coin = useWatch({
    control,
    name: "coin",
  });
  const bonusCoin = useWatch({
    control,
    name: "bonusCoin",
  });
  const totalCoin =
    Number.isFinite(coin) && Number.isFinite(bonusCoin)
      ? coin + bonusCoin
      : 0;

  async function submit(values: FormValues) {
    setErrorMessage(null);

    const parsed = createAdminCoinPackageInputSchema.safeParse(
      toInput(values),
    );

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }

    try {
      await onSubmit(parsed.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Lưu gói coin thất bại",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-medium">Tên gói</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="Gói 200 coin"
            {...register("name")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Coin</span>
          <input
            type="number"
            min={1}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("coin", { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Bonus coin</span>
          <input
            type="number"
            min={0}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("bonusCoin", { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Giá VND</span>
          <input
            type="number"
            min={1000}
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("price", { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Thứ tự sắp xếp</span>
          <input
            type="number"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            {...register("isActive")}
          />
          <span className="font-medium">Hoạt động</span>
        </label>

        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          Tổng coin: <span className="font-semibold">{totalCoin}</span>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
