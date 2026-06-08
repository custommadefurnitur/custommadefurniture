// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { ReviewInputSchema } from "@/lib/validation";

/**
 * Public Endpoint: Fetches all client reviews saved in MongoDB.
 * Sorted chronologically from newest to oldest.
 */
// Add "request: Request" to the parameters so you can read query params
export async function GET(request: Request) {
  try {
    await connectDB();

    // Parse the product identifier from the URL query string (e.g., ?productId=slug)
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    // Build the query object. If productId is provided, filter by it.
    const query = productId ? { productId } : {};

    // Pull filtered documents, ordering by newest first
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    console.error("❌ Review collection retrieval failed:", error);
    return NextResponse.json({ success: false, message: "Failed to collect reviews." }, { status: 500 });
  }
}


/**
 * Protected Endpoint: Allows authenticated and verified users to post a review.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const validatedFields = ReviewInputSchema.safeParse(body);
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // 1. Extract productId alongside your rating and comment values
    const { productId, rating, comment } = validatedFields.data; // 👈 Updated

    // 2. Database Write Execution Context
    const newReview = await Review.create({
      userId: session.user.id,
      reviewerName: session.user.name,
      productId, // 👈 Saves the product slug directly inside MongoDB matching your GET queries
      rating,
      comment,
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
  }
}
