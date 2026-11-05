import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { roteadorAplicacao } from "./aplicacao";
import { tarefas } from "@/servidor/armazenamento";
import { entradaCriarTarefa } from "@/lib/schema-tarefa";

const chamador = roteadorAplicacao.createCaller({ tarefas });
beforeEach(() => tarefas.clear());

async function preencher(quantidade: number) {
    const resultado = [];
    for (let i = 0; i < quantidade; i++) {
        resultado.push(await chamador.criarTarefa({ titulo: `Tarefa ${i}` }));
    }
    return resultado;
}

test("pagina 45 tarefas sem duplicatas e encerra na última página", async () => {
    const criadas = await preencher(45);
    const primeira = await chamador.listarTarefas({});
    const segunda = await chamador.listarTarefas({ cursor: primeira.proximoCursor });
    const terceira = await chamador.listarTarefas({ cursor: segunda.proximoCursor });
    assert.deepEqual([primeira.itens.length, segunda.itens.length, terceira.itens.length], [20, 20, 5]);
    assert.equal(terceira.proximoCursor, undefined);
    assert.deepEqual([...primeira.itens, ...segunda.itens, ...terceira.itens].map(t => t.id), criadas.map(t => t.id).sort());
});

test("continua após excluir o cursor e tarefas anteriores", async () => {
    const criadas = await preencher(7);
    const primeira = await chamador.listarTarefas({ limite: 3, cursor: null });
    await chamador.excluirTarefa({ id: primeira.proximoCursor! });
    await chamador.excluirTarefa({ id: criadas[0].id });
    const proxima = await chamador.listarTarefas({ limite: 3, cursor: primeira.proximoCursor });
    assert.deepEqual(proxima.itens.map(t => t.id), criadas.slice(3, 6).map(t => t.id));
    assert.equal(new Set([...primeira.itens, ...proxima.itens].map(t => t.id)).size, 6);
});

test("trata páginas vazias e com o tamanho exato", async () => {
    assert.deepEqual(await chamador.listarTarefas({}), { itens: [], proximoCursor: undefined });
    await preencher(20);
    const pagina = await chamador.listarTarefas({});
    assert.equal(pagina.itens.length, 20);
    assert.equal(pagina.proximoCursor, undefined);
});

test("rejeita limites e cursores inválidos", async () => {
    for (const limite of [0, -1, 101, 1.5]) {
        await assert.rejects(chamador.listarTarefas({ limite }), { code: "BAD_REQUEST" });
    }
    await assert.rejects(chamador.listarTarefas({ cursor: "invalido" }), { code: "BAD_REQUEST" });
});

test("rejeita títulos só com espaços na criação e edição e remove espaços nas pontas", async () => {
    for (const titulo of ["", "   ", "\t\n"]) {
        assert.equal(entradaCriarTarefa.safeParse({ titulo }).success, false);
        await assert.rejects(chamador.criarTarefa({ titulo }), { code: "BAD_REQUEST" });
    }
    const criadas = await chamador.criarTarefa({ titulo: "  Título válido  " });
    assert.equal(criadas.titulo, "Título válido");
    await assert.rejects(chamador.atualizarTarefa({ id: criadas.id, titulo: "   " }), { code: "BAD_REQUEST" });
    assert.equal((await chamador.obterTarefa({ id: criadas.id })).titulo, "Título válido");
    const atualizada = await chamador.atualizarTarefa({ id: criadas.id, titulo: "  Atualizada  " });
    assert.equal(atualizada.titulo, "Atualizada");
});

// Verifica os contratos públicos localizados, incluindo mensagens de erro.
test("usa campos e mensagens em português na API e na validação", async () => {
    const criada = await chamador.criarTarefa({ titulo: "Revisar proposta", descricao: "Verificar os requisitos" });
    assert.equal(criada.titulo, "Revisar proposta");
    assert.equal(criada.descricao, "Verificar os requisitos");
    assert.ok(criada.dataCriacao instanceof Date);
    assert.equal(criada.concluida, false);
    assert.equal("title" in criada, false);
    const resultado = entradaCriarTarefa.safeParse({ titulo: "   " });
    assert.equal(resultado.success, false);
    if (!resultado.success) assert.equal(resultado.error.issues[0].message, "O título é obrigatório.");
    await chamador.excluirTarefa({ id: criada.id });
    await assert.rejects(chamador.obterTarefa({ id: criada.id }), {
        code: "NOT_FOUND",
        message: `Tarefa com id ${criada.id} não encontrada.`,
    });
});
