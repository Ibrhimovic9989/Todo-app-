import { parseDate } from "chrono-node";

export type ParsedTask = {
  text: string;
  projectName?: string;
  labelNames: string[];
  priority: number;
  dueDate: Date | null;
};

export function parseQuickCapture(input: string): ParsedTask {
  let text = input.trim();
  let priority = 0;

  // Priority: p1..p4 (p1 highest)
  const priorityMatch = text.match(/\bp([1-4])\b/i);
  if (priorityMatch) {
    priority = Number(priorityMatch[1]);
    text = text.replace(priorityMatch[0], "").trim();
  }

  // Project: #project-name or #Project Name
  let projectName: string | undefined;
  const projectMatch = text.match(/#([^\s#]+(?:\s+[^\s#]+)*?)\b/);
  if (projectMatch) {
    projectName = projectMatch[1].trim();
    text = text.replace(projectMatch[0], "").trim();
  }

  // Labels: @label-name
  const labelNames: string[] = [];
  text = text.replace(/@([^\s@]+)/g, (_, label) => {
    labelNames.push(label.trim());
    return "";
  }).trim();

  // Dates via chrono-node
  const parsed = parseDate(text, new Date(), { forwardDate: true });
  const dueDate = parsed || null;

  // Remove leftover date-ish fragments from text
  const results = parseDate(text, new Date(), { forwardDate: true });
  // We keep the date text in the title for context unless it's at the very end.
  // Heuristic: if a chrono result consumes trailing text, strip it.
  if (dueDate && results && typeof results === "object" && "index" in results && "text" in results) {
    const r = results as { index: number; text: string };
    if (r.index > 0) {
      // date is in the middle — keep both
    } else if (r.text.length > 0) {
      text = text.slice(r.text.length).trim();
    }
  }

  // Collapse multiple spaces
  text = text.replace(/\s+/g, " ").trim();

  return {
    text,
    projectName,
    labelNames,
    priority,
    dueDate,
  };
}
