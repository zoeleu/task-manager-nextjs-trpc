"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { useTRPC } from "@/trpc/client";
import Task from "@/components/Task";

type TaskPage = inferRouterOutputs<AppRouter>["listTasks"];

export default function InfiniteTasks({ firstPage }: { firstPage: TaskPage }) {
    const trpc = useTRPC();
    const marker = useRef<HTMLDivElement>(null);
    const [notice, setNotice] = useState("");
    const query = useInfiniteQuery(trpc.listTasks.infiniteQueryOptions(
        { limit: 30 },
        {
            getNextPageParam: page => page.nextCursor,
            // Revalidate on return, including when Next reuses a prefetched page.
            staleTime: 0,
            // The server supplies the first page so its tasks appear in the HTML.
            initialData: { pages: [firstPage], pageParams: [null] },
        },
    ));
    const { fetchNextPage, hasNextPage, isFetching, isError } = query;

    useEffect(() => {
        if (!marker.current || !hasNextPage || isFetching || isError ||
            typeof IntersectionObserver === "undefined") return;
        let observer: IntersectionObserver;
        const observe = () => {
            observer?.disconnect();
            observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false });
            }, {
                // rootMargin accepts pixels: convert 1vh and recalculate on resize.
                rootMargin: `0px 0px ${window.innerHeight / 100}px 0px`,
            });
            observer.observe(marker.current!);
        };
        observe();
        window.addEventListener("resize", observe);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", observe);
        };
    }, [fetchNextPage, hasNextPage, isFetching, isError]);

    const tasks = query.data.pages.flatMap(page => page.items);

    return (
        <div>
            <p role="status" className="mb-3 text-sm text-zinc-500">{notice}</p>
            {tasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
                    No tasks yet. Create one to get started.
                </p>
            ) : (
                <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {tasks.map(task => (
                        <li key={task.id}>
                            <Task task={task} onDeleted={() => setNotice(`Deleted “${task.title}”.`)} />
                        </li>
                    ))}
                </ul>
            )}
            <div ref={marker} className="h-px" aria-hidden="true" />
            {isError && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    Couldn&apos;t load tasks: {query.error.message}
                </p>
            )}
            {(hasNextPage || isError) && (
                <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => {
                        if (query.isFetchNextPageError || !isError) {
                            void fetchNextPage({ cancelRefetch: false });
                        } else {
                            void query.refetch();
                        }
                    }}
                    className="mt-3 rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
                >
                    {isFetching ? "Loading…" : isError ? "Try again" : "Load more"}
                </button>
            )}
            {!hasNextPage && tasks.length > 0 && (
                <p className="mt-3 text-center text-sm text-zinc-500">All tasks loaded.</p>
            )}
        </div>
    );
}
