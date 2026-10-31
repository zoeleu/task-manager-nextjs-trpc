"use client";

import { createTaskInput, type CreateTaskInput, type Task } from "@/lib/task-schema";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";

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
        <form onSubmit={handleSubmit}>
            {error && <p className="text-red-600">{error}</p>}

            <label>
                Title:
                <input
                    type="text"
                    name="title"
                    minLength={1}
                    required={true}
                    placeholder="e.g., Review Q3 marketing brief"
                    value={title}
                    onChange={(ev) => setTitle(ev.currentTarget.value)}
                />
            </label>
            {fieldErrors?.fieldErrors.title?.[0] && (
                <p className="text-sm text-red-600">{fieldErrors.fieldErrors.title[0]}</p>
            )}

            <label>
                Description:
                <input
                    type="text"
                    name="description"
                    required={false}
                    placeholder="e.g., Add action items from the client feedback email"
                    value={description}
                    onChange={(ev) => setDescription(ev.currentTarget.value)}
                />
            </label>
            {fieldErrors?.fieldErrors.description?.[0] && (
                <p className="text-sm text-red-600">{fieldErrors.fieldErrors.description[0]}</p>
            )}

            <button disabled={isPending} type="submit">{props.task ? "Save" : "Create"}</button>
        </form>
    )
}