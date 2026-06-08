// src/lib/validation.ts
import { z } from "zod";

// 1. Strict formatting validation rules for Account Creation
export const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email field cannot be empty")
    .email("Please provide a valid, structured email address")
    .lowercase()
    .trim(),
  password: z
    .string()
    .min(6, "Security passwords must be at least 6 characters long")
    .max(100, "Password is too long"),
});

// 2. Strict formatting validation rules for Login Handshakes
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email identity is required")
    .email("Please provide a valid, structured email address")
    .lowercase()
    .trim(),
  password: z
    .string()
    .min(1, "Account authentication password is required"),
});

// 3. Strict formatting validation rules for OTP Code Validation
export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid contextual email payload"),
  otp: z.string().length(6, "Your security OTP token code must be exactly 6 digits long"),
});


// Add these to your existing src/lib/validation.ts file

// Verification rules for requesting a reset token email link
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email identity is required")
    .email("Please provide a valid, structured email address")
    .lowercase()
    .trim(),
});

// Verification rules for saving the new updated password string
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "A secure transactional token string is required"),
  password: z
    .string()
    .min(1, "A new password string is required")
    .min(6, "Your new security password must be at least 6 characters long"),
});



// Add this to your existing src/lib/validation.ts file

export const ReviewInputSchema = z.object({
  productId: z.string().min(1, "Product identifier required"), // 👈 Add this line
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});


// Add this to your existing src/lib/validation.ts file

export const ContactInputSchema = z.object({
  name: z
    .string()
    .min(2, "Please provide your name"),
  email: z
    .string()
    .min(1, "An email address is required")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject lines must be at least 3 characters long")
    .max(150, "Subject line is too long"),
  message: z
    .string()
    .min(10, "Your custom furniture message details must be at least 10 characters long")
    .max(3000, "Message block caps out at 3000 characters"),
});

