import { chamador } from "@/trpc/servidor";
import TarefasInfinitas from "@/componentes/TarefasInfinitas";

export default async function Tarefas() {
    const primeiraPagina = await chamador.listarTarefas({ limite: 30 });
    return <TarefasInfinitas primeiraPagina={primeiraPagina} />;
}
