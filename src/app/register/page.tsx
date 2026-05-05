import RegisterForm from "../../components/auth/RegisterForm";
import AuthPanel from "../../components/shared/AuthPanel";

export const metadata = {
  title: "Create account — WhisperBox",
};

export default function RegisterPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "#F5F4F0" }}
    >
      <div
        className="w-full overflow-hidden"
        style={{
          maxWidth: 680,
          borderRadius: 16,
          border: "0.5px solid #e0ddd8",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* on mobile — stacked, on desktop — side by side */}
        <div className="flex flex-col md:grid md:grid-cols-[220px_1fr] md:items-stretch">
          {/* dark panel — stretches full height */}
          <div className="md:flex md:flex-col">
            <AuthPanel />
          </div>

          {/* form panel */}
          <div className="bg-white p-6 md:p-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
