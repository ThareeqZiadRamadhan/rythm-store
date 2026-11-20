import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminApi } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { NEXT_STATUS, STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import { restoreCancelledOrder } from "@/lib/orderCancel";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminApi();
  if (g.error) return g.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const next = String(body.status ?? "") as OrderStatus;
    if (!(next in STATUS_LABEL)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const current = order.status as OrderStatus;
    if (!NEXT_STATUS[current].includes(next)) {
      return NextResponse.json(
        { error: `Status cannot change from ${STATUS_LABEL[current]} to ${STATUS_LABEL[next]}.` },
        { status: 400 }
      );
    }

    const updated = await Order.findOneAndUpdate(
      { _id: id, status: current },
      { $set: { status: next, ...(next === "CANCELLED" ? { cancelledBy: "ADMIN" } : {}) } },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { error: "This order was just updated. Please reload the page." },
        { status: 409 }
      );
    }

    const note = next === "CANCELLED" ? await restoreCancelledOrder(order) : "";

    await logActivity(
      g.admin,
      "order.status",
      order.orderNumber,
      `${STATUS_LABEL[current]} → ${STATUS_LABEL[next]}${note}`
    );

    return NextResponse.json({ status: next });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}
