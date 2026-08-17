"use client";

import { useEffect, useState } from "react";

function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20 + 5, 90));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-0.5 bg-zinc-900 transition-all duration-200 dark:bg-zinc-100"
      style={{ width: `${progress}%` }}
    />
  );
}

export function LoadingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setShowLoader(false), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {showLoader && <LoadingBar />}
      {children}
    </>
  );
}
