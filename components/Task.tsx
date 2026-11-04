"use client";

import type { Task as TaskData } from "@/lib/task-schema"
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface TaskProps {
    task: TaskData
    onDeleted: () => void
}

function Task(props: TaskProps) {
    const { id, title, description } = props.task;
    const completed = props.task.completed;
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const refreshTasks = () => queryClient.invalidateQueries({ queryKey: trpc.listTasks.pathKey() });
    const updateTask = useMutation(trpc.updateTask.mutationOptions({
        onSuccess: refreshTasks,
    }));
    const deleteTask = useMutation(trpc.deleteTask.mutationOptions({
        onSuccess: async () => {
            props.onDeleted();
            await refreshTasks();
        },
    }));

    function handleCheckbox(ev: React.ChangeEvent<HTMLInputElement>) {
        updateTask.mutate({ id, completed: ev.currentTarget.checked });
    }

    function handleDelete() {
        deleteTask.mutate({ id });
    }

    return (
        <div className="px-4 py-3">
            <div className="flex items-start gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={completed} disabled={updateTask.isPending || deleteTask.isPending} onChange={handleCheckbox} className="mt-1 size-4 shrink-0 accent-blue-600" />
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
            {updateTask.error && (
                <p role="alert" className="mt-1 pl-7 text-sm text-red-600">
                    Couldn&apos;t update this task: {updateTask.error.message}
                </p>
            )}
            {deleteTask.error && (
                <p role="alert" className="mt-1 pl-7 text-sm text-red-600">
                    Couldn&apos;t delete this task: {deleteTask.error.message}
                </p>
            )}
        </div>
    )
}

export default Task;
