"use client";

import type { Task as TaskData } from "@/lib/task-schema"
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
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
    const router = useRouter();
    const deleteTask = useMutation(trpc.deleteTask.mutationOptions({
        onSuccess: () => router.refresh(),
    }));

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

    return (
        <div className="flex items-start gap-3 py-2">
            <label className="flex flex-1 items-start gap-3">
                <input type="checkbox" checked={completed} onChange={handleCheckbox} className="mt-1" />
                <div className={completed ? "text-gray-400 line-through" : ""}>
                    <p>{title}</p>
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            </label>
            <Link href={`/tasks/${id}`} aria-label={`Edit "${title}"`}>
                <Pencil className="h-4 w-4" />
            </Link>
            <button
                type="button"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                aria-label={`Delete "${title}"`}
            >
                <Trash className="h-4 w-4" />
            </button>
        </div>
    )
}

export default Task;
