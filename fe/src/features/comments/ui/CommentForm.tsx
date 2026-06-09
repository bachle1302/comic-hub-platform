"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  updateCommentInputSchema,
  type UpdateCommentInput,
} from "../api/comments.schema";

type CommentFormProps = {
  initialContent?: string;
  onCancel?: () => void;
  onSubmit: (content: string) => Promise<void>;
  submitLabel?: string;
};

export function CommentForm({
  initialContent = "",
  onCancel,
  onSubmit,
  submitLabel = "Gửi bình luận",
}: CommentFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdateCommentInput>({
    resolver: zodResolver(updateCommentInputSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  async function handleValidSubmit(input: UpdateCommentInput) {
    await onSubmit(input.content);

    if (!initialContent) {
      reset({
        content: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-3">
      <div className="space-y-2">
        <textarea
          rows={4}
          placeholder="Viết bình luận..."
          className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("content")}
        />
        {errors.content ? (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang gửi..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        ) : null}
      </div>
    </form>
  );
}
