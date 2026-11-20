"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, ChevronDown, Loader2, Star, Trash2 } from "lucide-react";

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  mine: boolean;
};

type Data = {
  loggedIn: boolean;
  canModerate: boolean;
  count: number;
  average: number;
  reviews: Review[];
};

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-[#11120f] text-[#11120f]" : "text-black/25"}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function fill(d: Data) {
    setData(d);
    const mine = d.reviews?.find((r) => r.mine);
    setRating(mine?.rating ?? 0);
    setComment(mine?.comment ?? "");
  }

  useEffect(() => {
    fetch(`/api/products/${slug}/reviews`, { cache: "no-store" })
      .then((r) => r.json())
      .then(fill)
      .catch(() => setData({ loggedIn: false, canModerate: false, count: 0, average: 0, reviews: [] }));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (rating < 1) return setMsg({ ok: false, text: "Please choose a star rating first." });

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Could not submit your review." });
        return;
      }
      fill(d);
      setMsg({ ok: true, text: "Thanks, your review has been saved." });
    } catch {
      setMsg({ ok: false, text: "Could not connect to the server." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: Review) {
    const question = r.mine ? "Delete your review?" : `Delete the review from ${r.userName}? This action will be recorded in the activity log.`;
    if (!window.confirm(question)) return;
    setDeleting(r.id);
    const res = await fetch(`/api/products/${slug}/reviews?id=${r.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    setDeleting(null);
    if (!res.ok) return window.alert(d.error ?? "Could not delete the review.");
    fill(d);
    setMsg(null);
  }

  const count = data?.count ?? 0;
  const hasMine = data?.reviews.some((r) => r.mine);

  return (
    <details id="reviews" className="group scroll-mt-28 border-b border-black/10">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          Reviews ({count})
          {count > 0 && <Stars value={data!.average} size={15} />}
        </span>
        <ChevronDown size={22} className="transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-6 pb-6 text-[15px] leading-7 text-black/70">
        {data === null ? (
          <p>Loading reviews...</p>
        ) : (
          <>
            {count > 0 && (
              <div className="flex items-center gap-3 text-black">
                <span className="text-3xl font-black">{data.average.toFixed(1)}</span>
                <span>
                  <Stars value={data.average} />
                  <span className="block text-xs text-black/50">from {count} {count === 1 ? "review" : "reviews"}</span>
                </span>
              </div>
            )}

            {data.loggedIn ? (
              <form onSubmit={submit} className="space-y-3 rounded-2xl bg-[#f5f5f5] p-4">
                <p className="font-medium text-black">{hasMine ? "Update your review" : "Write a review"}</p>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      aria-label={`${i} ${i === 1 ? "star" : "stars"}`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={26}
                        className={i <= (hover || rating) ? "fill-[#11120f] text-[#11120f]" : "text-black/25"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Tell us about the comfort, fit and quality..."
                  className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
                />
                {msg && (
                  <p
                    className={`rounded-lg px-4 py-2.5 text-sm ${
                      msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-full bg-[#111] px-6 text-sm font-medium text-white hover:bg-black/70 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {hasMine ? "Update review" : "Submit review"}
                </button>
              </form>
            ) : (
              <p>
                <Link href="/login" className="font-medium text-black underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            )}

            {count === 0 ? (
              <p>No reviews for this product yet.</p>
            ) : (
              <ul className="space-y-5">
                {data.reviews.map((r) => (
                  <li key={r.id} className="border-t border-black/10 pt-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} size={14} />
                      <span className="font-medium text-black">
                        {r.userName}
                        {r.mine && <span className="ml-1 text-xs font-normal text-black/45">(you)</span>}
                      </span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#007d48]">
                          <BadgeCheck size={14} /> Pembeli terverifikasi
                        </span>
                      )}
                      <span className="text-xs text-black/40">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {(r.mine || data.canModerate) && (
                        <button
                          onClick={() => remove(r)}
                          disabled={deleting === r.id}
                          aria-label="Delete review"
                          className="ml-auto grid size-8 place-items-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleting === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                    {r.comment && <p className="mt-2">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </details>
  );
}
