import Link from "next/link";

export default function PaginaNaoEncontrada() {
    return (
        <section className="text-center">
            <h1 className="text-2xl font-semibold">Página não encontrada</h1>
            <p className="mt-3 text-zinc-500">A tarefa ou página solicitada não existe.</p>
            <Link href="/" className="mt-5 inline-block text-blue-600 hover:underline">
                Voltar para as tarefas
            </Link>
        </section>
    );
}
