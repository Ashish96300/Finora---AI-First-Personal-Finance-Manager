import Link from "next/link";

export const metadata = {
  title: "Sign-in problem | Oqita",
};

export default function AuthErrorPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d19] px-5 py-12 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="mb-3 text-sm font-medium text-blue-400">
            SIGN-IN PROBLEM
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            We couldn&apos;t set up your account
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Something went wrong while finishing your sign-in. Please try
            again. If it keeps happening, wait a minute and retry, or contact
            support.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Try again
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}