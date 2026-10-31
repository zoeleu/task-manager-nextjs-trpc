"use client";

import { createTaskInput, type CreateTaskInput } from "@/lib/task-schema";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";

export default function CreateTaskForm() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [error, setError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<z.core.$ZodFlattenedError<CreateTaskInput>>()
    const trpc = useTRPC();
    const router = useRouter();


    const createTask = useMutation(trpc.createTask.mutationOptions({
        onSuccess: () => router.push("/"),
        onError: (error) => setError(error.message),
    }));

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

        createTask.mutate(result.data);
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

            <button disabled={createTask.isPending} type="submit">Create</button>
        </form>
    )
}