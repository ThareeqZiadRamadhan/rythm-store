import PasswordForm from "@/components/PasswordForm";

export const metadata = { title: "Settings — RYTHM" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Settings</h1>
      <p className="mb-8 mt-2 text-sm text-black/50">Your account security.</p>
      <PasswordForm />
    </div>
  );
}
