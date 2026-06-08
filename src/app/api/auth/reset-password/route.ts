// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ResetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Structural Verification Guard check via Zod
    const validatedFields = ResetPasswordSchema.safeParse(body);
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Invalid payload formatting structure.", errors }, { status: 400 });
    }

    const { token, password } = validatedFields.data;

    // 2. Scan database to locate the token, checking its expiration bounds concurrently
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() }, // Enforces expiration date target string checks
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "The recovery token parameter is invalid or has expired. Please request a new link." },
        { status: 400 }
      );
    }

    // 3. Encrypt new password using a secure 12-salt configuration cycle
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(password, salt);

    // 4. Update the core profile document cells and securely clear out recovery paths
    user.passwordHash = newPasswordHash;
    user.resetToken = undefined; // Eliminates property reference string out of record block
    user.resetTokenExpiresAt = undefined;
    
    await user.save();

    return NextResponse.json(
      { success: true, message: "Your security login password has been changed successfully. You can proceed to log in." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Critical Exception processing reset-password token execution:", error);
    return NextResponse.json({ success: false, message: "Internal application processing error." }, { status: 500 });
  }
}
