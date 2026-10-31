"use client";

import type { Task as TaskData } from "@/lib/task-schema"
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TaskProps {
    task: TaskData
}

function Task(props: TaskProps) {
    const { id, title, description } = props.task;
    const [completed, setCompleted] = useState(props.task.completed);
    const trpc = useTRPC();
    const updateTask = useMutation(trpc.updateTask.mutationOptions());
    const [deleted, setDeleted] = useState(false);
    const deleteTask = useMutation(trpc.deleteTask.mutationOptions({
        onSuccess: () => setDeleted(true),
    }));
    const router = useRouter();

    // After showing the confirmation for a few seconds, refresh the
    // server-rendered list so the deleted row goes away.
    useEffect(() => {
        if (!deleted) return;
        const timeout = setTimeout(() => router.refresh(), 5000);
        return () => clearTimeout(timeout);
    }, [deleted, router]);

    function handleCheckbox(ev: React.ChangeEvent<HTMLInputElement>) {
        const checked = ev.currentTarget.checked;
        setCompleted(checked);
        updateTask.mutate(
            { id, completed: checked },
            { onError: () => setCompleted(!checked) },
        );
    }

    function handleDelete() {
        deleteTask.mutate({ id })
    }

    // Keep the row in place with a confirmation instead of removing it,
    // so the user sees the delete succeeded.
    if (deleted) {
        return (
            <p role="status" className="px-4 py-3 text-sm text-zinc-500">
                Deleted &ldquo;{title}&rdquo;.
            </p>
        )
    }

    return (
        <div className="px-4 py-3">
            <div className="flex items-start gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={completed} onChange={handleCheckbox} className="mt-1 size-4 shrink-0 accent-blue-600" />
                    <div className={`min-w-0 break-words ${completed ? "text-zinc-400 line-through" : ""}`}>
                        <p>{title}</p>
                        {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
                    </div>
                </label>
                <div className="flex shrink-0 gap-1">
                    <Link
                        href={`/tasks/${id}`}
                        aria-label={`Edit "${title}"`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <Pencil className="size-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteTask.isPending}
                        aria-label={`Delete "${title}"`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950"
                    >
                        <Trash className="size-4" />
                    </button>
                </div>
            </div>
            {deleteTask.error && (
                <p role="alert" className="mt-1 pl-7 text-sm text-red-600">
                    Couldn&apos;t delete this task: {deleteTask.error.message}
                </p>
            )}
        </div>
    )
}

export default Task;
