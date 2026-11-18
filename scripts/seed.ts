import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { products } from "../src/lib/data";
import Product from "../src/models/Product";
import Voucher from "../src/models/Voucher";
import User from "../src/models/User";
import Order from "../src/models/Order";

const SIZES = [38, 39, 40, 41, 42, 43, 44, 45];
const DAY = 24 * 60 * 60 * 1000;

async function seedProducts() {
  const ops = products.map((p) => {
    const { id: _id, ...rest } = p;
    const data = JSON.parse(JSON.stringify(rest));
    return {
      updateOne: {
        filter: { slug: p.slug },
        update: {
          // Hanya diisi saat produk belum ada. Data yang sudah diubah admin tidak pernah ditimpa.
          $setOnInsert: {
            ...data,
            variants: SIZES.map((size) => ({ size, stock: 10 })),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        upsert: true,
        timestamps: false,
      },
    };
  });
  const r = await Product.bulkWrite(ops);
  console.log(`  Produk   : ${r.upsertedCount} baru, ${r.modifiedCount} diperbarui`);
}

async function seedVouchers() {
  const vouchers = [
    {
      code: "WELCOME10",
      title: "Diskon member baru 10%",
      description: "Potongan 10% untuk pembelian pertamamu.",
      type: "PERCENT",
      value: 10,
      minSpend: 500000,
      maxDiscount: 150000,
      expiresAt: new Date(Date.now() + 180 * DAY),
    },
    {
      code: "HEMAT100",
      quota: 50,
      title: "Potongan Rp100.000",
      description: "Hemat langsung untuk belanja minimal Rp1,5 juta.",
      type: "FIXED",
      value: 100000,
      minSpend: 1500000,
      maxDiscount: 0,
      expiresAt: new Date(Date.now() + 90 * DAY),
    },
    {
      code: "SALE15",
      quota: 100,
      title: "Diskon 15% spesial",
      description: "Potongan 15% untuk belanja minimal Rp1 juta.",
      type: "PERCENT",
      value: 15,
      minSpend: 1000000,
      maxDiscount: 250000,
      expiresAt: new Date(Date.now() + 60 * DAY),
    },
  ];
  const r = await Voucher.bulkWrite(
    vouchers.map((v) => ({
      updateOne: { filter: { code: v.code }, update: { $setOnInsert: { ...v, isActive: true, createdAt: new Date(), updatedAt: new Date() } }, upsert: true, timestamps: false },
    }))
  );
  console.log(`  Voucher  : ${r.upsertedCount} baru, ${r.modifiedCount} diperbarui`);
}

async function seedAccounts() {
  const env = process.env;
  const accounts = [
    {
      role: "SUPERADMIN",
      name: "Super Admin RYTHM",
      email: env.SEED_SUPERADMIN_EMAIL,
      password: env.SEED_SUPERADMIN_PASSWORD,
    },
    {
      role: "ADMIN",
      name: "Admin RYTHM",
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
    },
  ];

  for (const a of accounts) {
    const email = (a.email ?? "").trim().toLowerCase();
    const password = a.password ?? "";
    if (!email || password.length < 8) {
      console.log(`  ${a.role.padEnd(10)}: dilewati (email/password belum diisi di .env.local)`);
      continue;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = a.role as "ADMIN" | "SUPERADMIN";
      await existing.save();
      console.log(`  ${a.role.padEnd(10)}: ${email} sudah ada, role dipastikan ${a.role}`);
    } else {
      await User.create({
        name: a.name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: a.role as "ADMIN" | "SUPERADMIN",
      });
      console.log(`  ${a.role.padEnd(10)}: ${email} dibuat`);
    }
  }
}

async function ensureCollections() {
  for (const m of [User, Product, Voucher, Order]) {
    await m.createCollection().catch(() => {});
    await m.syncIndexes();
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum diisi di .env.local");

  await mongoose.connect(uri);
  console.log(`Terhubung ke database "${mongoose.connection.name}"\n`);

  await ensureCollections();
  await seedProducts();
  await seedVouchers();
  await seedAccounts();

  console.log("\nSeed selesai.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed gagal:", err instanceof Error ? err.message : err);
  await mongoose.disconnect();
  process.exit(1);
});
