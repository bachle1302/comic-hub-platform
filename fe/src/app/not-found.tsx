import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/shared/ui";

export default function NotFound() {
  return (
    <ErrorState
      title="Khong tim thay noi dung"
      message="Trang ban can khong ton tai hoac da bi xoa."
      action={
        <Button asChild>
          <Link href="/">Ve trang chu</Link>
        </Button>
      }
    />
  );
}
