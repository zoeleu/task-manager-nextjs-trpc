import { caller } from "@/trpc/server";
import Task from "@/components/Task";

async function Tasks() {
    const tasks = await caller.listTasks();

    if (tasks.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
                No tasks yet. Create one to get started.
            </p>
        )
    }

    return (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {tasks.map(t => (
                <li key={t.id}>
                    <Task task={t} />
                </li>
            ))}
        </ul>
    )
}

export default Tasks;
