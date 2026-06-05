type AdminAuditLogMetadataProps = {
  metadata: unknown;
};

function renderPrimitive(value: string | number | boolean): string {
  return typeof value === "boolean" ? String(value) : `${value}`;
}

export function AdminAuditLogMetadata({
  metadata,
}: AdminAuditLogMetadataProps) {
  if (metadata === null || metadata === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (
    typeof metadata === "string" ||
    typeof metadata === "number" ||
    typeof metadata === "boolean"
  ) {
    return <span>{renderPrimitive(metadata)}</span>;
  }

  let formattedMetadata = "";

  try {
    formattedMetadata = JSON.stringify(metadata, null, 2);
  } catch {
    return <span className="text-muted-foreground">Metadata khong hop le</span>;
  }

  return (
    <pre className="max-h-56 max-w-xl overflow-auto rounded-md bg-muted p-3 text-xs">
      {formattedMetadata}
    </pre>
  );
}
