"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import {
  FollowedComicsList,
  getMyFollows,
  type FollowedComic,
} from "@/features/follows";

export default function MyFollowsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [follows, setFollows] = useState<FollowedComic[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?next=/me/follows");
      return;
    }

    const task = window.setTimeout(() => {
      setIsFetching(true);
      setErrorMessage(null);

      void getMyFollows()
        .then(setFollows)
        .catch((error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Khong tai duoc danh sach theo doi",
          );
        })
        .finally(() => setIsFetching(false));
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isFetching) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Dang tai danh sach theo doi...
      </div>
    );
  }

  if (errorMessage) {
    return <div className="rounded-lg border p-6 text-sm">{errorMessage}</div>;
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Truyen dang theo doi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sach truyen ban da theo doi.
        </p>
      </div>
      <FollowedComicsList follows={follows} />
    </section>
  );
}
