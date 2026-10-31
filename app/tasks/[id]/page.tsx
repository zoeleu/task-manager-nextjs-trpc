import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Spinner from "@/components/Spinner";
import TaskForm from "@/components/TaskForm";
import { taskId } from "@/lib/task-schema";
import { caller } from "@/trpc/server";
import { TRPCError } from "@trpc/server";

export default function TaskPage({ params }: PageProps<"/tasks/[id]">) {
    return (
        <>
            <Link
                href="/"
                className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
                <ArrowLeft className="size-4" />
                All tasks
            </Link>
            <Suspense fallback={<Spinner />}>
                {params.then(({ id }) => <TaskFormLoader id={id} />)}
            </Suspense>
        </>
    );
}

async function TaskFormLoader({ id }: { id: string }) {
    if (id === "new") {
        return (
            <>
                <h1 className="mb-6 text-2xl font-semibold tracking-tight">New task</h1>
                <TaskForm />
            </>
        );
    }

    const parsedId = taskId.safeParse(id);
    if (!parsedId.success) notFound();

    const task = await caller.getTask({ id: parsedId.data }).catch((error) => {
        if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
        throw error;
    });

    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit task</h1>
            <TaskForm task={{ id: parsedId.data, ...task }} />
        </>
    );
}
