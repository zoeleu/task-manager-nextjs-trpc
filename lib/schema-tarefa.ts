import { z } from 'zod';

// Usa mensagens de validação em português no formulário e na API.
z.config(z.locales.pt());

// Schema com as informações básicas de cada tarefa.
export const tarefaSemId = z.object({
    titulo: z.string().trim().min(1, 'O título é obrigatório.').max(80),
    descricao: z.string().min(1).max(300).optional(),
    dataCriacao: z.date(),
    concluida: z.boolean()
})
export const idTarefa = z.uuidv7();
export const tarefa = tarefaSemId.extend({
    id: idTarefa
})
// Campos enviados pelo cliente ao criar uma tarefa.
export const entradaCriarTarefa = tarefaSemId.omit({
    dataCriacao: true,
    concluida: true
})
export type Tarefa = z.infer<typeof tarefa>;
export type IdTarefa = z.infer<typeof idTarefa>;
export type TarefaSemId = z.infer<typeof tarefaSemId>;
export type EntradaCriarTarefa = z.infer<typeof entradaCriarTarefa>;
