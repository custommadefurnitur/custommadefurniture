import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FAQ from "@/models/faq.model";

export async function GET() {
  try {
    // 1. Resolve active user session server-side
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 401 });
    }

    await connectDB();

    // 2. Fetch questions submitted by this specific customer ID
    const userQuestions = await FAQ.find({ askedBy: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: userQuestions }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to resolve user historical records:", error);
    return NextResponse.json({ success: false, message: "Server error retrieving dashboard records." }, { status: 500 });
  }
}
