import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import Product from "@/models/Product";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Produk — Admin RYTHM" };
export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Produk</h1>
          <p className="mt-2 text-sm text-black/50">{products.length} produk di database.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-[#11120f] px-5 py-3 text-sm font-bold text-white hover:bg-black/80"
        >
          <Plus size={16} /> Tambah produk
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#f7f7f2] text-xs uppercase tracking-wider text-black/50">
            <tr>
              <th className="px-4 py-3 font-bold">Produk</th>
              <th className="px-4 py-3 font-bold">Kategori</th>
              <th className="px-4 py-3 font-bold">Harga</th>
              <th className="px-4 py-3 font-bold">Stok</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {products.map((p) => {
              const id = String(p._id);
              const stock = (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
              const empty = (p.variants ?? []).filter((v) => (v.stock ?? 0) === 0).length;
              return (
                <tr key={id} className="hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="size-12 shrink-0 rounded-xl object-cover mix-blend-multiply"
                        style={{ backgroundColor: p.color ?? "#eeeeea" }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{p.name}</p>
                        <p className="truncate text-xs text-black/45">/shop/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category}
                    <span className="block text-xs text-black/45">{p.gender}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(p.price)}
                    {p.oldPrice ? (
                      <span className="block text-xs font-normal text-black/40 line-through">
                        {formatPrice(p.oldPrice)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {stock} pasang
                    {empty > 0 && (
                      <span className="block text-xs font-semibold text-red-600">
                        {empty} ukuran habis
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        p.isActive ? "bg-[#c7ea4c]" : "bg-black/10 text-black/50"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Disembunyikan"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${id}`}
                        aria-label={`Edit ${p.name}`}
                        className="grid size-9 place-items-center rounded-full transition hover:bg-black/5"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteProductButton id={id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
