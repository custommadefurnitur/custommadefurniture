// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SignUpSchema } from "@/lib/validation";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    // 1. Establish the Mongoose database connection context
    await connectDB();

    // 2. Parse the incoming request payload string data safely
    const body = (await request.json()) as unknown;

    // 3. Validate input field formats strictly using our centralized Zod schema
    const validatedFields = SignUpSchema.safeParse(body);
    if (!validatedFields.success) {
      // Collect specific error details from the Zod validation results array
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Invalid form input structures.", errors },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // 4. Integrity Check: Ensure an account doesn't already exist with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // 5. Crypto Security: Generate an encrypted hash of the user's password string
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. OTP Generation: Create a secure 6-digit random code using node crypto engine
    // We use crypto.randomInt to guarantee integer outputs between 100000 and 999999
    const randomOtp = crypto.randomInt(100000, 1000000).toString();

    // Set token expiration limit to exactly 15 minutes from the current system timestamp
    const otpExpirationTime = new Date(Date.now() + 15 * 60 * 1000);

    // 7. Database Write: Save the new unverified user configuration record to MongoDB
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      isVerified: false,
      otpCode: randomOtp,
      otpExpiresAt: otpExpirationTime,
    });

    // 8. Transactional Mail: Fire the OTP verification email pipeline via Nodemailer
    try {
      await sendOtpEmail({
        toEmail: newUser.email,
        userName: newUser.name,
        otpCode: randomOtp,
      });
    } catch (emailError) {
      console.error("❌ Nodemailer failed to route registration email out:", emailError);
      // We do not abort the process here since the account configuration is safely written.
      // The user can request an OTP resend later if needed.
    }

    // Return clean confirmation response without exposing structural password data hashes
    return NextResponse.json(
      {
        success: true,
        message: "Registration initiated successfully. Please check your inbox for your 6-digit OTP code.",
        email: newUser.email,
      },
      { status: 201 }
    );

  } catch (globalError: unknown) {
    console.error("❌ Critical Sign-Up Route Exception Failure Intercepted:", globalError);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred during account registration processing." },
      { status: 500 }
    );
  }
}
