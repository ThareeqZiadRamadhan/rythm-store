import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { serializeAddresses } from "@/lib/address";
import { getVoucherLists } from "@/lib/vouchers";
import User from "@/models/User";
import CheckoutView from "@/components/CheckoutView";

export const metadata = { title: "Checkout — RYTHM" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.sub).select("addresses").lean();
  if (!user) redirect("/login");

  const { claimed } = await getVoucherLists(session.sub);

  return (
    <CheckoutView
      addresses={serializeAddresses(user.addresses)}
      vouchers={claimed.filter((v) => v.status === "ACTIVE")}
    />
  );
}
