import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { formatPrice } from "@/lib/data";
import { SIZES, parseProductInput } from "@/lib/productInput";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const money = (n: number | null | undefined) => (n ? formatPrice(n) : "-");

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await adminApi();
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
  }

  try {
    const parsed = parseProductInput(await req.json().catch(() => ({})));
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;

    if (await Product.exists({ slug: d.slug, _id: { $ne: id } })) {
      return NextResponse.json({ error: "Slug sudah dipakai produk lain." }, { status: 409 });
    }

    const before = await Product.findById(id).lean();
    if (!before) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

    await Product.updateOne({ _id: id }, { $set: d });

    // Susun ringkasan perubahan untuk log
    const changes: string[] = [];
    if (before.name !== d.name) changes.push(`nama "${before.name}" → "${d.name}"`);
    if (before.price !== d.price) changes.push(`harga ${money(before.price)} → ${money(d.price)}`);
    if ((before.oldPrice ?? null) !== d.oldPrice) {
      changes.push(`harga coret ${money(before.oldPrice)} → ${money(d.oldPrice)}`);
    }
    if (Boolean(before.isActive) !== d.isActive) {
      changes.push(d.isActive ? "ditampilkan di toko" : "disembunyikan dari toko");
    }
    const stockChanges = SIZES.flatMap((size) => {
      const prev = before.variants?.find((v) => v.size === size)?.stock ?? 0;
      const next = d.variants.find((v) => v.size === size)?.stock ?? 0;
      return prev === next ? [] : [`EU ${size}: ${prev} → ${next}`];
    });
    if (stockChanges.length) changes.push(`stok ${stockChanges.join(", ")}`);
    const otherChanged =
      before.category !== d.category ||
      before.gender !== d.gender ||
      before.image !== d.image ||
      (before.description ?? "") !== d.description ||
      (before.tag ?? "") !== d.tag ||
      (before.colorName ?? "") !== d.colorName;
    if (otherChanged) changes.push("detail produk");

    if (changes.length) {
      await logActivity(g.admin, "product.update", d.name, changes.join("; "));
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await adminApi();
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
  }

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

    await User.updateMany({ wishlist: deleted._id }, { $pull: { wishlist: deleted._id } });
    await mongoose.connection.collection("reviews").deleteMany({ product: deleted._id });
    await logActivity(g.admin, "product.delete", deleted.name, `/shop/${deleted.slug}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
