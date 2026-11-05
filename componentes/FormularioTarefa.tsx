"use client";

import { entradaCriarTarefa, type EntradaCriarTarefa, type Tarefa } from "@/lib/schema-tarefa";
import { usarTRPC } from "@/trpc/cliente";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";

const classeCampo = "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base font-normal outline-none placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700";

interface PropriedadesFormularioTarefa {
    // Quando informada, o formulário edita esta tarefa.
    tarefa?: Tarefa
}

export default function FormularioTarefa(propriedades: PropriedadesFormularioTarefa) {
    const [titulo, definirTitulo] = useState<string>(propriedades.tarefa?.titulo ?? "");
    const [descricao, definirDescricao] = useState<string>(propriedades.tarefa?.descricao ?? "");
    const [erro, definirErro] = useState<string | undefined>();
    const [errosCampos, definirErrosCampos] = useState<z.core.$ZodFlattenedError<EntradaCriarTarefa>>()
    const trpc = usarTRPC();
    const roteador = useRouter();
    const clienteConsultas = useQueryClient();
    async function voltarParaLista() {
        // Atualiza até uma lista inativa antes de voltar às páginas em cache.
        await clienteConsultas.invalidateQueries({
            queryKey: trpc.listarTarefas.pathKey(),
            refetchType: "all",
        });
        roteador.push("/");
    }

    const criarTarefa = useMutation(trpc.criarTarefa.mutationOptions({
        onSuccess: voltarParaLista,
        onError: (erro) => definirErro(erro.message),
    }));
    const atualizarTarefa = useMutation(trpc.atualizarTarefa.mutationOptions({
        onSuccess: voltarParaLista,
        onError: (erro) => definirErro(erro.message),
    }));
    const salvando = criarTarefa.isPending || atualizarTarefa.isPending;

    function aoEnviar(evento: React.SubmitEvent<HTMLFormElement>) {
        evento.preventDefault();
        definirErro(undefined);

        const resultado = entradaCriarTarefa.safeParse({
            titulo,
            descricao: descricao || undefined
        });

        if (resultado.error) {
            return definirErrosCampos(z.flattenError(resultado.error));
        }
        definirErrosCampos(undefined);

        // Enviar undefined permite limpar a descrição durante a edição.
        if (propriedades.tarefa) {
            atualizarTarefa.mutate({ id: propriedades.tarefa.id, ...resultado.data });
        } else {
            criarTarefa.mutate(resultado.data);
        }
    }

    return (
        <form onSubmit={aoEnviar} className="flex flex-col gap-5 rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
            {erro && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    {erro}
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Título
                    <input
                        type="text"
                        name="titulo"
                        minLength={1}
                        required={true}
                        placeholder="Ex.: Revisar o planejamento de marketing do trimestre"
                        value={titulo}
                        onChange={(evento) => definirTitulo(evento.currentTarget.value)}
                        className={classeCampo}
                    />
                </label>
                {errosCampos?.fieldErrors.titulo?.[0] && (
                    <p className="text-sm text-red-600">{errosCampos.fieldErrors.titulo[0]}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    <span>Descrição <span className="font-normal text-zinc-400">(opcional)</span></span>
                    <textarea
                        name="descricao"
                        rows={3}
                        required={false}
                        placeholder="Ex.: Adicionar as ações sugeridas pelo cliente"
                        value={descricao}
                        onChange={(evento) => definirDescricao(evento.currentTarget.value)}
                        className={`${classeCampo} resize-none`}
                    />
                </label>
                {errosCampos?.fieldErrors.descricao?.[0] && (
                    <p className="text-sm text-red-600">{errosCampos.fieldErrors.descricao[0]}</p>
                )}
            </div>

            <div className="-mx-6 mt-1 flex justify-end gap-2 border-t border-zinc-200 px-6 pt-5 dark:border-zinc-800">
                <Link
                    href="/"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Cancelar
                </Link>
                <button
                    disabled={salvando}
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {salvando ? "Salvando…" : propriedades.tarefa ? "Salvar" : "Criar"}
                </button>
            </div>
        </form>
    )
}