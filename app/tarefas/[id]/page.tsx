import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import IndicadorCarregamento from "@/componentes/IndicadorCarregamento";
import FormularioTarefa from "@/componentes/FormularioTarefa";
import { idTarefa } from "@/lib/schema-tarefa";
import { chamador } from "@/trpc/servidor";
import { TRPCError } from "@trpc/server";

export default function PaginaTarefa({ params }: PageProps<"/tarefas/[id]">) {
    return (
        <>
            <Link
                href="/"
                className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
                <ArrowLeft className="size-4" />
                Todas as tarefas
            </Link>
            <Suspense fallback={<IndicadorCarregamento />}>
                {params.then(({ id }) => <CarregarFormularioTarefa id={id} />)}
            </Suspense>
        </>
    );
}

async function CarregarFormularioTarefa({ id }: { id: string }) {
    if (id === "nova") {
        return (
            <>
                <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nova tarefa</h1>
                <FormularioTarefa />
            </>
        );
    }

    const idValidado = idTarefa.safeParse(id);
    if (!idValidado.success) notFound();

    const tarefa = await chamador.obterTarefa({ id: idValidado.data }).catch((erro) => {
        if (erro instanceof TRPCError && erro.code === "NOT_FOUND") notFound();
        throw erro;
    });

    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold tracking-tight">Editar tarefa</h1>
            <FormularioTarefa tarefa={{ id: idValidado.data, ...tarefa }} />
        </>
    );
}
