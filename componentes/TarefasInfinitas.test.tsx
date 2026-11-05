import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import TarefasInfinitas from "@/componentes/TarefasInfinitas";
import { ProvedorTRPCReact } from "@/trpc/cliente";

test("renderiza a primeira página do servidor no HTML antes dos efeitos do navegador", () => {
    const html = renderToString(
        <ProvedorTRPCReact>
            <TarefasInfinitas primeiraPagina={{
                itens: [{
                    id: "019a0000-0000-7000-8000-000000000001",
                    titulo: "Tarefa renderizada no servidor",
                    dataCriacao: new Date("2026-11-04T12:00:00Z"),
                    concluida: false,
                }],
                proximoCursor: "019a0000-0000-7000-8000-000000000001",
            }} />
        </ProvedorTRPCReact>,
    );
    assert.match(html, /Tarefa renderizada no servidor/);
    assert.match(html, /Carregar mais|Carregando…/);
    assert.doesNotMatch(html, /Nenhuma tarefa ainda/);
    assert.equal((html.match(/<li\b/g) ?? []).length, 1);
    assert.doesNotMatch(html, /class="h-px"/);
});
