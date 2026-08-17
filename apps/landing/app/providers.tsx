"use client";

import { useEffect, useState } from "react";

function LoadingBar() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const id = setTimeout(() => {
      setVisible(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 20 + 5, 90));
      }, 200);
    }, 100);

    return () => {
      clearTimeout(id);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-0.5 bg-zinc-900 transition-all duration-200 dark:bg-zinc-100"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}

export function LoadingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const isInitialLoad = typeof window !== "undefined" && !window.__next_initial;
    if (isInitialLoad) {
      setShowLoader(true);
      const id = setTimeout(() => setShowLoader(false), 400);
      window.__next_initial = true;
      return () => clearTimeout(id);
    }
  }, []);

  return (
    <>
      {showLoader && <LoadingBar />}
      {children}
    </>
  );
}

declare global {
  interface Window {
    __next_initial?: boolean;
  }
}
