"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createAdminCategoryInputSchema,
  type AdminCategory,
  type CreateAdminCategoryInput,
} from "../api/admin-categories.schema";

type AdminCategoryFormProps = {
  initialCategory?: AdminCategory | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (input: CreateAdminCategoryInput) => Promise<void>;
};

export function AdminCategoryForm({
  initialCategory,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: AdminCategoryFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateAdminCategoryInput>({
    resolver: zodResolver(createAdminCategoryInputSchema),
    defaultValues: {
      name: initialCategory?.name ?? "",
      slug: initialCategory?.slug ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: initialCategory?.name ?? "",
      slug: initialCategory?.slug ?? "",
    });
  }, [initialCategory, reset]);

  async function submit(input: CreateAdminCategoryInput) {
    await onSubmit(input);

    if (!initialCategory) {
      reset({
        name: "",
        slug: "",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-4 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-lg font-semibold">
          {initialCategory ? "Sua the loai" : "Them the loai"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhap ten va slug the loai dung cho admin catalog.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category-name" className="text-sm font-medium">
            Ten the loai
          </label>
          <input
            id="category-name"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="category-slug" className="text-sm font-medium">
            Slug
          </label>
          <input
            id="category-slug"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("slug")}
          />
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Dang luu..."
            : initialCategory
              ? "Cap nhat the loai"
              : "Them the loai"}
        </Button>
        {initialCategory && onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Huy
          </Button>
        ) : null}
      </div>
    </form>
  );
}
