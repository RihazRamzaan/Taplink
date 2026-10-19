import { z } from "zod";

const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "auth", "blog", "dashboard", "help", "home",
  "login", "logout", "me", "new", "null", "profile", "register", "root",
  "settings", "signup", "static", "support", "undefined", "user", "users",
  "www", "about", "contact", "terms", "privacy", "security", "r", "uploads",
]);

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or less")
  .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens")
  .refine((val) => !RESERVED_USERNAMES.has(val), "This username is reserved");

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: usernameSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or less"),
  displayName: z.string().max(50, "Display name must be 50 characters or less").optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  url: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "Only http and https URLs are allowed"
    ),
  enabled: z.boolean().default(true),
});

export const profileSchema = z.object({
  displayName: z.string().max(50, "Display name too long").optional(),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type LinkInput = z.infer<typeof linkSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
