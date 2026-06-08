import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {User} from "@/models/User"; // Adjust case path matching your file tree exactly

export async function GET() {
  try {
    await connectDB();
    // Exclude password tokens for application system safety
    const users = await User.find({}).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to collect system user metrics." }, { status: 500 });
  }
}
