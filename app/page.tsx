import Tarefas from "@/componentes/Tarefas";
import { Suspense } from "react";
import IndicadorCarregamento from "@/componentes/IndicadorCarregamento";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Inicio() {
  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
        <Link
          href="/tarefas/nova"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Nova tarefa
        </Link>
      </header>
      <Suspense fallback={<IndicadorCarregamento />}>
        <Tarefas />
      </Suspense>
    </>
  );
}
