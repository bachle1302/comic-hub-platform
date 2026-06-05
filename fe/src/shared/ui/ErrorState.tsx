import type { ReactNode } from "react";

type ErrorStateProps = {
  action?: ReactNode;
  message?: string;
  title?: string;
};

export function ErrorState({
  action,
  message = "Da co loi xay ra. Vui long thu lai.",
  title = "Khong tai duoc du lieu",
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
