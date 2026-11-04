import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { appRouter } from "./_app";
import { tasks } from "@/server/store";
import { createTaskInput } from "@/lib/task-schema";

const caller = appRouter.createCaller({ tasks });
beforeEach(() => tasks.clear());

async function seed(count: number) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(await caller.createTask({ title: `Task ${i}` }));
    }
    return result;
}

test("paginates 45 tasks without duplicates and stops on the final page", async () => {
    const created = await seed(45);
    const first = await caller.listTasks({});
    const second = await caller.listTasks({ cursor: first.nextCursor });
    const third = await caller.listTasks({ cursor: second.nextCursor });
    assert.deepEqual([first.items.length, second.items.length, third.items.length], [20, 20, 5]);
    assert.equal(third.nextCursor, undefined);
    assert.deepEqual([...first.items, ...second.items, ...third.items].map(t => t.id), created.map(t => t.id).sort());
});

test("continues after deleting the cursor and earlier tasks", async () => {
    const created = await seed(7);
    const first = await caller.listTasks({ limit: 3, cursor: null });
    await caller.deleteTask({ id: first.nextCursor! });
    await caller.deleteTask({ id: created[0].id });
    const next = await caller.listTasks({ limit: 3, cursor: first.nextCursor });
    assert.deepEqual(next.items.map(t => t.id), created.slice(3, 6).map(t => t.id));
    assert.equal(new Set([...first.items, ...next.items].map(t => t.id)).size, 6);
});

test("handles empty and exact-size pages", async () => {
    assert.deepEqual(await caller.listTasks({}), { items: [], nextCursor: undefined });
    await seed(20);
    const page = await caller.listTasks({});
    assert.equal(page.items.length, 20);
    assert.equal(page.nextCursor, undefined);
});

test("rejects invalid limits and cursors", async () => {
    for (const limit of [0, -1, 101, 1.5]) {
        await assert.rejects(caller.listTasks({ limit }), { code: "BAD_REQUEST" });
    }
    await assert.rejects(caller.listTasks({ cursor: "invalid" }), { code: "BAD_REQUEST" });
});

test("rejects whitespace titles on create and update, and trims valid titles", async () => {
    for (const title of ["", "   ", "\t\n"]) {
        assert.equal(createTaskInput.safeParse({ title }).success, false);
        await assert.rejects(caller.createTask({ title }), { code: "BAD_REQUEST" });
    }
    const created = await caller.createTask({ title: "  Valid title  " });
    assert.equal(created.title, "Valid title");
    await assert.rejects(caller.updateTask({ id: created.id, title: "   " }), { code: "BAD_REQUEST" });
    assert.equal((await caller.getTask({ id: created.id })).title, "Valid title");
    const updated = await caller.updateTask({ id: created.id, title: "  Updated  " });
    assert.equal(updated.title, "Updated");
});
