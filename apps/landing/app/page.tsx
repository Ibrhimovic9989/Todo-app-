"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const TASKS_APP_URL =
  process.env.NEXT_PUBLIC_TASKS_APP_URL || "http://localhost:3001";

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

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const scrolled = (windowHeight - elementTop) / (windowHeight + elementHeight);
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return progress;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

export default function LandingPage() {
  const journeyRef = useRef<HTMLElement>(null);
  const templeRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const poemRef = useRef<HTMLElement>(null);

  const journeyProgress = useScrollProgress(journeyRef);
  const templeInView = useInView(templeRef);
  const manifestoInView = useInView(manifestoRef);
  const poemInView = useInView(poemRef);

  // Seeded deterministic RNG so SSR and client generate identical noise items.
  const noiseItems = useMemo(() => {
    function mulberry32(seed: number) {
      return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(123456789);
    return Array.from({ length: 48 }, (_, i) => {
      const r1 = rand();
      const r2 = rand();
      const r3 = rand();
      const r4 = rand();
      const r5 = rand();
      return {
        id: i,
        left: `${(i % 8) * 12.5 + r1 * 8}%`,
        top: `${Math.floor(i / 8) * 14 + r2 * 6}%`,
        size: 8 + r3 * 24,
        opacity: 0.08 + r4 * 0.12,
        driftX: (r5 - 0.5) * 40,
        delay: i * 30,
      };
    });
  }, []);

  return (
    <div className="relative min-h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
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
          <Link
            href={TASKS_APP_URL}
            className="rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-medium backdrop-blur-md transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
          >
            Enter
          </Link>
        </div>
      </nav>

      {/* SECTION 1: MANIFESTO — The declaration */}
      <section
        ref={manifestoRef}
        className="relative flex min-h-screen flex-col justify-center px-6 pt-24 pb-12"
      >
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 -z-10 overflow-hidden">
          <svg
            className="absolute top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 text-zinc-100 dark:text-zinc-900"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.25"
              className={manifestoInView ? "draw-line" : ""}
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.25"
              className={manifestoInView ? "draw-line" : ""}
              style={{ animationDelay: "0.4s" }}
            />
          </svg>
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <div
            className={`transition-all duration-1000 ${manifestoInView ? "opacity-100" : "opacity-0"}`}
          >
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
              A manifesto for the distracted
            </p>
            <h1 className="max-w-5xl text-[clamp(2.5rem,10vw,8rem)] font-semibold leading-[0.9] tracking-tighter">
              The world is loud.
              <br />
              <span className="text-zinc-300 dark:text-zinc-700">
                Your mind doesn't have to be.
              </span>
            </h1>
          </div>

          <div
            className={`mt-16 grid max-w-4xl gap-8 border-t border-zinc-100 pt-12 sm:grid-cols-3 dark:border-zinc-900 ${manifestoInView ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            {[
              "We believe attention is the last human advantage.",
              "We believe tools should disappear the moment you need them.",
              "We believe productivity is not more output. It is clearer intent.",
            ].map((line, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-zinc-300 p-1.5 dark:border-zinc-700">
            <div className="h-1.5 w-0.5 rounded-full bg-zinc-400 motion-safe:animate-bounce dark:bg-zinc-600" />
          </div>
        </div>
      </section>

      {/* SECTION 2: JOURNEY — From chaos to calm */}
      <section
        ref={journeyRef}
        className="relative min-h-[300vh]"
        style={{ backgroundColor: `rgba(250, 250, 250, ${journeyProgress})` }}
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 -z-10 transition-opacity duration-500">
            {/* Chaos field */}
            <div
              className="absolute inset-0 transition-opacity duration-700 dark:opacity-0"
              style={{ opacity: 1 - journeyProgress * 1.2 }}
            >
              {noiseItems.map((item) => (
                <div
                  key={item.id}
                  className="absolute rounded-full bg-zinc-900 dark:bg-white"
                  style={{
                    left: item.left,
                    top: item.top,
                    width: item.size,
                    height: item.size,
                    opacity: item.opacity * (1 - journeyProgress),
                    transform: `translate(${item.driftX * journeyProgress}px, ${item.driftX * journeyProgress}px) scale(${1 - journeyProgress * 0.6})`,
                    transition: "transform 0.1s linear, opacity 0.1s linear",
                  }}
                />
              ))}
            </div>

            {/* Calm field */}
            <div
              className="absolute inset-0 bg-white opacity-0 transition-opacity duration-700 dark:bg-zinc-950"
              style={{ opacity: Math.max(0, (journeyProgress - 0.4) * 1.8) }}
            />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <p
              className="mb-8 text-sm font-medium tracking-widest text-zinc-400 transition-all duration-700 dark:text-zinc-600"
              style={{
                opacity: 1 - journeyProgress,
                transform: `translateY(${journeyProgress * -40}px)`,
              }}
            >
              CHAOS
            </p>

            <h2
              className="text-[clamp(2rem,8vw,6rem)] font-semibold leading-[0.95] tracking-tighter transition-all duration-100"
              style={{
                opacity: 0.3 + journeyProgress * 0.7,
                letterSpacing: `${0.05 - journeyProgress * 0.09}em`,
                transform: `scale(${0.95 + journeyProgress * 0.05})`,
              }}
            >
              <span className="text-zinc-900 dark:text-zinc-100">
                Strip everything
              </span>
              <br />
              <span
                className="transition-colors duration-700"
                style={{
                  color:
                    journeyProgress > 0.6
                      ? "rgb(161, 161, 170)"
                      : "rgb(24, 24, 27)",
                }}
              >
                that is not the task.
              </span>
            </h2>

            <p
              className="mx-auto mt-12 max-w-md text-sm leading-relaxed transition-all duration-700"
              style={{
                opacity: Math.max(0, (journeyProgress - 0.5) * 2),
                transform: `translateY(${(0.7 - journeyProgress) * 30}px)`,
                color: journeyProgress > 0.5 ? "rgb(113, 113, 122)" : "transparent",
              }}
            >
              As you scroll, the noise dissolves. The page itself becomes the
              product's promise: less, but better.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: TEMPLE — Sacred space */}
      <section
        ref={templeRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className={`h-[60vmin] w-[60vmin] rounded-full border border-zinc-200 transition-all duration-[2000ms] dark:border-zinc-800 ${templeInView ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          />
          <div
            className={`orbit-slow absolute h-[50vmin] w-[50vmin] rounded-full border border-zinc-100 transition-all duration-[2000ms] dark:border-zinc-900 ${templeInView ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "0.3s" }}
          />
          <div
            className={`orbit-reverse absolute h-[40vmin] w-[40vmin] rounded-full border border-zinc-100 transition-all duration-[2000ms] dark:border-zinc-900 ${templeInView ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "0.5s" }}
          />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            The temple
          </p>

          <div
            className={`mb-12 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 shadow-sm transition-all duration-1000 dark:border-zinc-800 dark:bg-zinc-900 ${templeInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <span className="mr-3 text-zinc-400 dark:text-zinc-600">
              <Logo className="h-4 w-4" />
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              Write one thing. Then do it.
            </span>
            <span className="ml-2 inline-block h-4 w-0.5 bg-zinc-900 cursor-pulse dark:bg-zinc-100" />
          </div>

          <h2
            className={`mb-8 text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1] tracking-tight transition-all duration-1000 dark:text-zinc-100 ${templeInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "0.2s" }}
          >
            This is not a dashboard.
            <br />
            <span className="text-zinc-400 dark:text-zinc-600">
              It is a room with one chair.
            </span>
          </h2>

          <p
            className={`mx-auto max-w-xl text-base leading-relaxed text-zinc-500 transition-all duration-1000 dark:text-zinc-400 ${templeInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "0.4s" }}
          >
            No sidebars. No counters screaming for attention. No dopamine loops.
            Just a quiet surface for your intentions, the way a notebook on a
            wooden desk feels at 6 a.m.
          </p>
        </div>
      </section>

      {/* SECTION 4: KINETIC POEM — The text becomes the experience */}
      <section
        ref={poemRef}
        className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-32"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="space-y-2">
            {[
              { text: "Wake", align: "left", weight: "font-light" },
              { text: "Write", align: "center", weight: "font-normal" },
              { text: "Work", align: "right", weight: "font-medium" },
              { text: "Rest", align: "left", weight: "font-light" },
              { text: "Repeat with meaning", align: "center", weight: "font-semibold" },
            ].map((line, i) => (
              <div
                key={line.text}
                className={`overflow-hidden ${line.align === "center" ? "text-center" : line.align === "right" ? "text-right" : "text-left"}`}
              >
                <p
                  className={`breathe text-[clamp(3rem,12vw,10rem)] leading-[0.85] tracking-tighter text-zinc-900 transition-all duration-1000 dark:text-zinc-100 ${line.weight} ${poemInView ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  {line.text}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`mt-20 flex justify-center transition-all duration-1000 ${poemInView ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "0.8s" }}
          >
            <Link
              href={TASKS_APP_URL}
              className="group inline-flex items-center gap-3 rounded-full border border-zinc-900 bg-zinc-900 px-10 py-5 text-sm font-medium text-white transition-all duration-300 hover:gap-5 hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Begin
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 py-12 dark:border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-xs text-zinc-400 sm:flex-row dark:text-zinc-600">
          <div className="flex items-center gap-2">
            <Logo className="h-4 w-4" />
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              Tasks
            </span>
          </div>
          <p>Designed with intention.</p>
        </div>
      </footer>
    </div>
  );
}
