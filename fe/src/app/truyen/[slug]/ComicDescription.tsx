"use client";

import { useState } from "react";

type ComicDescriptionProps = {
  description?: string | null;
};

export function ComicDescription({ description }: ComicDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return <p className="text-sm text-muted-foreground">Chưa có mô tả.</p>;
  }

  // Show "Xem thêm" button if description is long or contains more than 3 paragraphs/newlines
  const shouldShowButton =
    description.length > 220 || description.split("\n").length > 3;

  return (
    <div>
      <p
        className={`whitespace-pre-line text-sm leading-6 text-muted-foreground transition-all duration-300 ${
          !isExpanded && shouldShowButton ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </p>
      {shouldShowButton && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-semibold text-primary hover:underline focus:outline-none"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}
