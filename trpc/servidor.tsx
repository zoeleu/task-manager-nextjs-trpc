import 'server-only';

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import { cache } from 'react';
import { criarContextoTRPC } from './inicializacao';
import { criarClienteConsultas } from './cliente-consultas';
import { roteadorAplicacao } from './roteadores/aplicacao';

// Reutiliza o mesmo cliente de consultas durante uma única requisição.
export const obterClienteConsultas = cache(criarClienteConsultas);

export const trpc = createTRPCOptionsProxy({
    ctx: async () =>
        criarContextoTRPC({
            headers: await headers(),
        }),
    router: roteadorAplicacao,
    queryClient: obterClienteConsultas,
});

export const chamador = roteadorAplicacao.createCaller(async () =>
    criarContextoTRPC({ headers: await headers() }),
);