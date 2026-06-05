import { clientApiGet, clientApiPost } from "@/shared/api/client-api";
import { clearAccessToken, setAccessToken } from "@/shared/auth/token-storage";
import {
  changePasswordResultSchema,
  forgotPasswordResultSchema,
  googleLoginResultSchema,
  loginResultSchema,
  logoutResultSchema,
  meResultSchema,
  refreshResultSchema,
  registerResultSchema,
  resendVerificationResultSchema,
  resetPasswordResultSchema,
  verifyEmailResultSchema,
  type ChangePasswordInput,
  type ChangePasswordResult,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type GoogleLoginInput,
  type GoogleLoginResult,
  type LoginInput,
  type LoginResult,
  type LogoutResult,
  type RefreshResult,
  type RegisterInput,
  type RegisterResult,
  type ResendVerificationInput,
  type ResendVerificationResult,
  type ResetPasswordInput,
  type ResetPasswordResult,
  type User,
  type VerifyEmailInput,
  type VerifyEmailResult,
} from "./auth.schema";

export function register(input: RegisterInput): Promise<RegisterResult> {
  return clientApiPost("/api/auth/register", registerResultSchema, input);
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const result = await clientApiPost("/api/auth/login", loginResultSchema, input);
  setAccessToken(result.accessToken);

  return result;
}

export async function googleLogin(
  input: GoogleLoginInput,
): Promise<GoogleLoginResult> {
  const result = await clientApiPost(
    "/api/auth/google",
    googleLoginResultSchema,
    input,
  );
  setAccessToken(result.accessToken);

  return result;
}

export function verifyEmail(
  input: VerifyEmailInput,
): Promise<VerifyEmailResult> {
  return clientApiPost(
    "/api/auth/verify-email",
    verifyEmailResultSchema,
    input,
  );
}

export function resendVerification(
  input: ResendVerificationInput,
): Promise<ResendVerificationResult> {
  return clientApiPost(
    "/api/auth/resend-verification",
    resendVerificationResultSchema,
    input,
  );
}

export function forgotPassword(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  return clientApiPost(
    "/api/auth/forgot-password",
    forgotPasswordResultSchema,
    input,
  );
}

export function resetPassword(
  input: ResetPasswordInput,
): Promise<ResetPasswordResult> {
  return clientApiPost(
    "/api/auth/reset-password",
    resetPasswordResultSchema,
    input,
  );
}

export function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  return clientApiPost("/auth/change-password", changePasswordResultSchema, input, {
    auth: true,
  });
}

export function getMe(): Promise<User> {
  return clientApiGet("/auth/me", meResultSchema, {
    auth: true,
  });
}

export async function refreshAccessTokenFromApi(): Promise<RefreshResult> {
  const result = await clientApiPost("/api/auth/refresh", refreshResultSchema);
  setAccessToken(result.accessToken);

  return result;
}

export async function logoutFromApi(): Promise<LogoutResult> {
  try {
    return await clientApiPost("/api/auth/logout", logoutResultSchema);
  } finally {
    clearAccessToken();
  }
}
