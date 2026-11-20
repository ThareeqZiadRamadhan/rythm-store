"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, Loader2, MapPin, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { calcDiscount, shippingFor, type ShippingRule } from "@/lib/pricing";
import type { AddressDTO } from "@/lib/address";
import type { VoucherDTO } from "@/lib/vouchers";

const payments = [
  { id: "TRANSFER", label: "Bank transfer", desc: "BCA, Mandiri, BNI, BRI" },
  { id: "EWALLET", label: "E-wallet", desc: "GoPay, OVO, DANA, ShopeePay" },
  { id: "COD", label: "Cash on delivery (COD)", desc: "Pay in cash when your shoes arrive" },
];

type Line = {
  product: { id: string; slug: string; name: string; image: string; color: string; price: number };
  size: number;
  quantity: number;
};

export type CatalogInfo = Record<string, { price: number; stock: Record<number, number> }>;

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onSelect,
  disabled,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
        selected ? "border-black ring-1 ring-black" : "border-black/15 hover:border-black/40"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-black bg-black text-white" : "border-black/30"
        }`}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-black/60">{label}</dt>
      <dd className={`font-semibold ${accent ? "text-green-700" : ""}`}>{value}</dd>
    </div>
  );
}

export default function CheckoutView({
  addresses,
  vouchers,
  catalog,
  shippingRule,
}: {
  addresses: AddressDTO[];
  vouchers: VoucherDTO[];
  catalog: CatalogInfo;
  shippingRule: ShippingRule;
}) {
  const router = useRouter();
  const { cart, ready, clearCart } = useStore();
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [payment, setPayment] = useState("TRANSFER");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const lines: Line[] = cart.map((item) => ({
    product: {
      id: item.slug,
      slug: item.slug,
      name: item.name,
      image: item.image,
      color: item.color,
      // Harga terbaru dari database, bukan harga saat dimasukkan ke keranjang
      price: catalog[item.slug]?.price ?? item.price,
    },
    size: item.size,
    quantity: item.quantity,
  }));

  // Masalah stok/produk yang harus dibereskan sebelum bisa memesan
  const problems = lines.flatMap((l) => {
    const info = catalog[l.product.slug];
    if (!info) return [`${l.product.name} is no longer available.`];
    const left = info.stock[l.size] ?? 0;
    if (left >= l.quantity) return [];
    return [
      left === 0
        ? `${l.product.name} EU ${l.size} is sold out.`
        : `${l.product.name} EU ${l.size} has only ${left} ${left === 1 ? "pair" : "pairs"} left.`,
    ];
  });

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const shipping = shippingFor(subtotal, shippingRule);
  const selected = vouchers.find((v) => v.code === voucherCode);
  const applied = selected && subtotal >= selected.minSpend ? selected : null;
  const discount = applied ? calcDiscount(applied, subtotal) : 0;
  const total = subtotal + shipping - discount;

  async function placeOrder() {
    setError("");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            slug: l.product.slug,
            size: l.size,
            quantity: l.quantity,
          })),
          addressId,
          voucherCode: applied?.code ?? "",
          paymentMethod: payment,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not place your order.");
        setPlacing(false);
        return;
      }
      clearCart();
      router.push(`/account/orders?new=${data.orderNumber}`);
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
      setPlacing(false);
    }
  }

  if (!ready) {
    return <div className="py-32 text-center text-sm text-black/50">Loading cart...</div>;
  }

  if (lines.length === 0 && !placing) {
    return (
      <main className="mx-auto max-w-[600px] px-5 py-20">
        <div className="flex flex-col items-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-black/5">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 text-2xl font-black">Your cart is empty</h1>
          <p className="mt-2 text-sm text-black/50">Pick some shoes before checking out.</p>
          <Link
            href="/shop"
            className="mt-6 rounded-full bg-[#11120f] px-6 py-3 text-sm font-bold text-white"
          >
            Start shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="space-y-6">
          <Section
            title="Shipping address"
            action={
              <Link href="/account" className="text-sm font-bold underline underline-offset-4">
                Manage addresses
              </Link>
            }
          >
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-6 py-8 text-center">
                <MapPin size={22} strokeWidth={1.6} />
                <p className="mt-3 font-bold">No address yet</p>
                <Link
                  href="/account"
                  className="mt-4 rounded-full bg-[#11120f] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Add address
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <Choice
                    key={a.id}
                    selected={addressId === a.id}
                    onSelect={() => setAddressId(a.id)}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{a.recipient}</span>
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold">
                        {a.label}
                      </span>
                      {a.isDefault && (
                        <span className="rounded-full bg-[#c7ea4c] px-2.5 py-0.5 text-xs font-bold">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-black/55">{a.phone}</span>
                    <span className="mt-1 block text-sm leading-6 text-black/70">
                      {a.street}, {a.city}, {a.province} {a.postalCode}
                    </span>
                  </Choice>
                ))}
              </div>
            )}
          </Section>

          <Section title="Payment method">
            <div className="space-y-3">
              {payments.map((p) => (
                <Choice key={p.id} selected={payment === p.id} onSelect={() => setPayment(p.id)}>
                  <span className="block font-bold">{p.label}</span>
                  <span className="mt-0.5 block text-sm text-black/55">{p.desc}</span>
                </Choice>
              ))}
            </div>
          </Section>

          <Section
            title="Voucher"
            action={
              <Link
                href="/account/vouchers"
                className="text-sm font-bold underline underline-offset-4"
              >
                Claim vouchers
              </Link>
            }
          >
            <div className="space-y-3">
              <Choice selected={!applied} onSelect={() => setVoucherCode("")}>
                <span className="font-bold">No voucher</span>
              </Choice>
              {vouchers.map((v) => {
                const eligible = subtotal >= v.minSpend;
                return (
                  <Choice
                    key={v.id}
                    selected={applied?.code === v.code}
                    onSelect={() => setVoucherCode(v.code)}
                    disabled={!eligible}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{v.title}</span>
                      <span className="rounded-md bg-black/5 px-2 py-0.5 font-mono text-xs font-bold">
                        {v.code}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-black/55">
                      {eligible
                        ? `Save ${formatPrice(calcDiscount(v, subtotal))}`
                        : `Min. spend ${formatPrice(v.minSpend)}`}
                    </span>
                  </Choice>
                );
              })}
              {vouchers.length === 0 && (
                <p className="text-sm text-black/50">You don't have any active vouchers.</p>
              )}
            </div>
          </Section>
        </div>

        <aside className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="text-lg font-black">Order summary</h2>

          <ul className="mt-5 space-y-4">
            {lines.map((l) => (
              <li key={`${l.product.id}-${l.size}`} className="flex items-center gap-3">
                <div
                  className="size-16 shrink-0 overflow-hidden rounded-xl"
                  style={{ backgroundColor: l.product.color }}
                >
                  <img
                    src={l.product.image}
                    alt={l.product.name}
                    className="h-full w-full object-cover mix-blend-multiply"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.product.name}</p>
                  <p className="text-xs text-black/50">
                    EU {l.size} · {l.quantity} {l.quantity === 1 ? "pair" : "pairs"}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(l.product.price * l.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-black/10 pt-5 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            {applied && discount > 0 && (
              <Row label={`Voucher ${applied.code}`} value={`-${formatPrice(discount)}`} accent />
            )}
          </dl>
          {shipping > 0 && (
            <p className="mt-2 text-xs text-black/45">
              {shippingRule.freeShippingMin > 0
                ? `Free shipping on orders over ${formatPrice(shippingRule.freeShippingMin)}.`
                : "Shipping applies to all orders."}
            </p>
          )}

          <div className="mt-5 flex items-baseline justify-between border-t border-black/10 pt-5">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-black">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {problems.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-bold">Please update your cart first:</p>
              <ul className="mt-1 list-disc pl-5">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={placeOrder}
            disabled={placing || !addressId || problems.length > 0}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#11120f] font-bold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              "Place order"
            )}
          </button>
          {!addressId && (
            <p className="mt-2 text-center text-xs text-black/50">
              Add an address to continue.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
