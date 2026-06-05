"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  adjustUserCoinInputSchema,
  type AdjustUserCoinInput,
} from "../api/admin-users.schema";
import { adjustUserCoin } from "../api/admin-users.api";

type AdjustUserCoinFormProps = {
  currentCoin: number;
  onAdjusted: () => Promise<void> | void;
  userId: number;
};

export function AdjustUserCoinForm({
  currentCoin,
  onAdjusted,
  userId,
}: AdjustUserCoinFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    control,
  } = useForm<AdjustUserCoinInput>({
    resolver: zodResolver(adjustUserCoinInputSchema),
    defaultValues: {
      amount: 0,
      reason: "",
    },
  });
  const amount = useWatch({
    control,
    name: "amount",
  });
  const numericAmount =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const previewBalance =
    numericAmount !== 0 ? currentCoin + numericAmount : currentCoin;

  async function submit(input: AdjustUserCoinInput) {
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await adjustUserCoin(userId, {
        amount: input.amount,
        reason: input.reason?.trim() || undefined,
      });
      setMessage(`Da cap nhat coin: ${result.user.coin}`);
      reset({
        amount: 0,
        reason: "",
      });
      await onAdjusted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cap nhat coin that bai",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-4 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-lg font-semibold">Dieu chinh coin</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Coin hien tai: <span className="font-medium">{currentCoin}</span>.
          Balance sau dieu chinh:{" "}
          <span className="font-medium">{previewBalance}</span>.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Amount</span>
          <input
            type="number"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Ly do</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="VD: Admin top up for testing"
            {...register("reason")}
          />
          {errors.reason ? (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          ) : null}
        </label>

        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Dang luu..." : "Cap nhat"}
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  );
}
