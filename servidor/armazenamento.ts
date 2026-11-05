import type { IdTarefa, TarefaSemId } from '@/lib/schema-tarefa';

const globalArmazenamento = globalThis as unknown as { tarefas?: Map<IdTarefa, TarefaSemId> };
export const tarefas = globalArmazenamento.tarefas ?? (globalArmazenamento.tarefas = new Map<IdTarefa, TarefaSemId>());