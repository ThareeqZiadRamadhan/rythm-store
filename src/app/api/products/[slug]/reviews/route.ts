import { NextResponse } from "next/server";
import mongoose, { type Types } from "mongoose";
import { getSession, type SessionPayload } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { logActivity } from "@/lib/activity";
import type { AdminRole } from "@/lib/admin";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const isMod = (s: SessionPayload | null) => s?.role === "ADMIN" || s?.role === "SUPERADMIN";

async function payload(productId: Types.ObjectId, viewer: SessionPayload | null) {
  const docs = await Review.find({ product: productId }).sort({ createdAt: -1 }).limit(50).lean();
  const count = docs.length;
  const average = count ? docs.reduce((s, r) => s + r.rating, 0) / count : 0;

  return {
    loggedIn: viewer !== null,
    canModerate: isMod(viewer),
    count,
    average,
    reviews: docs.map((r) => ({
      id: String(r._id),
      userName: r.userName,
      rating: r.rating,
      comment: r.comment ?? "",
      verified: Boolean(r.verified),
      createdAt: new Date(r.createdAt).toISOString(),
      mine: viewer !== null && String(r.user) === viewer.sub,
    })),
  };
}

async function findProduct(slug: string) {
  await connectDB();
  return Product.findOne({ slug }).select("_id").lean();
}

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const session = await getSession();
  const product = await findProduct(slug);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json(await payload(product._id, session));
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const rating = Math.round(Number(body.rating));
    const comment = String(body.comment ?? "").trim();

    if (!(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ error: "Please choose a rating from 1 to 5." }, { status: 400 });
    }
    if (comment.length > 1000) {
      return NextResponse.json({ error: "Reviews can be at most 1000 characters." }, { status: 400 });
    }

    const product = await findProduct(slug);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const user = await User.findById(session.sub).select("name").lean();
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const bought = await Order.exists({
      user: session.sub,
      "items.product": product._id,
      status: { $ne: "CANCELLED" },
    });

    await Review.findOneAndUpdate(
      { product: product._id, user: session.sub },
      { $set: { rating, comment, userName: user.name, verified: Boolean(bought) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(await payload(product._id, session), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { slug } = await params;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid review ID." }, { status: 400 });
  }

  const product = await findProduct(slug);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const review = await Review.findOne({ _id: id, product: product._id });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const owner = String(review.user) === session.sub;
  if (!owner && !isMod(session)) {
    return NextResponse.json({ error: "You are not allowed to delete this review." }, { status: 403 });
  }

  await review.deleteOne();

  if (!owner) {
    await logActivity(
      { id: session.sub, name: session.name, role: session.role as AdminRole },
      "review.delete",
      `${review.userName} · /shop/${slug}`,
      `★${review.rating}${review.comment ? ` "${review.comment.slice(0, 80)}"` : ""}`
    );
  }

  return NextResponse.json(await payload(product._id, session));
}
