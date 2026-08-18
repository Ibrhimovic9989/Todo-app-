import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProjects, getLabels, getUpcomingTodos } from "@/src/db/queries";
import { TasksShell } from "../tasks-shell";

export default async function UpcomingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const [tasks, projects, labels] = await Promise.all([
    getUpcomingTodos(session.user.id),
    getProjects(session.user.id),
    getLabels(session.user.id),
  ]);
  return (
    <TasksShell
      user={session.user as { id: string; name?: string | null; email?: string | null; image?: string | null }}
      initialTasks={tasks}
      initialProjects={projects}
      initialLabels={labels}
      initialView={{ id: "upcoming", name: "Upcoming" }}
    />
  );
}
