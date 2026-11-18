import { NextResponse } from "next/server";
import type { Types } from "mongoose";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { calcDiscount, shippingFor } from "@/lib/pricing";
import Order, { PAYMENT_METHODS } from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Voucher from "@/models/Voucher";

export const dynamic = "force-dynamic";

const SIZES = [38, 39, 40, 41, 42, 43, 44, 45];

type Line = {
  product: Types.ObjectId;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: number;
  quantity: number;
  price: number;
};

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

function makeOrderNumber() {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RYT-${ymd}-${rand}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return bad("Silakan masuk dulu.", 401);

  try {
    const body = await req.json().catch(() => ({}));
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    const addressId = String(body.addressId ?? "");
    const voucherCode = String(body.voucherCode ?? "").trim().toUpperCase();
    const paymentMethod = String(body.paymentMethod ?? "");

    if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
      return bad("Pilih metode pembayaran.");
    }

    // Gabungkan item dengan produk + ukuran yang sama
    const merged = new Map<string, { slug: string; size: number; quantity: number }>();
    for (const raw of rawItems) {
      const it = raw as { slug?: unknown; size?: unknown; quantity?: unknown };
      const slug = String(it.slug ?? "");
      const size = Number(it.size);
      const quantity = Math.floor(Number(it.quantity));
      if (!slug || !SIZES.includes(size) || !(quantity >= 1 && quantity <= 10)) {
        return bad("Isi keranjang tidak valid.");
      }
      const key = `${slug}:${size}`;
      merged.set(key, { slug, size, quantity: (merged.get(key)?.quantity ?? 0) + quantity });
    }
    const items = [...merged.values()];
    if (items.length === 0) return bad("Keranjang masih kosong.");
    if (items.length > 20) return bad("Terlalu banyak item dalam satu pesanan.");

    await connectDB();
    const user = await User.findById(session.sub).select("addresses vouchers");
    if (!user) return bad("Akun tidak ditemukan.", 404);

    const address = user.addresses.find((a) => String(a._id) === addressId);
    if (!address) return bad("Pilih alamat pengiriman.");

    // Harga selalu diambil dari database, bukan dari browser
    const products = await Product.find({
      slug: { $in: items.map((i) => i.slug) },
      isActive: true,
    }).lean();
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const lines: Line[] = [];
    for (const it of items) {
      const p = bySlug.get(it.slug);
      if (!p) return bad("Ada produk di keranjang yang sudah tidak tersedia.");
      lines.push({
        product: p._id,
        slug: p.slug,
        name: p.name,
        image: p.image,
        color: p.color ?? "",
        size: it.size,
        quantity: it.quantity,
        price: p.price,
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const shippingFee = shippingFor(subtotal);

    let discount = 0;
    let voucherId: Types.ObjectId | null = null;
    if (voucherCode) {
      const v = await Voucher.findOne({ code: voucherCode }).lean();
      const owned =
        v && user.vouchers.find((w) => String(w.voucher) === String(v._id) && !w.usedAt);
      if (!v || !owned) return bad("Voucher tidak bisa dipakai.");
      if (!v.isActive || (v.expiresAt && new Date(v.expiresAt) < new Date())) {
        return bad("Voucher sudah kedaluwarsa.");
      }
      if (subtotal < (v.minSpend ?? 0)) return bad("Belanja belum mencapai minimum voucher.");
      discount = calcDiscount(
        {
          type: v.type as "PERCENT" | "FIXED",
          value: v.value,
          minSpend: v.minSpend ?? 0,
          maxDiscount: v.maxDiscount ?? 0,
        },
        subtotal
      );
      voucherId = v._id;
    }

    const total = subtotal + shippingFee - discount;

    // Kurangi stok satu per satu. Kalau ada yang kurang, kembalikan yang sudah dikurangi.
    const done: Line[] = [];
    const rollbackStock = async () => {
      for (const l of done) {
        await Product.updateOne(
          { _id: l.product, "variants.size": l.size },
          { $inc: { "variants.$.stock": l.quantity } }
        );
      }
    };

    for (const l of lines) {
      const r = await Product.updateOne(
        { _id: l.product, variants: { $elemMatch: { size: l.size, stock: { $gte: l.quantity } } } },
        { $inc: { "variants.$.stock": -l.quantity } }
      );
      if (r.modifiedCount === 0) {
        await rollbackStock();
        return bad(`Stok ${l.name} ukuran EU ${l.size} tidak cukup.`, 409);
      }
      done.push(l);
    }

    if (voucherId) {
      const r = await User.updateOne(
        { _id: session.sub, vouchers: { $elemMatch: { voucher: voucherId, usedAt: null } } },
        { $set: { "vouchers.$.usedAt": new Date() } }
      );
      if (r.modifiedCount === 0) {
        await rollbackStock();
        return bad("Voucher sudah terpakai.");
      }
    }

    try {
      const order = await Order.create({
        orderNumber: makeOrderNumber(),
        user: session.sub,
        items: lines,
        shippingAddress: {
          label: address.label,
          recipient: address.recipient,
          phone: address.phone,
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
        subtotal,
        shippingFee,
        discount,
        total,
        voucherCode: voucherId ? voucherCode : undefined,
        paymentMethod: paymentMethod as (typeof PAYMENT_METHODS)[number],
      });
      return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
    } catch (err) {
      await rollbackStock();
      if (voucherId) {
        await User.updateOne(
          { _id: session.sub, "vouchers.voucher": voucherId },
          { $unset: { "vouchers.$.usedAt": "" } }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    return bad("Terjadi kesalahan di server.", 500);
  }
}
