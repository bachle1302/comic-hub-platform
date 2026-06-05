type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = "Dang tai..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border p-6 text-sm text-muted-foreground">
      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      <span>{label}</span>
    </div>
  );
}
