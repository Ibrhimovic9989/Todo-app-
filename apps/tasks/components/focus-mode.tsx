"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Play, Pause, RotateCcw, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/src/db/queries";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function FocusMode({
  task,
  open,
  onClose,
  onToggleTask,
}: {
  task: Todo | null;
  open: boolean;
  onClose: () => void;
  onToggleTask: (id: string, completed: boolean) => void;
}) {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          // Play soft beep if possible
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 523.25;
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
            osc.start();
            osc.stop(ctx.currentTime + 1);
          } catch {}
          return minutes * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, minutes]);

  useEffect(() => {
    if (open) {
      setSecondsLeft(minutes * 60);
      setRunning(false);
    }
  }, [open, minutes]);

  if (!task) return null;

  const pct = (secondsLeft / (minutes * 60)) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close focus mode"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-full max-w-xl text-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-border"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-foreground transition-all duration-1000"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * pct) / 100}
                  />
                </svg>
                <div className="absolute text-5xl font-semibold tracking-tighter tabular-nums">
                  {formatTime(secondsLeft)}
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-semibold tracking-tight">
                {task.text}
              </h2>
              <p className="text-sm text-muted-foreground">
                One task. One timer. Nothing else.
              </p>
            </motion.div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Pause" : "Start focus"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(minutes * 60);
                }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                aria-label="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMinutes(m);
                    setSecondsLeft(m * 60);
                    setRunning(false);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    minutes === m
                      ? "bg-foreground text-background"
                      : "border border-border hover:bg-accent"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>

            <button
              onClick={() => onToggleTask(task.id, !task.completed)}
              className={cn(
                "mt-10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
                task.completed
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                  : "border-border hover:bg-accent"
              )}
            >
              {task.completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Completed
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" /> Mark complete
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
