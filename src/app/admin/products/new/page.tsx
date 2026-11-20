import { requireAdmin } from "@/lib/admin";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add product — Admin RYTHM" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Add product</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Fill in the details for the new product.</p>
      <ProductForm />
    </div>
  );
}
