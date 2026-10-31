'use client';

// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from '@/trpc/query-client';
import type { AppRouter } from '@/trpc/routers/_app';
import superjson from 'superjson';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    }
    // It's important to keep the client we already have,
    // so that when we use <Suspend fallback={...} />
    // our app doesn't get stuck in a loop: throwing away
    // the child component's state, which held the data
    // we fetched, fetching again, suspending,
    // throwing away the client, and so on...
    // Storing the client in the module stops React from
    // throwing away our client.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

function getUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        return 'http://localhost:3000';
    })();
    return `${base}/api/trpc`;
}

export function TRPCReactProvider(
    props: Readonly<{
        children: React.ReactNode;
    }>,
) {
    /**
     * @see getQueryClient
     */
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            // Links are like middleware in tRPC.
            // Before the request is sent, the links
            // modify the client <-> server data flow
            links: [
                // This link batches several requests
                // into a single HTTP request.
                httpBatchLink({
                    transformer: superjson,
                    url: getUrl(),
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}