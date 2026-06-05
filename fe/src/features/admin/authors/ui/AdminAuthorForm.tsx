"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createAdminAuthorInputSchema,
  type AdminAuthor,
  type CreateAdminAuthorInput,
} from "../api/admin-authors.schema";

type AdminAuthorFormProps = {
  initialAuthor?: AdminAuthor | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (input: CreateAdminAuthorInput) => Promise<void>;
};

export function AdminAuthorForm({
  initialAuthor,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: AdminAuthorFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateAdminAuthorInput>({
    resolver: zodResolver(createAdminAuthorInputSchema),
    defaultValues: {
      name: initialAuthor?.name ?? "",
      slug: initialAuthor?.slug ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: initialAuthor?.name ?? "",
      slug: initialAuthor?.slug ?? "",
    });
  }, [initialAuthor, reset]);

  async function submit(input: CreateAdminAuthorInput) {
    await onSubmit(input);

    if (!initialAuthor) {
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
          {initialAuthor ? "Sua tac gia" : "Them tac gia"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhap ten va slug tac gia dung cho admin catalog.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="author-name" className="text-sm font-medium">
            Ten tac gia
          </label>
          <input
            id="author-name"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="author-slug" className="text-sm font-medium">
            Slug
          </label>
          <input
            id="author-slug"
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
            : initialAuthor
              ? "Cap nhat tac gia"
              : "Them tac gia"}
        </Button>
        {initialAuthor && onCancel ? (
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
