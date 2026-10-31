import type { TaskId, TaskWithoutId } from '@/lib/task-schema';

const globalForStore = globalThis as unknown as { tasks?: Map<TaskId, TaskWithoutId> };
export const tasks = globalForStore.tasks ?? (globalForStore.tasks = new Map<TaskId, TaskWithoutId>());