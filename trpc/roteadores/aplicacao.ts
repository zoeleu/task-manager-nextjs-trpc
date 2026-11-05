import { z } from 'zod';
import { procedimentoBase, criarRoteadorTRPC } from '@/trpc/inicializacao';
import { entradaCriarTarefa, tarefa, idTarefa, tarefaSemId, TarefaSemId } from '@/lib/schema-tarefa';
import { tarefas } from '@/servidor/armazenamento';
import { v7 as uuidv7 } from 'uuid';
import { TRPCError } from '@trpc/server';


export const roteadorAplicacao = criarRoteadorTRPC({
    obterTarefa: procedimentoBase
        .output(tarefaSemId)
        .input(
            z.object({
                id: idTarefa
            })
        )
        .query((opcoes) => {
            const existente = tarefas.get(opcoes.input.id);
            if (!existente)
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Tarefa com id ${opcoes.input.id} não encontrada.`
                })
            return existente;
        }),
    listarTarefas: procedimentoBase
        .input(z.object({
            limite: z.number().int().min(1).max(100).default(20),
            cursor: idTarefa.nullish(),
        }))
        .output(z.object({ itens: z.array(tarefa), proximoCursor: idTarefa.nullish() }))
        .query(({ ctx: contexto, input: entrada }) => {
            // A comparação por ID mantém a paginação funcionando mesmo se a tarefa
            // usada como cursor na página anterior tiver sido excluída.
            const candidatas = Array.from(contexto.tarefas, ([id, valor]) => ({ ...valor, id }))
                .sort((a, b) => a.id.localeCompare(b.id))
                .filter(valor => !entrada.cursor || valor.id > entrada.cursor);
            const itens = candidatas.slice(0, entrada.limite);
            return {
                itens,
                proximoCursor: candidatas.length > entrada.limite ? itens.at(-1)?.id : undefined,
            };
        }),
    criarTarefa: procedimentoBase
        .input(entradaCriarTarefa)
        .output(tarefa)
        .mutation((opcoes) => {
            const id = uuidv7();
            const tarefaCriada = {
                ...opcoes.input,
                dataCriacao: new Date(),
                concluida: false,
            };
            opcoes.ctx.tarefas.set(id, tarefaCriada);
            return { ...tarefaCriada, id };
        }),
    atualizarTarefa: procedimentoBase
        .input(
            z.object({
                id: idTarefa,
            }).extend(tarefaSemId.omit({ dataCriacao: true }).partial().shape)
        )
        .output(tarefa)
        .mutation((opcoes) => {
            const existente = tarefas.get(opcoes.input.id);
            if (!existente)
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Tarefa com id ${opcoes.input.id} não encontrada.`
                })
            const tarefaAtualizada: TarefaSemId = {
                ...existente,
                ...opcoes.input
            };
            tarefas.set(opcoes.input.id, tarefaAtualizada);
            return {
                id: opcoes.input.id,
                ...tarefaAtualizada
            };
        }),
    excluirTarefa: procedimentoBase
        .input(
            z.object({
                id: idTarefa
            })
        )
        .output(z.boolean())
        .mutation((opcoes) => {
            if (!tarefas.delete(opcoes.input.id))
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Tarefa com id ${opcoes.input.id} não encontrada.`
                })
            return true;
        })
});

export type RoteadorAplicacao = typeof roteadorAplicacao;
