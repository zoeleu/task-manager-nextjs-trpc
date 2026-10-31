import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { createTaskInput, task, taskId, taskWithoutId, TaskWithoutId } from '@/lib/task-schema';
import { tasks } from '@/server/store';
import { v7 as uuidv7 } from 'uuid';
import { TRPCError } from '@trpc/server';


export const appRouter = createTRPCRouter({
    getTask: baseProcedure
        .output(taskWithoutId)
        .input(
            z.object({
                id: taskId
            })
        )
        .query((opts) => {
            const existing = tasks.get(opts.input.id);
            if (!existing)
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Task with id ${opts.input.id} not found.`
                })
            return existing;
        }),
    listTasks: baseProcedure
        .output(z.array(task))
        .query((opts) => {
            const tasks = Array.from(
                opts.ctx.tasks
                    .entries()
                    .map(v => {
                        return {
                            id: v[0],
                            ...v[1]
                        }
                    })
            )
            return tasks;
        }),
    createTask: baseProcedure
        .input(createTaskInput)
        .output(task)
        .mutation((opts) => {
            const id = uuidv7();
            const createdTask = {
                ...opts.input,
                createdAt: new Date(),
                completed: false,
            };
            opts.ctx.tasks.set(id, createdTask);
            return { ...createdTask, id };
        }),
    updateTask: baseProcedure
        .input(
            z.object({
                id: taskId,
            }).extend(taskWithoutId.omit({ createdAt: true }).partial().shape)
        )
        .output(task)
        .mutation((opts) => {
            const existing = tasks.get(opts.input.id);
            if (!existing)
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Task with id ${opts.input.id} not found.`
                })
            const updatedTask: TaskWithoutId = {
                ...existing,
                ...opts.input
            };
            tasks.set(opts.input.id, updatedTask);
            return {
                id: opts.input.id,
                ...updatedTask
            };
        }),
    deleteTask: baseProcedure
        .input(
            z.object({
                id: taskId
            })
        )
        .output(z.boolean())
        .mutation((opts) => {
            if (!tasks.delete(opts.input.id))
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Task with id ${opts.input.id} not found.`
                })
            return true;
        })
});

export type AppRouter = typeof appRouter;
