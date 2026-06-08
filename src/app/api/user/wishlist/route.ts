import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

interface WishlistBody {
  action: "toggle";
  itemType: "product" | "post";
  slug: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      wishlistProducts: user.wishlistProducts || [],
      wishlistPosts: user.wishlistPosts || [],
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as WishlistBody | null;
  if (
    !body ||
    body.action !== "toggle" ||
    !["product", "post"].includes(body.itemType) ||
    typeof body.slug !== "string" ||
    !body.slug.trim()
  ) {
    return NextResponse.json({ success: false, message: "Invalid wishlist payload." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
  }

  type WishlistField = "wishlistProducts" | "wishlistPosts";
  const field = (body.itemType === "product" ? "wishlistProducts" : "wishlistPosts") as WishlistField;
  const existingList = Array.isArray(user[field]) ? (user[field] as string[]) : [];
  const isAlreadySaved = existingList.includes(body.slug);

  user[field] = isAlreadySaved
    ? existingList.filter((item) => item !== body.slug)
    : [...existingList, body.slug];

  await user.save();

  return NextResponse.json({
    success: true,
    message: isAlreadySaved ? "Removed from wishlist." : "Added to wishlist.",
    data: {
      wishlistProducts: user.wishlistProducts || [],
      wishlistPosts: user.wishlistPosts || [],
    },
  });
}
