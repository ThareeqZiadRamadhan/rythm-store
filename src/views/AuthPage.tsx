"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import AuthQuotePanel from "@/components/AuthQuotePanel";

type Mode = "login" | "register";
type Step = "email" | "details";

const COUNTRY_CODES = [
  ["+62", "Indonesia"],
  ["+60", "Malaysia"],
  ["+65", "Singapore"],
  ["+61", "Australia"],
  ["+1", "US / Canada"],
];

const inputClass =
  "h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black";

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  right,
  autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  right?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`${inputClass} ${right ? "pr-12" : ""}`}
        />
        {right && (
          <span className="absolute inset-y-0 right-4 flex items-center">
            {right}
          </span>
        )}
      </div>
    </div>
  );
}

function EyeToggle({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? "Hide password" : "Show password"}
      className="text-black/45 hover:text-black"
    >
      {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}

export default function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("+62");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneDigits = phone.replace(/\D/g, "").replace(/^0+/, "");

  const canSubmit = !isRegister
    ? email.trim() !== "" && password !== ""
    : step === "email"
    ? email.trim() !== ""
    : firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      phoneDigits.length > 0 &&
      password !== "" &&
      confirm !== "" &&
      agree;

  async function post(url: string, payload: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  function goBackToEmail() {
    setStep("email");
    setError("");
    setEmailTaken(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailTaken(false);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      // Login
      if (!isRegister) {
        if (password.length < 8) return setError("Password must be at least 8 characters.");
        const { ok, data } = await post("/api/auth/login", { email, password });
        if (!ok) return setError(data.error ?? "Something went wrong. Please try again.");
        const role = data.user?.role;
        router.push(role === "ADMIN" || role === "SUPERADMIN" ? "/admin" : "/");
        router.refresh();
        return;
      }

      // Daftar, langkah 1: cek email
      if (step === "email") {
        const { ok, data } = await post("/api/auth/lookup", { email });
        if (!ok) return setError(data.error ?? "Something went wrong. Please try again.");
        if (data.exists) return setEmailTaken(true);
        setStep("details");
        return;
      }

      // Daftar, langkah 2: data lengkap
      if (phoneDigits.length < 8 || phoneDigits.length > 13) {
        return setError("Please enter a valid phone number.");
      }
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirm) return setError("Passwords do not match.");

      const { ok, data } = await post("/api/auth/register", {
        firstName,
        lastName,
        phone: `${code}${phoneDigits}`,
        email,
        password,
      });
      if (!ok) return setError(data.error ?? "Something went wrong. Please try again.");

      router.push("/");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading
    ? "Processing..."
    : !isRegister
    ? "Sign in with Email"
    : step === "email"
    ? "Sign up with Email"
    : "Sign up";

  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-12 md:px-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
      {/* Kiri: logo + kutipan */}
      <AuthQuotePanel />

      {/* Kanan: form */}
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-3xl font-black tracking-tight">
          {isRegister ? "Sign up" : "Sign in"}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
          {/* Banner info (langkah 2 daftar) */}
          {isRegister && step === "details" && (
            <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3.5 text-sm text-black/80">
              <Info className="h-5 w-5 shrink-0 text-sky-500" />
              Your data is safe and never shared with third parties.
            </div>
          )}

          {/* Email */}
          {(!isRegister || step === "email") && (
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              autoComplete="email"
              autoFocus
            />
          )}

          {isRegister && step === "details" && (
            <p className="text-sm text-black/60">
              {email}{" "}
              <button
                type="button"
                onClick={goBackToEmail}
                className="ml-1 font-bold text-black underline underline-offset-4"
              >
                Change
              </button>
            </p>
          )}

          {/* Daftar, langkah 2 */}
          {isRegister && step === "details" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="First name"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="First name"
                  autoComplete="given-name"
                  autoFocus
                />
                <Field
                  label="Last name"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-bold">
                  Phone number<span className="text-red-500">*</span>
                </span>
                <div className="flex gap-3">
                  <select
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-label="Country code"
                    className="h-12 w-28 shrink-0 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-black"
                  >
                    {COUNTRY_CODES.map(([c, n]) => (
                      <option key={c} value={c}>
                        {c} {n}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="812xxxxxxx"
                    autoComplete="tel-national"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          {(!isRegister || step === "details") && (
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder={isRegister ? "At least 8 characters" : "Password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              right={<EyeToggle shown={showPw} onClick={() => setShowPw((s) => !s)} />}
            />
          )}

          {isRegister && step === "details" && (
            <>
              <Field
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={setConfirm}
                placeholder="Repeat password"
                autoComplete="new-password"
                right={
                  <EyeToggle
                    shown={showConfirm}
                    onClick={() => setShowConfirm((s) => !s)}
                  />
                }
              />

              <label className="flex cursor-pointer items-start gap-3 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-black"
                />
                <span>
                  By signing up, I agree to the{" "}
                  <span className="font-bold text-[#5f7a00] underline underline-offset-2">
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-[#5f7a00] underline underline-offset-2">
                    Privacy Policy
                  </span>{" "}
                  of RYTHM.
                </span>
              </label>
            </>
          )}

          {emailTaken && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This email is already registered.{" "}
              <Link href="/login" className="font-bold underline underline-offset-4">
                Sign in instead
              </Link>
              .
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="h-12 w-full rounded-lg bg-[#11120f] text-sm font-bold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35"
          >
            {buttonLabel}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-black/60">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-bold text-black underline underline-offset-4"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </section>
  );
}