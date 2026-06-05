import { z } from "zod";

export const roleSchema = z.enum(["USER", "ADMIN"]);

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
  avatar: z.string().nullable(),
  coin: z.number(),
  createdAt: z.string().optional(),
});

export const registerInputSchema = z.object({
  name: z.string().min(1, "Vui long nhap ten"),
  email: z.string().email("Email khong hop le"),
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
});

export const loginInputSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(1, "Vui long nhap mat khau"),
});

export const registerResultSchema = z.object({
  message: z.string().optional(),
  user: userSchema,
});

export const loginResultSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});

export const backendLoginResultSchema = loginResultSchema.extend({
  refreshToken: z.string(),
});

export const refreshResultSchema = z.object({
  user: userSchema.optional(),
  accessToken: z.string(),
});

export const meResultSchema = userSchema;

export const logoutResultSchema = z.object({}).passthrough();

export const messageResultSchema = z.object({
  message: z.string(),
});

export const verifyEmailInputSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const verifyEmailResultSchema = messageResultSchema;

export const resendVerificationInputSchema = z.object({
  email: z.string().email("Email khong hop le"),
});

export const resendVerificationResultSchema = messageResultSchema;

export const forgotPasswordInputSchema = z.object({
  email: z.string().email("Email khong hop le"),
});

export const forgotPasswordResultSchema = messageResultSchema;

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
});

export const resetPasswordFormSchema = resetPasswordInputSchema
  .extend({
    confirmPassword: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  });

export const resetPasswordResultSchema = messageResultSchema;

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
  newPassword: z.string().min(8, "Mat khau moi toi thieu 8 ky tu"),
});

export const changePasswordFormSchema = changePasswordInputSchema
  .extend({
    confirmPassword: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
    path: ["confirmPassword"],
  });

export const changePasswordResultSchema = messageResultSchema;

export const googleLoginInputSchema = z.object({
  idToken: z.string().min(1, "Google idToken is required"),
});

export const googleLoginResultSchema = loginResultSchema;

export const backendGoogleLoginResultSchema = googleLoginResultSchema.extend({
  refreshToken: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterResult = z.infer<typeof registerResultSchema>;
export type LoginResult = z.infer<typeof loginResultSchema>;
export type RefreshResult = z.infer<typeof refreshResultSchema>;
export type MeResult = z.infer<typeof meResultSchema>;
export type LogoutResult = z.infer<typeof logoutResultSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;
export type VerifyEmailResult = z.infer<typeof verifyEmailResultSchema>;
export type ResendVerificationInput = z.infer<
  typeof resendVerificationInputSchema
>;
export type ResendVerificationResult = z.infer<
  typeof resendVerificationResultSchema
>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ForgotPasswordResult = z.infer<typeof forgotPasswordResultSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
export type ResetPasswordResult = z.infer<typeof resetPasswordResultSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
export type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;
export type ChangePasswordResult = z.infer<typeof changePasswordResultSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginInputSchema>;
export type GoogleLoginResult = z.infer<typeof googleLoginResultSchema>;
