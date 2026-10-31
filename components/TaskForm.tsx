"use client";

import { createTaskInput, type CreateTaskInput, type Task } from "@/lib/task-schema";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";

const inputClassName = "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base font-normal outline-none placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700";

interface TaskFormProps {
    // When given, the form edits this task instead of creating a new one.
    task?: Task
}

export default function TaskForm(props: TaskFormProps) {
    const [title, setTitle] = useState<string>(props.task?.title ?? "");
    const [description, setDescription] = useState<string>(props.task?.description ?? "");
    const [error, setError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<z.core.$ZodFlattenedError<CreateTaskInput>>()
    const trpc = useTRPC();
    const router = useRouter();

    const createTask = useMutation(trpc.createTask.mutationOptions({
        onSuccess: () => router.push("/"),
        onError: (error) => setError(error.message),
    }));
    const updateTask = useMutation(trpc.updateTask.mutationOptions({
        onSuccess: () => router.push("/"),
        onError: (error) => setError(error.message),
    }));
    const isPending = createTask.isPending || updateTask.isPending;

    function handleSubmit(ev: React.SubmitEvent<HTMLFormElement>) {
        ev.preventDefault();
        setError(undefined);

        const result = createTaskInput.safeParse({
            title,
            description: description || undefined
        });

        if (result.error) {
            return setFieldErrors(z.flattenError(result.error));
        }
        setFieldErrors(undefined);

        // An empty description is sent as `undefined`, which clears it when editing.
        if (props.task) {
            updateTask.mutate({ id: props.task.id, ...result.data });
        } else {
            createTask.mutate(result.data);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
            {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Title
                    <input
                        type="text"
                        name="title"
                        minLength={1}
                        required={true}
                        placeholder="e.g., Review Q3 marketing brief"
                        value={title}
                        onChange={(ev) => setTitle(ev.currentTarget.value)}
                        className={inputClassName}
                    />
                </label>
                {fieldErrors?.fieldErrors.title?.[0] && (
                    <p className="text-sm text-red-600">{fieldErrors.fieldErrors.title[0]}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    <span>Description <span className="font-normal text-zinc-400">(optional)</span></span>
                    <textarea
                        name="description"
                        rows={3}
                        required={false}
                        placeholder="e.g., Add action items from the client feedback email"
                        value={description}
                        onChange={(ev) => setDescription(ev.currentTarget.value)}
                        className={`${inputClassName} resize-none`}
                    />
                </label>
                {fieldErrors?.fieldErrors.description?.[0] && (
                    <p className="text-sm text-red-600">{fieldErrors.fieldErrors.description[0]}</p>
                )}
            </div>

            <div className="-mx-6 mt-1 flex justify-end gap-2 border-t border-zinc-200 px-6 pt-5 dark:border-zinc-800">
                <Link
                    href="/"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Cancel
                </Link>
                <button
                    disabled={isPending}
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? "Saving…" : props.task ? "Save" : "Create"}
                </button>
            </div>
        </form>
    )
}