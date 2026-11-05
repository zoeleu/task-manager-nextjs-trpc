"use client";

import type { Tarefa as DadosTarefa } from "@/lib/schema-tarefa"
import { usarTRPC } from "@/trpc/cliente";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface PropriedadesTarefa {
    tarefa: DadosTarefa
    aoExcluir: () => void
}

function Tarefa(propriedades: PropriedadesTarefa) {
    const { id, titulo, descricao } = propriedades.tarefa;
    const concluida = propriedades.tarefa.concluida;
    const trpc = usarTRPC();
    const clienteConsultas = useQueryClient();
    const recarregarTarefas = () => clienteConsultas.invalidateQueries({ queryKey: trpc.listarTarefas.pathKey() });
    const atualizarTarefa = useMutation(trpc.atualizarTarefa.mutationOptions({
        onSuccess: recarregarTarefas,
    }));
    const excluirTarefa = useMutation(trpc.excluirTarefa.mutationOptions({
        onSuccess: async () => {
            propriedades.aoExcluir();
            await recarregarTarefas();
        },
    }));

    function aoAlternarConclusao(evento: React.ChangeEvent<HTMLInputElement>) {
        atualizarTarefa.mutate({ id, concluida: evento.currentTarget.checked });
    }

    function aoExcluirTarefa() {
        excluirTarefa.mutate({ id });
    }

    return (
        <div className="px-4 py-3">
            <div className="flex items-start gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={concluida} disabled={atualizarTarefa.isPending || excluirTarefa.isPending} onChange={aoAlternarConclusao} className="mt-1 size-4 shrink-0 accent-blue-600" />
                    <div className={`min-w-0 break-words ${concluida ? "text-zinc-400 line-through" : ""}`}>
                        <p>{titulo}</p>
                        {descricao && <p className="mt-0.5 text-sm text-zinc-500">{descricao}</p>}
                    </div>
                </label>
                <div className="flex shrink-0 gap-1">
                    <Link
                        href={`/tarefas/${id}`}
                        aria-label={`Editar "${titulo}"`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <Pencil className="size-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={aoExcluirTarefa}
                        disabled={excluirTarefa.isPending}
                        aria-label={`Excluir "${titulo}"`}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950"
                    >
                        <Trash className="size-4" />
                    </button>
                </div>
            </div>
            {atualizarTarefa.error && (
                <p role="alert" className="mt-1 pl-7 text-sm text-red-600">
                    Não foi possível atualizar esta tarefa: {atualizarTarefa.error.message}
                </p>
            )}
            {excluirTarefa.error && (
                <p role="alert" className="mt-1 pl-7 text-sm text-red-600">
                    Não foi possível excluir esta tarefa: {excluirTarefa.error.message}
                </p>
            )}
        </div>
    )
}

export default Tarefa;
