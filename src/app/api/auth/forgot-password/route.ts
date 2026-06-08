// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ForgotPasswordSchema } from "@/lib/validation";
import { sendResetPasswordEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Zod Verification Guard Checks
    const validatedFields = ForgotPasswordSchema.safeParse(body);
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, message: "Invalid email syntax format.", errors }, { status: 400 });
    }

    const { email } = validatedFields.data;

    // 2. Identify target system user account sheet profile
    const user = await User.findOne({ email });
    
    // Security Best Practice: If user doesn't exist, do NOT tell the client.
    // This prevents malicious actors from scanning your database for active emails.
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If an account profile matches that email, a recovery token link has been sent out." },
        { status: 200 }
      );
    }

    // 3. Generate high-entropy hex string token via native crypto engine
    const tokenHex = crypto.randomBytes(32).toString("hex");
    
    // Set validation shelf-life to exactly 1 hour from current execution timestamp
    const tokenExpirationTime = new Date(Date.now() + 60 * 60 * 1000);

    // 4. Update data metrics on the user Mongoose profile document
    user.resetToken = tokenHex;
    user.resetTokenExpiresAt = tokenExpirationTime;
    await user.save();

    // 5. Fire Nodemailer background route process task
    try {
      await sendResetPasswordEmail({
        toEmail: user.email,
        userName: user.name,
        resetToken: tokenHex,
      });
    } catch (mailError) {
      console.error("❌ Reset link routing engine failure encountered:", mailError);
    }

    return NextResponse.json(
      { success: true, message: "If an account profile matches that email, a recovery token link has been sent out." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Critical Exception processing forgot-password token mapping:", error);
    return NextResponse.json({ success: false, message: "Internal application processing breakdown." }, { status: 500 });
  }
}
