// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { VerifyOtpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // 1. Establish the Mongoose connection context
    await connectDB();

    // 2. Safely capture the incoming request body
    const body = (await request.json()) as unknown;

    // 3. Run inputs through our centralized Zod verification schema
    const validatedFields = VerifyOtpSchema.safeParse(body);
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Invalid verification inputs provided.", errors },
        { status: 400 }
      );
    }

    const { email, otp } = validatedFields.data;

    // 4. Locate the user document matching the provided email identifier
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account profile could not be found." },
        { status: 404 }
      );
    }

    // 5. Validation Check: Ensure the user isn't already active and verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: true, message: "This account has already been verified. You can proceed to log in." },
        { status: 200 }
      );
    }

    // 6. Security Check: Validate if an OTP token exists for this profile
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { success: false, message: "No active verification token found. Please request a new security code." },
        { status: 400 }
      );
    }

    // 7. Expiration Check: Compare current time string against token expiration limit
    const isTokenExpired = new Date() > new Date(user.otpExpiresAt);
    if (isTokenExpired) {
      return NextResponse.json(
        { success: false, message: "The verification code has expired. Please generate a fresh OTP token code." },
        { status: 400 }
      );
    }

    // 8. Equality Check: Confirm matching validation strings
    if (user.otpCode !== otp) {
      return NextResponse.json(
        { success: false, message: "Incorrect security code. Please crosscheck your inbox numbers and try again." },
        { status: 400 }
      );
    }

    // 9. Document State Modification: Activate user profile and wipe temporary OTP variables
    user.isVerified = true;
    user.otpCode = undefined; // Clears property slot in database record
    user.otpExpiresAt = undefined;
    
    // Persist modifications back to MongoDB storage cells
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Account activated successfully! Your profile is verified to post reviews and submit custom contact requests.",
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("❌ Critical OTP Verification Endpoint Exception Intercepted:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected system routing breakdown occurred during verification processing." },
      { status: 500 }
    );
  }
}
