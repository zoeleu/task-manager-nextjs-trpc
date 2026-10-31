import { Suspense } from "react";
import { notFound } from "next/navigation";
import Spinner from "@/components/Spinner";
import TaskForm from "@/components/TaskForm";
import { taskId } from "@/lib/task-schema";
import { caller } from "@/trpc/server";

export default function TaskPage({ params }: PageProps<"/tasks/[id]">) {
    return (
        <Suspense fallback={<Spinner />}>
            {params.then(({ id }) => <TaskFormLoader id={id} />)}
        </Suspense>
    );
}

async function TaskFormLoader({ id }: { id: string }) {
    if (id === "new") {
        return (
            <>
                <h1>New task</h1>
                <TaskForm />
            </>
        );
    }

    const parsedId = taskId.safeParse(id);
    if (!parsedId.success) notFound();

    const task = await caller.getTask({ id: parsedId.data });
    if (!task) notFound();

    return (
        <>
            <h1>Edit task</h1>
            <TaskForm task={{ id: parsedId.data, ...task }} />
        </>
    );
}
