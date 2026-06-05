"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GOOGLE_CLIENT_ID } from "@/shared/config/env";
import { useAuth } from "../model/auth-store";

export function GoogleLoginButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        Google login is not configured
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const idToken = credentialResponse.credential;

            if (!idToken) {
              setErrorMessage("Google did not return an id token");
              return;
            }

            void loginWithGoogle(idToken)
              .then((result) => {
                const next = searchParams.get("next");
                router.push(
                  next ?? (result.user.role === "ADMIN" ? "/admin" : "/"),
                );
                router.refresh();
              })
              .catch((error: unknown) => {
                setErrorMessage(
                  error instanceof Error
                    ? error.message
                    : "Google login failed",
                );
              });
          }}
          onError={() => setErrorMessage("Google login failed")}
          useOneTap={false}
        />
      </div>
      {errorMessage ? (
        <p className="text-center text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
