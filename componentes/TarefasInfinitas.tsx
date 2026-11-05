"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { RoteadorAplicacao } from "@/trpc/roteadores/aplicacao";
import { usarTRPC } from "@/trpc/cliente";
import Tarefa from "@/componentes/Tarefa";

type PaginaTarefa = inferRouterOutputs<RoteadorAplicacao>["listarTarefas"];

export default function TarefasInfinitas({ primeiraPagina }: { primeiraPagina: PaginaTarefa }) {
    const trpc = usarTRPC();
    const ultimaTarefa = useRef<HTMLLIElement>(null);
    const [aviso, definirAviso] = useState("");
    const consulta = useInfiniteQuery(trpc.listarTarefas.infiniteQueryOptions(
        { limite: 30 },
        {
            getNextPageParam: pagina => pagina.proximoCursor,
            // Revalida ao voltar, inclusive se o Next reutilizar uma página pré-carregada.
            staleTime: 0,
            // A primeira página vem do servidor para que as tarefas apareçam no HTML.
            initialData: { pages: [primeiraPagina], pageParams: [null] },
        },
    ));
    const { fetchNextPage: carregarProximaPagina, hasNextPage: temProximaPagina, isFetching: carregando, isError: temErro } = consulta;

    const tarefas = consulta.data.pages.flatMap(pagina => pagina.itens);
    const idUltimaTarefa = tarefas.at(-1)?.id;

    useEffect(() => {
        if (!ultimaTarefa.current || !temProximaPagina || carregando || temErro ||
            typeof IntersectionObserver === "undefined") return;
        let observador: IntersectionObserver;
        const observar = () => {
            observador?.disconnect();
            observador = new IntersectionObserver(([entrada]) => {
                if (entrada.isIntersecting) void carregarProximaPagina({ cancelRefetch: false });
            }, {
                // Carrega quando o topo da última tarefa chega a 1vh abaixo da janela.
                // rootMargin aceita pixels: recalculamos ao redimensionar.
                rootMargin: `0px 0px ${window.innerHeight / 100}px 0px`,
            });
            observador.observe(ultimaTarefa.current!);
        };
        observar();
        window.addEventListener("resize", observar);
        return () => {
            observador.disconnect();
            window.removeEventListener("resize", observar);
        };
    }, [carregarProximaPagina, temProximaPagina, carregando, temErro, idUltimaTarefa]);

    return (
        <div>
            <p role="status" className="mb-3 text-sm text-zinc-500">{aviso}</p>
            {tarefas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
                    Nenhuma tarefa ainda. Crie uma para começar.
                </p>
            ) : (
                <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {tarefas.map(tarefa => (
                        <li key={tarefa.id} ref={tarefa.id === idUltimaTarefa ? ultimaTarefa : undefined}>
                            <Tarefa tarefa={tarefa} aoExcluir={() => definirAviso(`Tarefa excluída: “${tarefa.titulo}”.`)} />
                        </li>
                    ))}
                </ul>
            )}
            {temErro && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    Não foi possível carregar as tarefas: {consulta.error.message}
                </p>
            )}
            {(temProximaPagina || temErro) && (
                <button
                    type="button"
                    disabled={carregando}
                    onClick={() => {
                        if (consulta.isFetchNextPageError || !temErro) {
                            void carregarProximaPagina({ cancelRefetch: false });
                        } else {
                            void consulta.refetch();
                        }
                    }}
                    className="mt-3 rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
                >
                    {carregando ? "Carregando…" : temErro ? "Tentar novamente" : "Carregar mais"}
                </button>
            )}
            {!temProximaPagina && tarefas.length > 0 && (
                <p className="mt-3 text-center text-sm text-zinc-500">Todas as tarefas foram carregadas.</p>
            )}
        </div>
    );
}
