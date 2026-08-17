export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import TodoApp from "./todo-app";
import { getTodos } from "@/src/db/queries";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL || "https://landing-psi-black.vercel.app";

function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin");

  const initial = (await getTodos(userId)).map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <nav className="fixed left-0 right-0 top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-all duration-300 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white dark:border-zinc-800 dark:bg-zinc-950 dark:group-hover:border-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
              <Logo className="h-4 w-4" />
            </span>
            Tasks
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
              {session.user?.name}
            </span>
            <Link
              href={LANDING_URL}
              className="rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-medium backdrop-blur-md transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              Story
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="mx-auto w-full max-w-2xl">
          <TodoApp initial={initial} />
        </div>
      </main>
    </div>
  );
}
