import { caller } from "@/trpc/server";
import Task from "@/components/Task";

async function Tasks() {
    const tasks = await caller.listTasks();

    return (
        <div>
            {tasks.map(t => <Task key={t.id} task={t} />)}
        </div>
    )
}

export default Tasks;