import { loginAdmin } from "@/app/admin/actions";

export function AdminLogin({ error }: { error?: string }) {
  return (
    <div className="min-h-screen bg-repp-navy flex items-center justify-center px-5">
      <form
        action={loginAdmin}
        className="w-full max-w-sm bg-white rounded-3xl p-7 md:p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
          REPP Projectportal
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-repp-navy/65">
          Alleen voor interne toegang tot bezoeker- en lead-data.
        </p>

        <label className="block mt-6">
          <span className="text-sm font-semibold text-repp-navy">
            Wachtwoord
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="mt-2 w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-rose-600">
            {error === "wrong"
              ? "Onjuist wachtwoord."
              : "Er ging iets mis, probeer opnieuw."}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 w-full bg-repp-navy text-white font-bold px-4 py-3 rounded-full hover:bg-repp-blue transition"
        >
          Inloggen →
        </button>

        <p className="mt-4 text-[11px] text-repp-navy/45 text-center">
          Wachtwoord vergeten? Vraag het aan een collega met admin-toegang of
          reset via Vercel env-variabele <code>ADMIN_PASSWORD</code>.
        </p>
      </form>
    </div>
  );
}
