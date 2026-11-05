import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import InfiniteTasks from "./InfiniteTasks";
import { TRPCReactProvider } from "@/trpc/client";

test("renders the server-supplied first page into HTML before browser effects", () => {
    const html = renderToString(
        <TRPCReactProvider>
            <InfiniteTasks firstPage={{
                items: [{
                    id: "019a0000-0000-7000-8000-000000000001",
                    title: "Server-rendered task",
                    createdAt: new Date("2026-11-04T12:00:00Z"),
                    completed: false,
                }],
                nextCursor: "019a0000-0000-7000-8000-000000000001",
            }} />
        </TRPCReactProvider>,
    );
    assert.match(html, /Server-rendered task/);
    assert.match(html, /Load more|Loading…/);
    assert.doesNotMatch(html, /No tasks yet/);
    assert.equal((html.match(/<li\b/g) ?? []).length, 1);
    assert.doesNotMatch(html, /class="h-px"/);
});
