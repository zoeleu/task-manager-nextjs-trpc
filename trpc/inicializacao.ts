import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { tarefas } from '@/servidor/armazenamento';

// O contexto disponibiliza as tarefas a cada requisição tRPC.
export const criarContextoTRPC = async (opcoes: { headers: Headers }) => {
    void opcoes;
    // A autenticação poderia ser implementada aqui.
    return { tarefas };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof criarContextoTRPC>>>()
    .create({
        // Preserva Date, Map e outras estruturas na serialização.
        // https://trpc.io/docs/server/data-transformers
        transformer: superjson,
    });

// Utilitários para definir roteadores e procedimentos.
export const criarRoteadorTRPC = t.router;
export const criarFabricaChamadas = t.createCallerFactory;
export const procedimentoBase = t.procedure;