// src/app/api/auth/resend-otp/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendOtpEmail } from "@/lib/mailer";

interface ResendOtpBody {
  email: string;
}

export async function POST(request: Request) {
  try {
    console.log("🔄 Resend OTP request received");
    
    // 1. Establish database connection
    await connectDB();
    console.log("✅ Database connected");

    // 2. Parse and extract email from request body
    const body = (await request.json()) as unknown;
    
    if (!body || typeof body !== "object" || !("email" in body)) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const { email } = body as ResendOtpBody;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid email address is required." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase for case-insensitive search
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 Processing resend OTP for email: ${normalizedEmail}`);

    // 3. Locate user by email (case-insensitive)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account with this email does not exist." },
        { status: 404 }
      );
    }

    // 4. If user is already verified, they don't need OTP
    if (user.isVerified) {
      console.log(`ℹ️ User ${normalizedEmail} is already verified`);
      return NextResponse.json(
        { success: false, message: "Your account is already verified. Please log in directly." },
        { status: 400 }
      );
    }

    // 5. Generate a new 6-digit OTP code
    const newOtp = crypto.randomInt(100000, 1000000).toString();
    console.log(`🔐 Generated OTP for ${normalizedEmail}: ${newOtp}`);
    
    // Set expiration to 15 minutes from now
    const otpExpirationTime = new Date(Date.now() + 15 * 60 * 1000);

    // 6. Update user document with new OTP
    user.otpCode = newOtp;
    user.otpExpiresAt = otpExpirationTime;
    await user.save();
    console.log(`✅ OTP saved to database for ${normalizedEmail}`);

    // 7. Send OTP email
    try {
      await sendOtpEmail({
        toEmail: user.email,
        userName: user.name,
        otpCode: newOtp,
      });
      console.log(`📧 OTP email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send OTP email:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Verification code has been sent to ${user.email}. Please check your inbox.`,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("❌ Resend OTP Route Exception:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: `An internal server error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
