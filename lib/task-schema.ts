import { z } from 'zod';

// The type of each task, containing basic information.
export const taskWithoutId = z.object({
    title: z.string().trim().min(1, 'Title is required.').max(80),
    description: z.string().min(1).max(300).optional(),
    createdAt: z.date(),
    completed: z.boolean()
})
export const taskId = z.uuidv7();
export const task = taskWithoutId.extend({
    id: taskId
})
// Fields the client sends when creating a task
export const createTaskInput = taskWithoutId.omit({
    createdAt: true,
    completed: true
})
export type Task = z.infer<typeof task>;
export type TaskId = z.infer<typeof taskId>;
export type TaskWithoutId = z.infer<typeof taskWithoutId>;
export type CreateTaskInput = z.infer<typeof createTaskInput>;
